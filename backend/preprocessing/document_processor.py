"""
Document Preprocessing Module
Handles noise removal, contrast adjustment, alignment correction,
and conversion of PDFs to images for further processing.
"""

import os

import cv2
import numpy as np
from PIL import Image

try:
    import pypdfium2 as pdfium  # PDF rendering
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


class DocumentProcessor:
    def __init__(self, dpi=300):
        self.dpi = dpi

    def preprocess(self, filepath: str) -> np.ndarray:
        """Main entry point: accepts image or PDF, returns processed numpy array."""
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            image = self._pdf_to_image(filepath)
        else:
            image = cv2.imread(filepath)

        if image is None:
            raise ValueError(f"Could not read file: {filepath}")

        image = self._resize(image)
        image = self._correct_skew(image)
        image = self._denoise(image)
        image = self._enhance_contrast(image)
        return image

    def _pdf_to_image(self, pdf_path: str) -> np.ndarray:
        """Convert first page of PDF to an OpenCV image."""
        if not PDF_SUPPORT:
            raise ImportError(
                "pypdfium2 is required for PDF support. Install with: pip install pypdfium2"
            )

        with pdfium.PdfDocument(pdf_path) as doc:
            page = doc[0]
            bitmap = page.render(scale=self.dpi / 72)
            pil_image = bitmap.to_pil()
            rgb_image = np.array(pil_image.convert("RGB"))
        return cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)

    def _resize(self, image: np.ndarray, max_dim: int = 2000) -> np.ndarray:
        """Resize very large images to keep processing fast."""
        h, w = image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)))
        return image

    def _correct_skew(self, image: np.ndarray) -> np.ndarray:
        """Detect and correct document skew using Hough line transform."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
        if lines is None:
            return image
        angles = []
        for line in lines[:20]:
            rho, theta = line[0]
            angle = np.degrees(theta) - 90
            if abs(angle) < 45:
                angles.append(angle)
        if not angles:
            return image
        median_angle = np.median(angles)
        if abs(median_angle) > 0.5:
            h, w = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC,
                                   borderMode=cv2.BORDER_REPLICATE)
        return image

    def _denoise(self, image: np.ndarray) -> np.ndarray:
        """Remove noise from document image."""
        return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)

    def _enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Apply CLAHE for adaptive contrast enhancement."""
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        enhanced = cv2.merge((l, a, b))
        return cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    def to_grayscale_bytes(self, image: np.ndarray) -> bytes:
        """Convert processed image to grayscale PNG bytes for OCR."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, buffer = cv2.imencode('.png', gray)
        return buffer.tobytes()
