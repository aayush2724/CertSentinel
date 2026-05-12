import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import DataParticles from '../components/3d/DataParticles';
import { certificateAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const STATUS_COLOR = {
  GENUINE:    'var(--accent-teal)',
  SUSPICIOUS: 'var(--accent-amber)',
  FAKE:       'var(--accent-red)',
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview',     icon: 'M3 13l4-4 4 4 6-6' },
  { to: '/history',   label: 'Certificates', icon: 'M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
  { to: '/',          label: 'Verify',       icon: 'M9 12l2 2 4-4' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      certificateAPI.getStats(),
      certificateAPI.getAll({ limit: 12 }),
    ]).then(([statsRes, recsRes]) => {
      setStats(statsRes.data);
      setRecords(recsRes.data.records || []);
      setChartData(statsRes.data.trend_30d || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const METRIC_CARDS = stats ? [
    { label: 'Total Verified',      value: stats.total || 0,                  suffix: '' },
    { label: 'Fake Detected',        value: stats.fake_count || 0,             suffix: '' },
    { label: 'Avg Confidence',       value: `${Math.round((stats.avg_confidence || 0) * 100)}`,  suffix: '%' },
    { label: 'Avg Processing',       value: stats.avg_processing_ms || 0,      suffix: 'ms' },
  ] : [];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── 3D Particle Background ── */}
      <div style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'transparent' }}
          frameloop="always">
          <Suspense fallback={null}>
            <DataParticles />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        padding: '32px 0',
      }}>
        {/* Wordmark */}
        <div style={{ padding: '0 24px 32px' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '14px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: 0,
          }}>
            CertSentinel
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              textDecoration: 'none', marginBottom: '2px',
              background: isActive ? 'var(--bg-deep)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px', fontFamily: 'var(--font-body)',
              transition: 'background 0.15s',
            })}>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '24px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600, flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: '13px',
              color: 'var(--text-primary)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.email || 'Admin'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {user?.role || 'admin'}
            </p>
          </div>
          <button onClick={handleLogout} title="Logout" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '4px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        marginLeft: '240px', flex: 1,
        padding: '48px 48px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <motion.div variants={stagger} initial="initial" animate="animate">

          {/* Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '32px',
              fontWeight: 400, margin: '0 0 6px',
              color: 'var(--text-primary)',
            }}>
              Overview
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* ── Metric Cards ── */}
          {!loading && (
            <motion.div variants={stagger}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {METRIC_CARDS.map(({ label, value, suffix }) => (
                <MetricCard key={label} label={label} value={value} suffix={suffix} />
              ))}
            </motion.div>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Chart ── */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px 32px',
            marginBottom: '40px',
          }}>
            <p style={{
              margin: '0 0 4px', fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: 'var(--text-tertiary)',
            }}>
              Verification Trend — 30 days
            </p>
            <p style={{
              margin: '0 0 24px', fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              Genuine, suspicious, and fake detections over time
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                  axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '8px', fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                  }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="genuine"    stroke="var(--accent-teal)"  strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="suspicious" stroke="var(--accent-amber)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="fake"       stroke="var(--accent-red)"   strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
              {[['Genuine', 'var(--accent-teal)'], ['Suspicious', 'var(--accent-amber)'], ['Fake', 'var(--accent-red)']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '2px', background: color, borderRadius: '1px' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Recent Verifications ── */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
              <p style={{
                margin: 0, fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '0.15em',
                color: 'var(--text-tertiary)',
              }}>
                Recent Verifications
              </p>
            </div>

            <motion.div variants={stagger} initial="initial" animate="animate">
              {loading && [1,2,3,4,5].map(i => (
                <div key={i} style={{
                  padding: '16px 28px', borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: '16px', alignItems: 'center',
                }}>
                  <div style={{ height: '14px', width: '180px', background: 'var(--border)', borderRadius: '4px' }} />
                  <div style={{ height: '14px', width: '80px', background: 'var(--border)', borderRadius: '4px', marginLeft: 'auto' }} />
                </div>
              ))}

              {!loading && records.map((rec, i) => (
                <motion.div key={rec.id} variants={fadeUp}
                  onClick={() => navigate(`/report/${rec.id}`)}
                  style={{
                    padding: '14px 28px',
                    borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  whileHover={{ background: 'var(--bg-deep)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: '14px', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {rec.original_filename || rec.filename}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {new Date(rec.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusBadge status={rec.status} />
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-tertiary)',
                    minWidth: '48px', textAlign: 'right' }}>
                    {Math.round(rec.confidence_score * 100)}%
                  </p>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-tertiary)" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </motion.div>
              ))}

              {!loading && records.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center',
                  color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  No verifications yet.
                </div>
              )}
            </motion.div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, suffix }) {
  return (
    <motion.div variants={fadeUp} style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
    }}>
      <p style={{
        margin: '0 0 8px', fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.15em',
        color: 'var(--text-tertiary)',
      }}>
        {label}
      </p>
      <p style={{
        margin: 0, fontFamily: 'var(--font-display)',
        fontSize: '36px', fontWeight: 400, lineHeight: 1,
        color: 'var(--text-primary)',
      }}>
        {value}<span style={{ fontSize: '16px', color: 'var(--text-tertiary)', marginLeft: '2px' }}>{suffix}</span>
      </p>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || 'var(--text-tertiary)';
  return (
    <span style={{
      fontSize: '11px', fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color, padding: '4px 10px',
      border: `1px solid ${color}`,
      borderRadius: '100px',
      opacity: 0.9, flexShrink: 0,
    }}>
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '24px',
    }}>
      <div style={{ height: '10px', width: '80px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px' }} />
      <div style={{ height: '32px', width: '60px', background: 'var(--border)', borderRadius: '4px' }} />
    </div>
  );
}
