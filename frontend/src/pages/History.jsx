import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { certificateAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const STATUS_COLOR = {
  GENUINE:    'var(--accent-teal)',
  SUSPICIOUS: 'var(--accent-amber)',
  FAKE:       'var(--accent-red)',
};

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function History() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateAPI.getAll({ limit: 100 })
      .then(res => setRecords(res.data.records || []))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}
        >
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 400,
              margin: '0 0 6px',
              color: 'var(--text-primary)',
            }}>
              Verification History
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>
              All uploaded certificates and results
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              padding: '10px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Logout
          </motion.button>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
            Loading…
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
            No verifications yet.
          </div>
        ) : (
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="visible"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {records.map((rec, i) => (
              <motion.div
                key={rec.id}
                variants={fadeUp}
                onClick={() => navigate(`/report/${rec.id}`)}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                whileHover={{ background: 'var(--bg-deep)' }}
              >
                <div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}>
                    {rec.original_filename || rec.filename}
                  </p>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                  }}>
                    {new Date(rec.submitted_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: STATUS_COLOR[rec.status] || 'var(--text-tertiary)',
                }}>
                  {rec.status}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  minWidth: '60px',
                  textAlign: 'right',
                }}>
                  {Math.round(rec.confidence_score * 100)}%
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-tertiary)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: '40px', textAlign: 'center' }}
        >
          <NavLink to="/" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}>
            ← Back to upload
          </NavLink>
        </motion.div>
      </div>
    </div>
  );
}
