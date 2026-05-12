import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import FloatingDocument from '../components/3d/FloatingDocument';
import ScannerRing from '../components/3d/ScannerRing';
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Navigation Header */}
      <header className="w-full h-24 flex justify-between items-center px-10 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>shield_with_heart</span>
          </div>
          <span className="font-title-lg text-primary font-bold tracking-tight">CertSentinel</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/login')} className="font-label-lg text-text-secondary hover:text-primary transition-colors">Access Terminal</button>
          <button onClick={() => navigate('/login')} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">Get Started</button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-10 relative z-10">
        <div className="max-w-7xl w-full grid grid-cols-12 gap-20 items-center">
          
          {/* Left Column: Content & Upload */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-12">
            <div>
              <p className="font-label-sm text-primary uppercase tracking-[0.3em] mb-4">Forensic Excellence</p>
              <h1 className="font-display-md text-text-primary leading-[1.1] mb-6">
                Verify medical credentials in <span className="italic font-serif">seconds.</span>
              </h1>
              <p className="font-body-lg text-text-secondary leading-relaxed max-w-md">
                State-of-the-art AI forensic engine designed to detect tampering, forgeries, and structural inconsistencies in medical certifications.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-surface border border-outline-variant/30 rounded-3xl p-8 shadow-xl"
                >
                  <VerificationProgress stage={stage} pollStatus={pollStatus} />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all duration-300 flex flex-col items-center text-center group ${dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/50 bg-surface/50 hover:border-primary/30 hover:bg-surface'}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleInputChange}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center gap-6 text-left w-full">
                        {preview ? (
                          <img src={preview} alt="preview" className="w-16 h-20 object-cover rounded-xl border border-outline-variant/30 shadow-md" />
                        ) : (
                          <div className="w-16 h-20 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-text-tertiary text-[32px]">description</span>
                          </div>
                        )}
                        <div className="flex-grow">
                          <p className="font-title-md text-text-primary mb-1 truncate max-w-[200px]">{file.name}</p>
                          <p className="font-label-sm text-text-tertiary">{(file.size / 1024 / 1024).toFixed(2)} MB • Click to change</p>
                        </div>
                        <button onClick={(e) => {e.stopPropagation(); reset();}} className="p-2 hover:bg-error/10 rounded-full text-error transition-colors">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
                        </div>
                        <p className="font-title-md text-text-primary mb-2">Drop certificate here</p>
                        <p className="font-body-sm text-text-tertiary">PDF, JPG, PNG up to {MAX_SIZE_MB}MB</p>
                      </>
                    )}
                  </div>

                  {error && (
                    <p className="text-error font-label-sm px-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={!file}
                    className={`w-full py-4 rounded-2xl font-label-lg transition-all ${file ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95' : 'bg-surface-container-high text-text-tertiary cursor-not-allowed'}`}
                  >
                    Initiate Forensic Analysis
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: 3D Visualization */}
          <div className="col-span-12 lg:col-span-7 h-[600px] relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] translate-x-1/4"></div>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              className="bg-transparent"
              frameloop={isProcessing ? 'always' : 'demand'}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
              <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#e8f4f8" />
              <pointLight position={[0, -5, 3]} intensity={0.3} color="#fff8f0" />
              <Suspense fallback={null}>
                {isProcessing ? <ScannerRing /> : <FloatingDocument />}
              </Suspense>
            </Canvas>
            
            {/* Status Indicator */}
            <div className="absolute bottom-10 right-10 bg-surface/80 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div>
                <p className="font-label-md text-text-primary">Forensic Node: Active</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-widest">Global Telemetry v2.0</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex justify-between items-center px-10 border-t border-outline-variant/20 text-text-tertiary font-label-sm">
        <p>© 2024 CertSentinel Forensic Systems. All rights reserved.</p>
        <div className="flex gap-8">
          <button className="hover:text-primary transition-colors">Security Protocol</button>
          <button className="hover:text-primary transition-colors">Privacy Lexicon</button>
          <button className="hover:text-primary transition-colors">API Documentation</button>
        </div>
      </footer>
    </div>
  );
}

