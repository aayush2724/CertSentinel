import Sidebar from '../components/Sidebar';

export default function ForensicReport() {
  const user = {
    name: "Dr. Alexander Thorne",
    role: "Senior Forensic Lead",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUQWHqTL9GKqyO6TjrdCuraFyR02n02VJxnbopTW64S5_q1IoHb6wVTSRc6QCJOuUktPQFyLr7GpxcGVwj8mzJ2x4AXttDdprj3y-ZJFft6tkx8l5HGVTO0PQJ3kz7ddrgazk5xZNSIvsyk3Kq0kqLDCncAKNQlWhj2IWQ1k5m9cN3mwxbguroWVeNKck5DGE2Ln0nYphlcB9tsDNr2ii_sxA20nGp_6Xva9ev_1nal5T41L9kv7HyBG69CjDdC8xpsQPf6FCk18S6"
  };

  return (
    <div className="organic-bg text-on-background min-h-screen">
      <Sidebar user={user} />

      {/* TopAppBar */}
      <header className="fixed top-0 right-0 left-72 h-20 z-40 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-gutter">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary/30 transition-all rounded-full overflow-hidden bg-white/40">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input 
              className="w-full bg-transparent border-none pl-12 pr-4 py-2 focus:ring-0 text-body-md outline-none" 
              placeholder="Search reports..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
            <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">help</span>
            </button>
          </div>
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img 
              alt="Administrator Profile" 
              className="w-full h-full object-cover" 
              src={user.avatar}
            />
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-72 pt-24 p-container-padding">
        <header className="mb-10 text-left">
          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-secondary-container/50 backdrop-blur-md border border-white/40 rounded-full text-secondary text-label-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Active Diagnostic
            </span>
            <span className="text-on-surface-variant/50 text-label-sm">Report ID: #MV-90284-F</span>
          </div>
          <h2 className="font-display-lg text-display-lg text-primary tracking-tight">Forensic Analysis Report</h2>
          <p className="text-on-surface-variant/70 text-body-lg max-w-2xl">Diagnostic overview for Medical Degree #821-XP. Multi-layered validation of substrate integrity, ink composition, and typographic alignment.</p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-card-gap">
          {/* Spatial Verification Preview (Left Column) */}
          <div className="col-span-12 lg:col-span-8 glass-card rounded-[32px] overflow-hidden group">
            <div className="p-8 border-b border-white/20 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-headline-md text-headline-md text-primary">Spatial Scan Preview</h3>
                <p className="text-on-surface-variant/70 text-body-md">Real-time geometric alignment mapping</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 glass-card rounded-full hover:bg-white/80 transition-colors">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <button className="p-2 glass-card rounded-full hover:bg-white/80 transition-colors">
                  <span className="material-symbols-outlined">3d_rotation</span>
                </button>
              </div>
            </div>
            <div className="relative h-[480px] bg-surface-container-low/30 p-8 flex items-center justify-center overflow-hidden">
              {/* 3D Document Illustration Representation */}
              <div className="relative w-[300px] h-[400px] bg-white rounded-lg shadow-2xl rotate-3 transform group-hover:rotate-0 transition-transform duration-700 glow-inner border border-white/50 flex flex-col p-6 overflow-hidden">
                <div className="w-full h-12 bg-surface-variant/20 rounded mb-4"></div>
                <div className="w-2/3 h-4 bg-surface-variant/10 rounded mb-2"></div>
                <div className="w-full h-2 bg-surface-variant/10 rounded mb-1"></div>
                <div className="w-full h-2 bg-surface-variant/10 rounded mb-1"></div>
                <div className="w-1/2 h-2 bg-surface-variant/10 rounded mb-6"></div>
                <div className="mt-auto flex justify-between items-end">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
                  </div>
                  <div className="w-24 h-8 bg-surface-variant/10 rounded"></div>
                </div>
                {/* Overlay Scanning Lines */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="w-full h-[2px] bg-secondary/30 absolute top-1/4 animate-scan"></div>
                  <div className="w-[2px] h-full bg-secondary/30 absolute left-1/3"></div>
                  <div className="absolute inset-0 border-[2px] border-secondary/20 m-4 rounded-sm"></div>
                </div>
              </div>
              {/* Floating Data Chips */}
              <div className="absolute top-12 right-12 glass-card p-4 rounded-2xl shadow-xl space-y-3 max-w-[200px] text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-label-sm">Corner Ref: 0.04mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-label-sm">Tilt Correction: +1.2°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tamper Probability (Right Column Top) */}
          <div className="col-span-12 lg:col-span-4 glass-card rounded-[32px] p-8 flex flex-col justify-center items-center text-center">
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Tamper Probability</h3>
            <div className="relative w-48 h-48 mb-6">
              {/* Volumetric Gauge Visualization */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-variant/30" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="10"></circle>
                <circle 
                  className="text-secondary transition-all duration-1000 ease-out" 
                  cx="50" cy="50" fill="transparent" r="40" 
                  stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="240" 
                  strokeLinecap="round" strokeWidth="10" 
                  style={{ filter: "drop-shadow(0 0 8px rgba(50, 105, 64, 0.4))" }}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-secondary">4.2%</span>
                <span className="text-label-sm text-on-surface-variant/50 uppercase tracking-widest">Low Risk</span>
              </div>
            </div>
            <div className="w-full p-4 bg-secondary-container/20 rounded-2xl border border-white/40">
              <p className="text-body-md text-on-secondary-container font-medium">Document substrate matches historical 2012 production standards from certified mills.</p>
            </div>
          </div>

          {/* Analysis Breakdown (Bottom Row) */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-card-gap">
            {/* Ink Card */}
            <div className="glass-card rounded-[32px] p-6 hover:translate-y-[-4px] transition-transform duration-300 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-container/20 rounded-2xl text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>colorize</span>
                </div>
                <h4 className="font-headline-md text-[20px] text-primary">Ink Composition</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant/70">Spectrometry Match</span>
                  <span className="text-secondary">98.4%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "98.4%" }}></div>
                </div>
                <p className="text-body-md text-on-surface-variant/80">Metallic flake density consistent with archival-grade security pigment.</p>
              </div>
            </div>
            {/* Paper Card */}
            <div className="glass-card rounded-[32px] p-6 hover:translate-y-[-4px] transition-transform duration-300 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-secondary-container/20 rounded-2xl text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>texture</span>
                </div>
                <h4 className="font-headline-md text-[20px] text-primary">Paper Integrity</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant/70">Substrate Porosity</span>
                  <span className="text-secondary">96.1%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant/30 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "96.1%" }}></div>
                </div>
                <p className="text-body-md text-on-surface-variant/80">Fibrous weave pattern identified as high-cotton bond typical of credentialing boards.</p>
              </div>
            </div>
            {/* Typography Card */}
            <div className="glass-card rounded-[32px] p-6 hover:translate-y-[-4px] transition-transform duration-300 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-tertiary-container/20 rounded-2xl text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>font_download</span>
                </div>
                <h4 className="font-headline-md text-[20px] text-primary">Typography</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant/70">Kerning Accuracy</span>
                  <span className="text-secondary">99.2%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant/30 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: "99.2%" }}></div>
                </div>
                <p className="text-body-md text-on-surface-variant/80">Digital reconstruction confirms no micro-shifting or character layering found in forgeries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Actions */}
        <footer className="mt-10 flex justify-end gap-4 pb-12">
          <button className="px-8 py-3 rounded-full border border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
            Download PDF Report
          </button>
          <button className="px-8 py-3 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Certify Document
          </button>
        </footer>
      </main>

      {/* Floating Background Objects (Atmospheric Depth) */}
      <div className="fixed top-20 right-[-10%] w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-secondary-container/20 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
    </div>
  );
}


