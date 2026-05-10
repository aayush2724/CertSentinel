"""
Database Handler
SQLite-backed storage for certificate verification records.
Thread-safe via per-call connections (SQLite allows this in WAL mode).
"""
import sqlite3
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class DBHandler:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS verification_records (
                    id               INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename         TEXT    NOT NULL,
                    extracted_text   TEXT,
                    status           TEXT    NOT NULL,
                    confidence       REAL    NOT NULL,
                    reasons          TEXT,
                    extracted_fields TEXT,
                    model_version    TEXT,
                    decision_logic   TEXT,
                    submitted_at     TEXT    NOT NULL
                )
                """
            )
            conn.commit()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def save_result(
        self, filename: str, extracted_text: str, result: Dict[str, Any]
    ) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO verification_records
                    (filename, extracted_text, status, confidence,
                     reasons, extracted_fields, model_version, 
                     decision_logic, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    filename,
                    (extracted_text or "")[:5000],  # cap storage
                    result["status"],
                    result["confidence"],
                    json.dumps(result.get("reasons", [])),
                    json.dumps(result.get("extracted_info", {})),
                    result.get("model_version"),
                    json.dumps(result.get("decision_logic", {})),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            conn.commit()
            return cursor.lastrowid  # type: ignore[return-value]

    def get_record(self, record_id: int) -> Optional[Dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM verification_records WHERE id = ?", (record_id,)
            ).fetchone()
        return self._row_to_dict(row) if row else None

    def get_all_records(self, limit: int = 100) -> List[Dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM verification_records ORDER BY submitted_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> Dict:
        d = dict(row)
        d["reasons"] = json.loads(d.get("reasons") or "[]")
        d["extracted_fields"] = json.loads(d.get("extracted_fields") or "{}")
        d["decision_logic"] = json.loads(d.get("decision_logic") or "{}")
        return d
