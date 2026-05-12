import { useState, useEffect, useRef } from 'react';
import { certificateAPI } from '../services/api';

export function usePolling(taskId, { enabled = true, interval = 2000 } = {}) {
  const [status, setStatus]   = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [error, setError]     = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!taskId || !enabled) return;

    const poll = async () => {
      try {
        const res = await certificateAPI.pollStatus(taskId);
        const { status: s, record_id, error: errMsg } = res.data;
        setStatus(s);
        if (s === 'DONE')  { setRecordId(record_id); clearInterval(timerRef.current); }
        if (s === 'ERROR') { setError(errMsg || 'Processing failed.'); clearInterval(timerRef.current); }
      } catch {
        setError('Lost connection. Please refresh.');
        clearInterval(timerRef.current);
      }
    };

    poll();
    timerRef.current = setInterval(poll, interval);

    return () => clearInterval(timerRef.current);
  }, [taskId, enabled, interval]);

  return { status, recordId, error };
}
