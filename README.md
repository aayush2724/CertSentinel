# CertSentinel | MedVerify Suite

CertSentinel (branded as **MedVerify Suite**) is a high-fidelity, autonomous medical document verification platform. It leverages neural analysis, OCR, and blockchain-inspired audit trails to validate the integrity of clinical reports, prescriptions, and radiology scans.

## 🚀 Quick Start (Docker)

The fastest way to get the full stack running is via Docker Compose:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Database**: PostgreSQL (Internal)
- **Broker**: Redis (Internal)

---

## 🛠 Manual Development Setup

### 1. Backend (Flask + Celery)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
python run.py
```

To start the background worker:
```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗 Architecture

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Three.js (R3F).
- **Backend**: Flask REST API, PostgreSQL (SQLAlchemy), Celery, Redis.
- **AI/ML**: Neural analysis engine for document tampering detection and OCR validation.
- **Security**: JWT-based authentication, Rate Limiting, and strict MIME-type verification.

## 📁 Project Structure

```text
CertSentinel/
├── backend/            # Flask REST API & ML Services
├── frontend/           # React SPA (High-Fidelity UI)
├── shared/             # Shared schemas and utilities
├── docker-compose.yml  # Full-stack orchestration
└── docs/               # Technical documentation
```

## 🛡 Security & Compliance

- **Audit Trail**: Every verification is logged with high-precision timestamps and model versions.
- **Explainable AI**: Detailed reasoning engine for forensic verdicts.
- **Sanitization**: Path traversal protection and UUID-prefixed file handling.
- **Validation**: Multi-layer document integrity checks before ingestion.
