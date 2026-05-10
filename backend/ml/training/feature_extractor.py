"""
Feature Extraction for Training Data
Processes a folder of labelled certificates and outputs a CSV of features.

Usage:
    python -m ml.training.feature_extractor \
        --genuine data/genuine/ \
        --fake data/fake/ \
        --output data/features.csv
"""

import os
import csv
import argparse
import numpy as np
from preprocessing.document_processor import DocumentProcessor
from utils.ocr_engine import OCREngine
from utils.text_analyzer import TextAnalyzer
from utils.image_analyzer import ImageAnalyzer


FIELDNAMES = [
    'filename', 'label',
    'text_authenticity_score', 'image_authenticity_score',
    'has_dates', 'has_reg_number', 'has_hospital', 'has_doctor',
    'diagnosis_keyword_count', 'ela_score', 'noise_inconsistency_score',
    'copy_move_detected', 'font_consistency_score',
]


def process_file(filepath: str) -> dict:
    processor = DocumentProcessor()
    ocr = OCREngine()
    text_analyzer = TextAnalyzer()
    image_analyzer = ImageAnalyzer()

    processed = processor.preprocess(filepath)
    text = ocr.extract_text(processed)
    tf = text_analyzer.analyze(text)
    imf = image_analyzer.analyze(filepath)
    fields = tf.get('extracted_fields', {})

    return {
        'text_authenticity_score': tf.get('text_authenticity_score', 0),
        'image_authenticity_score': imf.get('image_authenticity_score', 0),
        'has_dates': int(bool(fields.get('dates'))),
        'has_reg_number': int(bool(fields.get('registration_numbers'))),
        'has_hospital': int(bool(fields.get('hospital_name'))),
        'has_doctor': int(bool(fields.get('doctor_name'))),
        'diagnosis_keyword_count': len(fields.get('diagnosis_keywords', [])),
        'ela_score': imf.get('ela_score', 0),
        'noise_inconsistency_score': imf.get('noise_inconsistency_score', 0),
        'copy_move_detected': int(imf.get('copy_move_detected', False)),
        'font_consistency_score': imf.get('font_consistency_score', 1),
    }


def extract_all(genuine_dir: str, fake_dir: str, output_csv: str):
    rows = []

    for label, folder in [(1, genuine_dir), (0, fake_dir)]:
        for fname in os.listdir(folder):
            filepath = os.path.join(folder, fname)
            if not os.path.isfile(filepath):
                continue
            print(f"Processing: {filepath}")
            try:
                feats = process_file(filepath)
                feats['filename'] = fname
                feats['label'] = label
                rows.append(feats)
            except Exception as e:
                print(f"  ERROR: {e}")

    os.makedirs(os.path.dirname(output_csv) or '.', exist_ok=True)
    with open(output_csv, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nExtracted {len(rows)} records to {output_csv}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--genuine', required=True)
    parser.add_argument('--fake', required=True)
    parser.add_argument('--output', default='data/features.csv')
    args = parser.parse_args()
    extract_all(args.genuine, args.fake, args.output)
