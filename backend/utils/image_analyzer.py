"""
Image Analyzer
Detects signs of image manipulation, compression artifacts, font inconsistencies,
and metadata anomalies that suggest a digitally forged certificate.
"""

import cv2
import numpy as np
from PIL import Image
import os
from typing import Dict, Any


class ImageAnalyzer:
    def analyze(self, filepath: str) -> Dict[str, Any]:
        """Run all image forensic checks. Returns features dict."""
        results = {}
        flags = []

        try:
            ela_score, ela_regions = self._error_level_analysis(filepath)
            results['ela_score'] = ela_score
            results['ela_suspicious_regions'] = ela_regions
            if ela_score > 0.15:
                flags.append(f'ELA indicates possible editing (score: {ela_score:.2f})')
        except Exception as e:
            results['ela_error'] = str(e)

        try:
            noise_score = self._noise_inconsistency(filepath)
            results['noise_inconsistency_score'] = noise_score
            if noise_score > 0.3:
                flags.append(f'Noise inconsistency detected (score: {noise_score:.2f})')
        except Exception as e:
            results['noise_error'] = str(e)

        try:
            copy_move = self._detect_copy_move(filepath)
            results['copy_move_detected'] = copy_move
            if copy_move:
                flags.append('Possible copy-move forgery detected')
        except Exception as e:
            results['copy_move_error'] = str(e)

        try:
            font_score = self._font_consistency(filepath)
            results['font_consistency_score'] = font_score
            if font_score < 0.6:
                flags.append(f'Font inconsistency detected (score: {font_score:.2f})')
        except Exception as e:
            results['font_error'] = str(e)

        try:
            meta_flags = self._check_metadata(filepath)
            results['metadata_flags'] = meta_flags
            flags.extend(meta_flags)
        except Exception as e:
            results['metadata_error'] = str(e)

        image_score = self._compute_image_score(flags)
        results['image_authenticity_score'] = image_score
        results['flags'] = flags
        return results

    def _error_level_analysis(self, filepath: str, quality: int = 90):
        """ELA: Re-saves image at known quality and computes difference."""
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            return 0.0, 0  # Skip ELA for PDFs

        original = Image.open(filepath).convert('RGB')
        from io import BytesIO
        buffer = BytesIO()
        original.save(buffer, format='JPEG', quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer).convert('RGB')

        orig_array = np.array(original, dtype=np.float32)
        resaved_array = np.array(resaved, dtype=np.float32)
        diff = np.abs(orig_array - resaved_array)

        # Amplify for visibility
        amplified = np.clip(diff * 10, 0, 255).astype(np.uint8)
        ela_score = float(np.mean(diff) / 255.0)

        # Count suspicious high-difference regions
        gray_diff = cv2.cvtColor(amplified, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray_diff, 50, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        large_regions = [c for c in contours if cv2.contourArea(c) > 500]

        return ela_score, len(large_regions)

    def _noise_inconsistency(self, filepath: str) -> float:
        """Divide image into blocks, compare noise levels — edits create noise discontinuities."""
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            return 0.0

        img = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0

        block_size = 64
        h, w = img.shape
        noise_values = []
        for y in range(0, h - block_size, block_size):
            for x in range(0, w - block_size, block_size):
                block = img[y:y + block_size, x:x + block_size]
                laplacian = cv2.Laplacian(block, cv2.CV_64F)
                noise_values.append(laplacian.var())

        if not noise_values:
            return 0.0
        noise_array = np.array(noise_values)
        # Coefficient of variation of noise across blocks
        return float(np.std(noise_array) / (np.mean(noise_array) + 1e-6))

    def _detect_copy_move(self, filepath: str) -> bool:
        """Simplified copy-move detection using ORB feature matching."""
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            return False

        img = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return False

        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(img, None)

        if des is None or len(des) < 10:
            return False

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des, des)
        # Self-matches (same descriptor index) are excluded
        real_matches = [m for m in matches if m.queryIdx != m.trainIdx]
        similar = [m for m in real_matches if m.distance < 30]
        return len(similar) > 50

    def _font_consistency(self, filepath: str) -> float:
        """Check for font size/weight consistency by analyzing text stroke widths."""
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            return 1.0

        img = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 1.0

        _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        dist = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
        nonzero = dist[dist > 0]

        if len(nonzero) < 100:
            return 1.0

        # Lower CV = more consistent strokes = more likely genuine
        cv = float(np.std(nonzero) / (np.mean(nonzero) + 1e-6))
        return max(0.0, 1.0 - min(cv / 2.0, 1.0))

    def _check_metadata(self, filepath: str) -> list:
        """Check EXIF/metadata for suspicious editing software markers."""
        flags = []
        try:
            img = Image.open(filepath)
            info = img.info or {}
            exif_data = img._getexif() if hasattr(img, '_getexif') and img._getexif() else {}
            software_tags = [271, 272, 305, 306]  # Make, Model, Software, DateTime
            editing_software = ['photoshop', 'gimp', 'paint', 'canva', 'snapseed', 'pixlr']

            for tag_id, value in (exif_data or {}).items():
                if tag_id in software_tags and isinstance(value, str):
                    for sw in editing_software:
                        if sw in value.lower():
                            flags.append(f'Editing software detected in metadata: {value}')
        except Exception:
            pass
        return flags

    def _compute_image_score(self, flags: list) -> float:
        """Returns 0-1 score. Higher = more likely genuine."""
        score = 1.0
        per_flag_deduction = 0.15
        score -= len(flags) * per_flag_deduction
        return max(0.0, round(score, 2))
