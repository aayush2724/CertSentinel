import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import VerdictSphere from '../components/3d/VerdictSphere';
import ConfidenceMeter3D from '../components/3d/ConfidenceMeter3D';
import { certificateAPI } from '../services/api';

const STATUS_COLORS = {
  GENUINE:    { text: 'var(--accent-teal)',  bg: 'rgba(13,148,136,0.06)'  },
  SUSPICIOUS: { text: 'var(--accent-amber)', bg: 'rgba(217,119,6,0.06)'   },
  FAKE:       { text: 'var(--accent-red)',   bg: 'rgba(220,38,38,0.06)'   },
};

const STATUS_LABELS = {
  GENUINE:    'Likely Genuine',
  SUSPICIOUS: 'Suspicious',
  FAKE:       'Likely Fake',
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    certificateAPI.getById(id)
      .then(res => setRecord(res.data))
      .catch(() => setError('Certificate record not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = () => {
    certificateAPI.exportReport(id).then(res => {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certsentinel-report-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (loading) return <PageShell><LoadingSkeleton /></PageShell>;
  if (error)   return <PageShell><ErrorState message={error} onBack={() => navigate('/')} /></PageShell>;

  const { status, confidence_score, reasons, extracted_info, image_forensics,
          processing_time_ms } = record;
  const colors = STATUS_COLORS[status] || STATUS_COLORS.SUSPICIOUS;

  return (
    <PageShell>
      <motion.div variants={stagger} initial="initial" animate="animate"
        style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px' }}>

        {/* Back */}
        <motion.button variants={fadeUp} onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--text-tertiary)', padding: 0, marginBottom: '48px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to upload
        </motion.button>

        {/* ── Hero: sphere + verdict ── */}
        <motion.div variants={fadeUp} style={{
          display: 'grid', gridTemplateColumns: '280px 1fr',
          gap: '48px', alignItems: 'center', marginBottom: '64px',
        }}>
          <div>
            <div style={{ height: '280px' }}>
              <Canvas camera={{ position: [0, 0, 4], fov: 45 }}
                style={{ background: 'transparent' }}
                frameloop="always">
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.0} />
                <pointLight position={[-4, -4, -4]} intensity={0.3} />
                <Suspense fallback={null}>
                  <VerdictSphere verdict={status} />
                </Suspense>
              </Canvas>
            </div>
            {/* Confidence meter below sphere */}
            <div style={{ height: '120px', marginTop: '-12px' }}>
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ background: 'transparent' }}
                frameloop="demand">
                <ambientLight intensity={0.6} />
                <Suspense fallback={null}>
                  <ConfidenceMeter3D confidence={Math.round(confidence_score * 100)} verdict={status} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '11px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', margin: '0 0 16px',
            }}>
              Verification Result
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 5vw, 64px)',
              fontWeight: 400, lineHeight: 1.05,
              color: colors.text, margin: '0 0 12px',
            }}>
              {STATUS_LABELS[status]}
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '18px',
              color: 'var(--text-secondary)', margin: '0 0 8px',
            }}>
              {Math.round(confidence_score * 100)}% confidence
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--text-tertiary)',
            }}>
              Processed in {processing_time_ms}ms · Model {record.model_version || 'v1.0.0'}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '100px',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: 'var(--text-primary)', cursor: 'pointer',
                }}>
                Export Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: '#fff', cursor: 'pointer',
                }}>
                Verify Another
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Extracted Information ── */}
        <Section title="Extracted Information" variants={fadeUp}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0',
          }}>
            {[
              ['Doctor Name',         extracted_info?.doctor_name],
              ['Hospital',            extracted_info?.hospital_name],
              ['Date(s)',             extracted_info?.dates?.join(', ')],
              ['Registration No.',    extracted_info?.registration_numbers?.join(', ')],
            ].map(([label, val]) => (
              <div key={label} style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                <p style={{
                  margin: '0 0 4px', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--text-tertiary)',
                }}>
                  {label}
                </p>
                <p style={{
                  margin: 0, fontSize: '15px',
                  color: val ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontStyle: val ? 'normal' : 'italic',
                }}>
                  {val || 'Not detected'}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Fraud Detection Signals ── */}
        <Section title="Detection Signals" variants={fadeUp}>
          <motion.ul style={{ listStyle: 'none', padding: 0, margin: 0 }}
            variants={stagger} initial="initial" animate="animate">
            {(reasons || []).map((reason, i) => (
              <motion.li key={i} variants={fadeUp} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 20px',
                borderBottom: i < reasons.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="var(--accent-amber)" strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {reason}
                </span>
              </motion.li>
            ))}
            {(!reasons || reasons.length === 0) && (
              <li style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                No fraud signals detected.
              </li>
            )}
          </motion.ul>
        </Section>

        {/* ── Image Forensics ── */}
        <Section title="Image Forensics" variants={fadeUp}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
            background: 'var(--border)' }}>
            {[
              ['ELA Score',             image_forensics?.ela_score,              'lower is better', false],
              ['Copy-Move Detected',    image_forensics?.copy_move_detected ? 'Yes' : 'No', '', image_forensics?.copy_move_detected],
              ['Font Consistency',      image_forensics?.font_consistency_score, 'higher is better', false],
            ].map(([label, val, hint, warn]) => (
              <div key={label} style={{
                padding: '20px', background: 'var(--surface)',
              }}>
                <p style={{
                  margin: '0 0 8px', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--text-tertiary)',
                }}>
                  {label}
                </p>
                <p style={{
                  margin: '0 0 4px', fontSize: '22px',
                  fontFamily: 'var(--font-display)', fontWeight: 400,
                  color: warn ? 'var(--accent-red)' : 'var(--text-primary)',
                }}>
                  {typeof val === 'number' ? val.toFixed(2) : (val ?? '—')}
                </p>
                {hint && (
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {hint}
                  </p>
                )}
                {typeof val === 'number' && (
                  <div style={{
                    marginTop: '10px', height: '3px',
                    background: 'var(--border)', borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(val * 100, 100)}%` }}
                      transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: warn ? 'var(--accent-red)' : 'var(--accent-teal)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

      </motion.div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  );
}

function Section({ title, children, variants }) {
  return (
    <motion.div variants={variants} style={{ marginBottom: '40px' }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.15em',
        color: 'var(--text-tertiary)', margin: '0 0 12px',
      }}>
        {title}
      </p>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface)',
      }}>
        {children}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px' }}>
      {[280, 200, 140, 160].map((w, i) => (
        <div key={i} style={{
          height: '20px', width: `${w}px`, maxWidth: '100%',
          background: 'var(--border)', borderRadius: '4px',
          marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{message}</p>
      <button onClick={onBack} style={{
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: '100px', padding: '12px 24px', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: '14px',
      }}>
        Go Back
      </button>
    </div>
  );
}
