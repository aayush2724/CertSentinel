import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const STATUS_THEMES = {
  GENUINE:    { bg: 'bg-emerald-50/60', border: 'border-emerald-400/30', text: 'text-emerald-700', icon: 'check_circle', label: 'Genuine' },
  SUSPICIOUS: { bg: 'bg-amber-50/60',   border: 'border-amber-400/30',   text: 'text-amber-700',   icon: 'warning',      label: 'Suspicious' },
  FAKE:       { bg: 'bg-red-50/60',     border: 'border-red-400/30',     text: 'text-red-700',     icon: 'dangerous',    label: 'Likely Fake' },
};

export default function ForensicReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all verification records
  useEffect(() => {
    certificateAPI.getAll()
      .then(res => {
        const list = res.data?.records || res.data || [];
        setRecords(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => setError('Could not load verification records.'))
      .finally(() => setLoading(false));
  }, []);

  const theme = selected ? (STATUS_THEMES[selected.status] || STATUS_THEMES.SUSPICIOUS) : STATUS_THEMES.SUSPICIOUS;
  const confidence = selected ? Math.round((selected.confidence_score || 0) * 100) : 0;

  // Forensic metrics from image_forensics
  const forensics = selected?.image_forensics || {};
  const ml = forensics?.ml_features || {};
  const elaScore   = ml.ela_score ?? forensics.ela_score ?? null;
  const fontScore  = ml.font_consistency_score ?? forensics.font_consistency_score ?? null;
  const copyMove   = ml.copy_move_detected ?? forensics.copy_move_detected ?? null;
  const noiseScore = ml.noise_inconsistency_score ?? forensics.noise_inconsistency_score ?? null;
  const info       = selected?.extracted_info || {};

  const handleExportPDF = () => window.print();
  const handleSeal = () => {
    if (selected) navigate(`/report/${selected.id}`);
  };

  return (
    <div className="text-on-surface font-body-md overflow-x-hidden min-h-screen relative bg-background">
      {/* Background */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Sidebar user={user} />

      <main className="ml-20 lg:ml-72 p-4 lg:p-gutter min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="flex items-center justify-between h-20 mb-6 print:hidden">
          <div />
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-on-surface">MedVerify Suite</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold uppercase">Pro</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page title */}
          <div className="text-left mb-4">
            <h2 className="font-display-lg text-display-lg text-primary tracking-tight">Forensic Report</h2>
            <p className="font-body-lg text-on-surface-variant/70">Detailed forensic analysis of verified certificates.</p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-3 border-primary-container border-t-primary animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="glass-card rounded-3xl p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-error mb-3">error</span>
              <p className="text-on-surface-variant">{error}</p>
              <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-full bg-primary text-white font-bold text-sm">
                Go Home
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && records.length === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">folder_off</span>
              <h3 className="text-lg font-bold text-on-surface mb-2">No Records Found</h3>
              <p className="text-on-surface-variant/60 mb-6">Verify a certificate first to see its forensic report here.</p>
              <button onClick={() => navigate('/analysis')} className="px-6 py-3 rounded-full bg-primary text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                Go to Analysis Engine
              </button>
            </div>
          )}

          {/* Main content when we have records */}
          {!loading && !error && selected && (
            <>
              {/* Record selector (if more than one) */}
              {records.length > 1 && (
                <div className="print:hidden flex items-center gap-3 flex-wrap">
                  <span className="text-label-sm text-on-surface-variant/60 font-bold uppercase tracking-wider">Select Record:</span>
                  {records.slice(0, 10).map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selected.id === r.id
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white/40 border border-white/40 text-on-surface-variant hover:bg-white/60'
                      }`}
                    >
                      {r.filename?.substring(0, 20) || `Record ${r.id?.substring(0, 8)}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 print:hidden">
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 rounded-full bg-white/50 border border-white/50 font-bold text-label-sm hover:bg-white transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export PDF
                </button>
                <button
                  onClick={handleSeal}
                  className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-label-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  View Full Report
                </button>
              </div>

              {/* Verdict banner */}
              <div className={`glass-card rounded-3xl p-6 lg:p-8 ${theme.border} border overflow-hidden relative text-left print:shadow-none`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{theme.icon}</span>
                        {theme.label}
                      </span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight">
                      {selected.filename || 'Untitled Document'}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70">
                        ID: <code className="font-mono">{selected.id?.substring(0, 8)}...</code>
                      </span>
                      {selected.processing_time_ms && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70">
                          Duration: {selected.processing_time_ms} ms
                        </span>
                      )}
                      {selected.created_at && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/40 border border-white/50 text-[10px] font-bold text-on-surface-variant/70">
                          {new Date(selected.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence circle */}
                  <div className="flex items-center gap-3 bg-white/40 border border-white/60 rounded-2xl px-4 py-3 shadow-sm shrink-0">
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle className="text-outline-variant/30" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                        <circle
                          className="text-primary transition-all duration-1000"
                          cx="18" cy="18" r="16" fill="none"
                          stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - confidence}
                          strokeLinecap="round" strokeWidth="3.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-extrabold text-primary">{confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Confidence</p>
                      <p className="text-xs font-bold text-on-surface mt-0.5">Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-column: Extracted Info + Verification Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:gap-4">
                {/* Extracted Info */}
                <div className="glass-card inner-glow rounded-3xl overflow-hidden border-white/50 text-left print:shadow-none">
                  <div className="px-5 py-3.5 border-b border-white/20 bg-white/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">person_search</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Extracted Information</h3>
                  </div>
                  <div className="divide-y divide-white/20">
                    {[
                      { label: 'Physician Name', val: info.doctor_name, icon: 'badge' },
                      { label: 'Hospital / Facility', val: info.hospital_name, icon: 'local_hospital' },
                      { label: 'Date(s)', val: info.dates?.join(', '), icon: 'calendar_month' },
                      { label: 'Registration No.', val: info.registration_numbers?.join(', '), icon: 'pin' },
                    ].map(({ label, val, icon }) => (
                      <div key={label} className="p-4 flex items-start gap-3 hover:bg-white/10 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-white/50 border border-white/60 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider">{label}</p>
                          <p className={`text-xs font-semibold ${val ? 'text-on-surface' : 'text-on-surface-variant/50 italic'}`}>
                            {val || 'Not detected'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Signals */}
                <div className="glass-card inner-glow rounded-3xl overflow-hidden border-white/50 text-left print:shadow-none">
                  <div className="px-5 py-3.5 border-b border-white/20 bg-white/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">gpp_maybe</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Verification Signals</h3>
                  </div>
                  <div className="divide-y divide-white/20">
                    {(selected.reasons || []).length > 0 ? (
                      selected.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 hover:bg-white/10 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-amber-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                          </div>
                          <p className="text-xs text-on-surface-variant/80 font-medium leading-relaxed mt-0.5">{reason}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">No Anomalies Found</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">All checks passed successfully.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Forensic Diagnostics */}
              <div className="glass-card inner-glow rounded-3xl overflow-hidden border-white/50 text-left print:shadow-none">
                <div className="px-5 py-3.5 border-b border-white/20 bg-white/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">biotech</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Digital Forensic Diagnostics</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/10">
                  {[
                    { label: 'Copy-Move', val: copyMove === true ? 'Detected' : (copyMove === false ? 'None' : '—'), warn: copyMove === true, icon: 'content_copy' },
                    { label: 'ELA Score', val: typeof elaScore === 'number' ? elaScore.toFixed(2) : '—', warn: typeof elaScore === 'number' && elaScore > 0.5, icon: 'broken_image' },
                    { label: 'Noise Inconsistency', val: typeof noiseScore === 'number' ? noiseScore.toFixed(2) : '—', warn: typeof noiseScore === 'number' && noiseScore > 0.6, icon: 'grain' },
                    { label: 'Font Consistency', val: typeof fontScore === 'number' ? fontScore.toFixed(2) : '—', warn: typeof fontScore === 'number' && fontScore < 0.7, icon: 'font_download' },
                  ].map(({ label, val, warn, icon }) => (
                    <div key={label} className="bg-white/60 p-5 flex flex-col justify-between min-h-[100px]">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${warn ? 'text-error' : 'text-on-surface-variant/50'}`}>{icon}</span>
                        <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider">{label}</p>
                      </div>
                      <p className={`text-xl font-bold mt-3 ${warn ? 'text-error' : 'text-on-surface'}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pb-16" />
      </main>
    </div>
  );
}
