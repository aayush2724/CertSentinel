import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VerificationProgress from '../components/VerificationProgress';
import { certificateAPI } from '../services/api';
import { usePolling } from '../hooks/usePolling';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 10;

export default function Home() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [stage, setStage] = useState('idle');
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { status: pollStatus, recordId } = usePolling(taskId, {
    enabled: stage === 'processing',
    interval: 2000,
  });

  if (pollStatus === 'DONE' && recordId) {
    navigate(`/report/${recordId}`);
  }

  const validateFile = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Only JPG, PNG, and PDF files are accepted.';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
    setStage('idle');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const handleVerify = async () => {
    if (!file || stage === 'uploading' || stage === 'processing') return;
    setError(null);
    setStage('uploading');

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      const res = await certificateAPI.verifyAsync(formData);
      setTaskId(res.data.task_id);
      setStage('processing');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed. Please try again.');
      setStage('idle');
    }
  };

  const reset = () => {
    setFile(null);
    setStage('idle');
    setTaskId(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isProcessing = stage === 'uploading' || stage === 'processing';
  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

  return (
    <div className="min-h-screen text-on-surface overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(177,156,217,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(178,238,185,0.2),transparent_30%),linear-gradient(180deg,#faf8ff_0%,#f9f9f9_55%,#f6faf7_100%)]" />
      <div className="fixed top-[-10%] left-[-8%] w-[34rem] h-[34rem] rounded-full bg-primary-container/35 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-12%] right-[-10%] w-[32rem] h-[32rem] rounded-full bg-secondary-container/35 blur-[120px] pointer-events-none" />

      <header className="relative z-20 max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-on-surface-variant/60 mb-2">Certificate Verification Console</p>
          <h1 className="font-display-lg text-primary leading-none">MedVerify Suite</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full border border-white/70 bg-white/55 backdrop-blur-xl text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors shadow-sm">Access Terminal</button>
          <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">Get Started</button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-4">
          <section className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-[32px] p-8 lg:p-10 border-white/50">
              <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-bold mb-4">Forensic intake</p>
              <h2 className="font-display-lg text-on-surface leading-[0.95] mb-5">
                Check a medical certificate and generate a report in one flow.
              </h2>
              <p className="font-body-lg text-on-surface-variant/80 max-w-lg">
                Upload a JPG, PNG, or PDF. The verifier scans the document, extracts evidence, and routes you to a clean report with confidence, reasons, and forensic signals.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-8">
                {[
                  ['OCR', 'Text extraction'],
                  ['ELA', 'Image tamper scan'],
                  ['Audit', 'Traceable report'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-3xl bg-white/70 border border-white/80 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold mb-2">{title}</p>
                    <p className="text-sm text-on-surface-variant/75 leading-snug">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="glass-card rounded-[32px] p-8 border-white/50"
                >
                  <VerificationProgress stage={stage} pollStatus={pollStatus} />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="glass-card rounded-[32px] p-6 sm:p-8 border-white/50 space-y-5"
                >
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-[28px] border-2 border-dashed p-8 sm:p-10 cursor-pointer transition-all duration-300 overflow-hidden ${dragOver ? 'border-primary bg-primary/8' : 'border-outline-variant/70 bg-white/60 hover:border-primary/40 hover:bg-white/75'}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleInputChange}
                      className="hidden"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-60 pointer-events-none" />

                    {file ? (
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 text-left w-full">
                        {preview ? (
                          <img src={preview} alt="preview" className="w-full sm:w-28 h-40 object-cover rounded-2xl border border-white/80 shadow-lg bg-white" />
                        ) : (
                          <div className="w-full sm:w-28 h-40 rounded-2xl border border-white/80 shadow-lg bg-surface-container-low flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-[42px]">description</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold mb-2">Selected certificate</p>
                          <p className="font-headline-md text-on-surface truncate">{file.name}</p>
                          <p className="text-sm text-on-surface-variant/70 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready for verification</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-secondary-container/70 text-secondary text-xs font-bold uppercase tracking-widest">PDF / Image</span>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">Secure intake</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); reset(); }} className="self-start p-3 hover:bg-error/10 rounded-full text-error transition-colors">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center text-center py-4">
                        <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mb-5 shadow-inner">
                          <span className="material-symbols-outlined text-primary text-[38px]">upload_file</span>
                        </div>
                        <p className="font-headline-md text-on-surface mb-2">Drop certificate here</p>
                        <p className="text-sm text-on-surface-variant/70">PDF, JPG, PNG up to {MAX_SIZE_MB}MB</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl bg-error-container/60 border border-error/10 px-4 py-3 text-error">
                      <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={!file}
                    className={`w-full py-4 rounded-2xl font-semibold transition-all ${file ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.99]' : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'}`}
                  >
                    Initiate Forensic Analysis
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-[36px] p-6 lg:p-8 border-white/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,156,217,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(178,238,185,0.14),transparent_35%)]" />
              <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-on-surface-variant/60 mb-2">Live verification environment</p>
                  <h3 className="font-headline-lg text-on-surface mb-2">Report generation after upload</h3>
                  <p className="text-sm text-on-surface-variant/75 max-w-xl">The report screen shows verdict, confidence, extracted fields, image forensics, and the full reasoning trail.</p>
                </div>
                <div className="rounded-[28px] bg-white/70 border border-white/80 px-5 py-4 min-w-[180px]">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60 font-bold mb-1">System status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                    <p className="text-sm font-semibold text-on-surface">Ready for intake</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { value: '3', label: 'analysis layers', note: 'OCR, text, and image' },
                  { value: '1', label: 'report output', note: 'single review view' },
                  { value: '0', label: 'manual steps', note: 'upload and inspect' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[28px] bg-white/65 border border-white/80 p-5">
                    <p className="text-4xl font-display-lg text-primary mb-1">{item.value}</p>
                    <p className="text-sm font-semibold text-on-surface mb-1 uppercase tracking-[0.18em]">{item.label}</p>
                    <p className="text-xs text-on-surface-variant/65">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-5 rounded-[30px] bg-white/70 border border-white/80 p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold">Certificate flow</p>
                    <p className="text-sm text-on-surface-variant/70">Preview, verify, inspect report</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant/50">MedVerify</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Upload a certificate image or PDF',
                    'Run automated forensic checks',
                    'Open the generated report page',
                    'Review confidence and evidence',
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-surface/70 p-4 border border-white/70">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">0{index + 1}</div>
                      <p className="text-sm text-on-surface-variant/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ['Confidence', 'Auto-calculated verdict score'],
                ['Evidence', 'Extracted text and forensic signals'],
                ['Report', 'Clean handoff to the report page'],
              ].map(([title, copy]) => (
                <div key={title} className="glass-card rounded-[28px] p-5 border-white/50">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold mb-2">{title}</p>
                  <p className="text-sm text-on-surface-variant/75">{copy}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

