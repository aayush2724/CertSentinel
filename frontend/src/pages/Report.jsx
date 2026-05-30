import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { certificateAPI } from '../services/api';

const STATUS_THEMES = {
  GENUINE: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-50/40',
    text: 'text-emerald-700',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700',
    label: 'Likely Genuine',
    icon: 'check_circle'
  },
  SUSPICIOUS: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-50/40',
    text: 'text-amber-700',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-700',
    label: 'Suspicious Anomalies',
    icon: 'warning'
  },
  FAKE: {
    border: 'border-red-500/20',
    bg: 'bg-red-50/40',
    text: 'text-red-700',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-700',
    label: 'Likely Fake / Altered',
    icon: 'dangerous'
  }
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  useEffect(() => {
    certificateAPI.getById(id)
      .then(res => setRecord(res.data))
      .catch(() => setError('Certificate record not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageShell><LoadingSkeleton /></PageShell>;
  if (error) return <PageShell><ErrorState message={error} onBack={() => navigate('/vault')} /></PageShell>;
  if (!record) return <PageShell><ErrorState message="Certificate record could not be loaded." onBack={() => navigate('/vault')} /></PageShell>;

  const { status, confidence_score, reasons, extracted_info, image_forensics, processing_time_ms } = record;
  
  const theme = STATUS_THEMES[status] || STATUS_THEMES.SUSPICIOUS;
  const confidencePercent = Math.round((confidence_score || 0) * 100);
  const filename = record.filename || 'unknown_document.pdf';

  // Read ELA and Font scores correcting for the nested ml_features bug
  const elaScore = image_forensics?.ml_features?.ela_score ?? image_forensics?.ela_score;
  const fontScore = image_forensics?.ml_features?.font_consistency_score ?? image_forensics?.font_consistency_score;
  const copyMove = image_forensics?.ml_features?.copy_move_detected ?? image_forensics?.copy_move_detected;
  const noiseScore = image_forensics?.ml_features?.noise_inconsistency_score ?? image_forensics?.noise_inconsistency_score;

  return (
    <PageShell>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6 print:py-2">
        
        {/* Navigation Breadcrumb - Hidden when printing */}
        <motion.button
          variants={fadeUp}
          initial="initial"
          animate="animate"
          onClick={() => navigate('/vault')}
          className="print:hidden inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Records Ledger</span>
        </motion.button>

        {/* Cohesive Summary Banner Card */}
        <motion.section 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="glass-card inner-glow rounded-3xl p-6 lg:p-8 border-white/50 overflow-hidden relative text-left print:border-none print:shadow-none print:bg-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,156,217,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(178,238,185,0.1),transparent_35%)] print:hidden" />
          
          <div className="relative z-10 space-y-6">
            
            {/* Header: Verdict & Circular Progress Indicator */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{theme.icon}</span>
                    {theme.label}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">
                  Verification Verdict: <span className={theme.text}>{STATUS_THEMES[status]?.label || status}</span>
                </h2>
              </div>
              
              {/* Radial Confidence Indicator */}
              <div className="flex items-center gap-3 bg-white/40 border border-white/60 rounded-2xl px-4 py-2.5 shadow-sm shrink-0 print:border-none print:bg-transparent print:shadow-none">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-outline-variant/30" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3.5"></circle>
                    <circle 
                      className="text-primary transition-all duration-1000" 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - confidencePercent} 
                      strokeLinecap="round" strokeWidth="3.5"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-primary">{confidencePercent}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold leading-none">Confidence</p>
                  <p className="text-[12px] font-bold text-on-surface mt-0.5">Scoring Match</p>
                </div>
              </div>
            </div>

            {/* Document details & action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] print:grid-cols-1 gap-6 items-center">
              
              {/* Left Column: Filename & Description */}
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/50 font-bold">Document Source</p>
                  <div className="flex items-center gap-2 mt-1 bg-white/30 border border-white/40 rounded-xl px-3.5 py-2 w-full max-w-md print:bg-transparent print:border-none print:px-0">
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">description</span>
                    <span className="text-xs font-mono font-semibold text-on-surface truncate max-w-[260px] md:max-w-[340px] print:max-w-full" title={filename}>
                      {filename}
                    </span>
                  </div>
                </div>
                
                {/* Clean Metadata Badge Row */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70 print:bg-transparent print:border-none print:px-0">
                    ID: <code className="font-mono">{getShortId(id)}</code>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70 print:bg-transparent print:border-none print:px-0">
                    Duration: {processing_time_ms} ms
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70 print:bg-transparent print:border-none print:px-0">
                    Engine: {record.model_version || 'v1.0.0'}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions - Hidden during PDF Print */}
              <div className="print:hidden flex flex-col gap-2.5 w-full">
                <button 
                  onClick={() => setShowFilePreview(true)} 
                  className="w-full px-5 py-3 rounded-xl bg-white/60 border border-white text-on-surface text-xs font-bold shadow-sm hover:bg-primary-container/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  View Original Certificate
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="w-full px-5 py-3 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer inner-glow"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Export PDF Report
                </button>
              </div>

            </div>

          </div>
        </motion.section>

        {/* Structured Body: Extracted Fields vs. Fraud Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:gap-4">
          
          {/* Card: Extracted Fields */}
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="glass-card inner-glow rounded-3xl overflow-hidden border-white/50 text-left print:border-none print:shadow-none print:bg-white">
            <div className="px-5 py-3.5 border-b border-white/20 bg-white/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">person_search</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Extracted Information</h3>
            </div>
            
            <div className="divide-y divide-white/20">
              {[
                { label: 'Physician Name', val: extracted_info?.doctor_name, icon: 'badge' },
                { label: 'Hospital Facility', val: extracted_info?.hospital_name, icon: 'local_hospital' },
                { label: 'Signature Date(s)', val: extracted_info?.dates?.join(', '), icon: 'calendar_month' },
                { label: 'Licensing Registration', val: extracted_info?.registration_numbers?.join(', '), icon: 'pin' },
              ].map(({ label, val, icon }) => (
                <div key={label} className="p-4 flex items-start gap-3 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-white/50 border border-white/60 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider">{label}</p>
                    <p className={`text-xs font-semibold ${val ? 'text-on-surface' : 'text-on-surface-variant/50 italic font-medium'}`}>
                      {val || 'Not detected'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card: Detection Signals */}
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="glass-card inner-glow rounded-3xl overflow-hidden border-white/50 text-left print:border-none print:shadow-none print:bg-white">
            <div className="px-5 py-3.5 border-b border-white/20 bg-white/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">gpp_maybe</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Verification Signals</h3>
            </div>
            
            <div className="divide-y divide-white/20">
              {(reasons || []).map((reason, i) => {
                const translated = translateReason(reason);
                const isAnomaly = ['ela', 'noise', 'copy-move', 'font', 'future date', 'software', 'editing software', 'tampering', 'forgery'].some(keyword => 
                  reason.toLowerCase().includes(keyword)
                );
                
                return (
                  <div key={i} className="flex items-start gap-3.5 p-4 hover:bg-white/10 transition-colors">
                    {isAnomaly ? (
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-red-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_maybe</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">info</span>
                      </div>
                    )}
                    <div className="space-y-0.5 text-left">
                      <p className={`text-[9px] font-extrabold uppercase tracking-wider ${isAnomaly ? 'text-red-700' : 'text-primary'}`}>
                        {isAnomaly ? 'Tamper Signal Detected' : 'Content Audit Check'}
                      </p>
                      <p className="text-xs text-on-surface-variant/80 font-medium leading-relaxed mt-0.5">{translated}</p>
                    </div>
                  </div>
                );
              })}
              
              {(!reasons || reasons.length === 0) && (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">No Anomalies Found</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-0.5 max-w-[240px]">All forensic and metadata validation passes with a high confidence rating.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>



      {/* Dynamic Certificate Preview Modal */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card rounded-[32px] w-full max-w-4xl max-h-[85vh] flex flex-col border border-white/50 shadow-2xl relative overflow-hidden text-left bg-white/80">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/30 bg-white/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Document Vault Preview</span>
                <h3 className="text-base font-bold text-on-surface truncate max-w-xl">{filename}</h3>
              </div>
              <button 
                onClick={() => setShowFilePreview(false)}
                className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center hover:bg-error-container/20 hover:text-error transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[350px] bg-slate-950/5">
              {filename?.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={`/api/certificates/${id}/file?token=${localStorage.getItem('access_token')}`} 
                  className="w-full h-[50vh] rounded-2xl border-0 shadow-inner bg-white" 
                  title="PDF Certificate Preview"
                />
              ) : (
                <div className="relative group max-w-full max-h-[50vh] rounded-2xl overflow-hidden shadow-md bg-white border border-white/40">
                  <img 
                    src={`/api/certificates/${id}/file?token=${localStorage.getItem('access_token')}`} 
                    alt="Certificate Original Preview" 
                    className="max-w-full max-h-[50vh] object-contain block"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23faf8ff'/%3E%3Ctext x='50' y='50' text-anchor='middle' font-size='6' fill='%237c5cbf'%3EPreview Load Error%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/30 bg-white/40 flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">
                Verdict: <span className="underline">{status}</span>
              </span>
              <div className="flex gap-2">
                <a 
                  href={`/api/certificates/${id}/file?token=${localStorage.getItem('access_token')}`} 
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/60 border border-white text-on-surface font-bold text-xs shadow-sm hover:bg-primary-container/20 transition-all flex items-center gap-1.5 cursor-pointer decoration-none"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Original
                </a>
                <button 
                  onClick={() => setShowFilePreview(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer inner-glow"
                >
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen text-on-surface overflow-x-hidden relative print:bg-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(177,156,217,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(178,238,185,0.14),transparent_30%),linear-gradient(180deg,#faf8ff_0%,#f9f9f9_50%,#f7faf7_100%)] print:hidden" />
      {children}
    </div>
  );
}

function getShortId(id) {
  if (!id) return '—';
  if (id.length <= 12) return id;
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="h-4 w-32 rounded-full bg-outline-variant/30 animate-pulse" />
      <div className="h-[200px] rounded-3xl bg-outline-variant/20 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-[220px] rounded-3xl bg-outline-variant/20 animate-pulse" />
        <div className="h-[220px] rounded-3xl bg-outline-variant/20 animate-pulse" />
      </div>
      <div className="h-[120px] rounded-3xl bg-outline-variant/20 animate-pulse" />
    </div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
        <span className="material-symbols-outlined text-2xl">error</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface">Data Load Failure</h3>
      <p className="text-xs text-on-surface-variant/70 max-w-xs">{message}</p>
      <button onClick={onBack} className="mt-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
        Return to Records
      </button>
    </div>
  );
}

function translateReason(reason) {
  if (!reason) return "";
  const r = reason.toLowerCase();
  
  // Active tampering/forgery signals
  if (r.includes('ela') || r.includes('compression') || r.includes('double compression')) {
    return "Error Level Analysis (ELA) indicates double-compression boundaries, suggesting sections of this document have been digitally spliced or edited.";
  }
  if (r.includes('noise inconsistency') || r.includes('substrate density') || r.includes('noise')) {
    return "Pixel-level noise density mismatch detected. This indicates copy-pasted visual elements or overlaid text blocks that don't match the original page background.";
  }
  if (r.includes('copy-move') || r.includes('clone') || r.includes('forgery')) {
    return "Cloned visual elements detected. Parts of this document (such as a signature, stamp, or logo) have been copied and cloned from elsewhere on the canvas.";
  }
  if (r.includes('font') || r.includes('typographical')) {
    return "Typographical font family and size inconsistencies detected on the same line, indicating manual text overrides or modified letters.";
  }
  if (r.includes('editing software') || r.includes('software') || r.includes('metadata')) {
    return "File metadata analysis detects that this certificate was exported or edited using consumer graphics software (such as Photoshop, Canva, or Acrobat Pro).";
  }
  if (r.includes('future date')) {
    return `Logical anomaly: A signature or verification date on this document occurs in the future (${reason.split(':').pop().trim()}).`;
  }
  
  // Content audit fields
  if (r.includes('no dates')) {
    return "Verification check failed to identify any official dates on the document canvas.";
  }
  if (r.includes('registration number')) {
    return "No medical registration or licensing credentials identified (failed to verify official practitioner registry).";
  }
  if (r.includes('hospital or clinic') || r.includes('hospital name')) {
    return "No official hospital, clinical facility, or institution name detected in the document text.";
  }
  if (r.includes('medical diagnosis') || r.includes('diagnosis keywords')) {
    return "No standard medical diagnostics statements or medical keywords identified in the record context.";
  }
  if (r.includes('unusually short')) {
    return "Document content density is unusually short (failed to extract a complete clinical record structure).";
  }
  if (r.includes('unusual characters') || r.includes('encoding')) {
    return "High count of unusual character encodings detected, indicating potential file stream tampering or parsing corruption.";
  }
  
  // Default fallback
  return reason;
}
