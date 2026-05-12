import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const confidencePercent = Math.round((confidence_score || 0) * 100);
  const docPreviewLabel = record.filename || `certsentinel-report-${id}`;

  return (
    <PageShell>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
          <motion.button
            variants={fadeUp}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant/70 hover:text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to upload
          </motion.button>

          <motion.section variants={fadeUp} className="glass-card rounded-[36px] p-6 lg:p-8 border-white/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,156,217,0.14),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(178,238,185,0.16),transparent_35%)]" />
            <div className="relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
              <div className="rounded-[30px] bg-white/70 border border-white/80 p-5 lg:p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-bold mb-2">Certificate verdict</p>
                    <h2 className="font-display-lg text-on-surface leading-none">{STATUS_LABELS[status]}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant/60 font-bold">Confidence</p>
                    <p className="text-4xl font-display-lg text-primary">{confidencePercent}%</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-3xl bg-surface/70 border border-white/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/55 font-bold">Processed</p>
                    <p className="text-lg font-semibold text-on-surface mt-2">{processing_time_ms} ms</p>
                  </div>
                  <div className="rounded-3xl bg-surface/70 border border-white/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/55 font-bold">Model</p>
                    <p className="text-lg font-semibold text-on-surface mt-2">{record.model_version || 'v1.0.0'}</p>
                  </div>
                  <div className="rounded-3xl bg-surface/70 border border-white/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/55 font-bold">Record</p>
                    <p className="text-lg font-semibold text-on-surface mt-2 truncate">{id}</p>
                  </div>
                </div>

                <div className="rounded-[30px] bg-white/65 border border-white/80 p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold">Report actions</p>
                      <p className="text-sm text-on-surface-variant/70">Export a JSON snapshot or run another verification.</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant/50 font-bold">{docPreviewLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport} className="px-5 py-3 rounded-full border border-outline-variant/60 bg-white text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors">
                      Export Report
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/')} className="px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                      Verify Another
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] bg-white/70 border border-white/80 p-5 lg:p-6 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-on-surface-variant/60 font-bold mb-2">Document snapshot</p>
                  <div className="rounded-[26px] bg-[linear-gradient(180deg,#fff,#f5f5f8)] border border-white/90 shadow-[0_18px_40px_rgba(0,0,0,0.08)] p-5">
                    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 mb-4">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold mb-2">Preview</p>
                      <p className="font-headline-md text-on-surface">{docPreviewLabel}</p>
                      <p className="text-sm text-on-surface-variant/70 mt-1">Document scanned and summarized into a structured forensic report.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        ['Status', STATUS_LABELS[status]],
                        ['Confidence', `${confidencePercent}%`],
                        ['Image Score', typeof image_forensics?.image_score === 'number' ? image_forensics.image_score.toFixed(2) : '—'],
                        ['Text Score', typeof image_forensics?.text_score === 'number' ? image_forensics.text_score.toFixed(2) : '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl bg-white/70 border border-white/80 px-4 py-3">
                          <span className="text-xs uppercase tracking-[0.25em] text-on-surface-variant/60 font-bold">{label}</span>
                          <span className="text-sm font-semibold text-on-surface">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] bg-secondary-container/35 border border-secondary/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-bold mb-2">Verdict note</p>
                  <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                    The current environment runs without system OCR, so the report is derived from the available verification metadata and image-side checks.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid lg:grid-cols-2 gap-6">
            <Section title="Extracted Information" variants={fadeUp}>
              <div className="grid sm:grid-cols-2">
                {[
                  ['Doctor Name', extracted_info?.doctor_name],
                  ['Hospital', extracted_info?.hospital_name],
                  ['Date(s)', extracted_info?.dates?.join(', ')],
                  ['Registration No.', extracted_info?.registration_numbers?.join(', ')],
                ].map(([label, val]) => (
                  <div key={label} className="p-5 border-b border-r border-outline-variant/50 last:border-b-0 sm:[&:nth-child(2n)]:border-r-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/55 font-bold mb-2">{label}</p>
                    <p className={`text-sm ${val ? 'text-on-surface' : 'text-on-surface-variant/55 italic'}`}>{val || 'Not detected'}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Detection Signals" variants={fadeUp}>
              <div className="divide-y divide-outline-variant/40">
                {(reasons || []).map((reason, i) => (
                  <div key={i} className="flex items-start gap-3 p-5">
                    <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                    <p className="text-sm text-on-surface-variant/80 leading-6">{reason}</p>
                  </div>
                ))}
                {(!reasons || reasons.length === 0) && (
                  <div className="p-5 text-sm text-on-surface-variant/60">No fraud signals detected.</div>
                )}
              </div>
            </Section>
          </div>

          <Section title="Image Forensics" variants={fadeUp}>
            <div className="grid md:grid-cols-3 gap-px bg-outline-variant/50">
              {[
                ['ELA Score', image_forensics?.ela_score, 'lower is better', false],
                ['Copy-Move Detected', image_forensics?.copy_move_detected ? 'Yes' : 'No', '', image_forensics?.copy_move_detected],
                ['Font Consistency', image_forensics?.font_consistency_score, 'higher is better', false],
              ].map(([label, val, hint, warn]) => (
                <div key={label} className="bg-white/80 p-5 lg:p-6">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/55 font-bold mb-3">{label}</p>
                  <p className={`text-2xl font-display-lg ${warn ? 'text-error' : 'text-on-surface'}`}>
                    {typeof val === 'number' ? val.toFixed(2) : (val ?? '—')}
                  </p>
                  {hint && <p className="mt-1 text-xs text-on-surface-variant/60">{hint}</p>}
                  {typeof val === 'number' && (
                    <div className="mt-4 h-2 rounded-full bg-outline-variant/35 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(val * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
                        className={`h-full rounded-full ${warn ? 'bg-error' : 'bg-primary'}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </motion.div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen text-on-surface overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(177,156,217,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(178,238,185,0.18),transparent_28%),linear-gradient(180deg,#faf8ff_0%,#f9f9f9_50%,#f7faf7_100%)]" />
      {children}
    </div>
  );
}

function Section({ title, children, variants }) {
  return (
    <motion.div variants={variants} className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.35em] text-on-surface-variant/60 font-bold px-1">{title}</p>
      <div className="glass-card rounded-[30px] overflow-hidden border-white/50">
        {children}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-4">
      <div className="h-5 w-40 rounded-full bg-outline-variant/50 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-[340px] rounded-[32px] bg-outline-variant/35 animate-pulse" />
        <div className="h-[340px] rounded-[32px] bg-outline-variant/35 animate-pulse" />
      </div>
      <div className="h-72 rounded-[32px] bg-outline-variant/30 animate-pulse" />
    </div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-base text-on-surface-variant">{message}</p>
      <button onClick={onBack} className="px-5 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/20">
        Go Back
      </button>
    </div>
  );
}
