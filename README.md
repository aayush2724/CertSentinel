# CertSentinel – Client-Server Restructure

The project has been restructured into a decoupled client-server architecture for better maintainability and scalability.

## New Structure

```text
CertSentinel-main (2)/
├── client/                # Standalone Frontend (Static HTML/CSS/JS)
│   ├── index.html         # Main verification page
│   ├── history.html       # Verification history page
│   ├── report.html        # Detailed report page
│   ├── css/
│   │   └── style.css      # Shared styles
│   └── js/
│       ├── main.js        # Logic for index page
│       ├── history.js     # Logic for history page
│       └── report.js      # Logic for report page
│
└── server/                # Python REST API (Flask)
    ├── app/               # Flask application package
    ├── database/          # Database handlers (SQLite)
    ├── ml/                # Machine Learning models and training
    ├── preprocessing/     # Document preprocessing logic
    ├── utils/             # OCR and analysis utilities
    ├── uploads/           # Temporary file storage
    ├── run.py             # Server entry point
    ├── requirements.txt   # Python dependencies (added flask-cors)
    └── .env.example       # Environment template
```

## How to Run

### 1. Start the Backend Server
```bash
cd server
pip install -r requirements.txt
# If spacy is needed: python -m spacy download en_core_web_sm
python run.py
```
The server will start on `http://localhost:5000`. It now supports CORS, allowing the standalone frontend to make requests.

### 2. Run the Frontend
Since the frontend is now purely static, you can simply open `client/index.html` in your browser. 

Alternatively, use a simple HTTP server:
```bash
cd client
python -m http.server 3000
```
Then visit `http://localhost:3000`.

### 3. Start the Background Worker (Optional but Recommended)
This project uses Celery and Redis for asynchronous document processing.

1. **Install Redis** (if not already installed):
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install redis-server
   sudo service redis-server start
   ```

2. **Start the Celery Worker**:
   ```bash
   cd server
   celery -A celery_worker.celery_app worker --loglevel=info
   ```

## Key Changes Made
1.  **React/Vite Migration**: Rebuilt the entire frontend from scratch using React and Vite, moving away from legacy Jinja2 templates to a modern Single Page Application (SPA).
2.  **Pure REST API**: Updated Flask routes to return JSON instead of rendering templates.
3.  **Asynchronous Processing**: Integrated **Celery + Redis** to handle long-running document analysis tasks in the background, preventing HTTP timeouts.
4.  **Separation of Concerns**: Refactored the core logic into a `VerificationService`, decoupling it from the Flask route handlers.
5.  **CORS Support**: Added `flask-cors` to the backend to allow requests from the decoupled frontend.
6.  **Absolute Imports**: Fixed Python imports in the `server/` directory to allow running `run.py` directly from the `server/` folder.
7.  **Structured Error Handling**: Implemented custom exception classes and a consistent error response format (codes, retryable flags) for both backend and frontend.
8.  **Full Audit Trail**: Enhanced the database schema to capture model versions, detailed decision logic, and high-precision timestamps for every verification.
9.  **Model Lifecycle Management**: Implemented model caching (singleton pattern) to prevent redundant disk loads and added configurable confidence thresholds for verdict tuning.
10. **API Security**: Added API Key authentication (`X-API-Key`) across all endpoints and implemented **Rate Limiting** (via Flask-Limiter) to protect against DoS attacks.
11. **Strict Input Validation**: Implemented multi-layered validation including file size limits (16MB), extension checks, and **MIME type verification** to prevent malicious uploads.
12. **Path Sanitization**: Hardened file handling with double-sanitization (secure filenames + UUID prefix) and path traversal protection.
13. **Data Validation Pipeline**: Added a rigorous validation layer in the service to handle corrupted images, empty files, and unreadable (low-text) documents before they reach the ML model.
14. **Batch Processing Portal**: Users can now upload and verify multiple medical documents simultaneously with parallel background task tracking.
15. **Real-Time Forensic Feedback**: Implemented a multi-step stepper and progress indicators to show exactly what the AI is doing (OCR, Preprocessing, Analysis).
16. **Explainable AI (XAI)**: Replaced black-box results with a detailed reasoning engine and technical logic breakdown for medical compliance.
17. **Compliance Reporting**: Added one-click PDF export for detailed verification reports and CSV export for the full audit log.
