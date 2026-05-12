import Sidebar from '../components/Sidebar';

export default function CommandCenter() {
  return (
    <body className="font-body-md text-on-surface antialiased bg-background">
      {/* 3D Background Decorative Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <Sidebar user={{
        name: "Dr. Sarah Chen",
        role: "Senior Registrar",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa6G3Q8kwHSiHkw7ZmkBXFJky0E9nooljgfIaRSqatAHeQohRAz7wxLsJnIHwFWtk6J6kStg09ChHiMuGo5_7f4_P9oNGy41lTC5ukZbE1oAM4Mtk9drLndh--YKEwsOGw_3jXXs1ZibzTRB1jK_ooTyFzbZknTRvR48TnVXh_5r3LVZ6M6sTAJQ7Yi_oPsC4Md-qI70bwczOcDCWSwmtESqPXNVGJwYqs0lC2N1k0GX6rlmT8BpY5Oz4VZfEIad8PBpgLau8by2zK"
      }} />

      {/* TopAppBar Shell */}
      <header className="fixed top-0 right-0 left-72 h-20 z-40 bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-sm flex items-center justify-between px-gutter">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="hidden md:block font-headline-md text-headline-md text-primary font-bold">MedVerify Suite</h2>
          <div className="relative w-96 max-w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
            <input 
              className="w-full bg-white/20 border-white/40 focus:ring-primary/20 focus:border-primary/40 rounded-full pl-12 pr-4 py-2 text-body-md transition-all outline-none" 
              placeholder="Search validation records..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors relative group">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
          <button className="p-2 hover:bg-surface-container-low/50 rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">help</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="ml-72 pt-28 px-gutter pb-12">
        {/* Hero: 3D Visualization & Quick Stats */}
        <div className="grid grid-cols-12 gap-card-gap mb-card-gap">
          {/* Global Network Visualization */}
          <div className="col-span-8 glass-card rounded-[32px] overflow-hidden relative min-h-[400px] inner-glow group">
            <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply">
              <img 
                alt="Global Network" 
                className="w-full h-full object-cover grayscale opacity-20" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGjBuOCveKfhdO3yu19SSDU99tKRUWmUvvT_htStgWYFcNpgXQw9lBtch8OA2A385NUCmf-ukP1SpxdGli42glG_QDLMlNA-IWYS--f5yid3kO-mr09rtiAILAHRzOnDJ2Ca0rLie86WF24g8gI1qGXIZ1E_qmc-5Z9FoZH69Lc-3xHlFB1CrPo-HPQ5CuHVCPSdGw5SmEjl2wAGVvxDvSsEyZYTENMtiKLFdGJcgNkJfz3gXYvGQ70Xfl57YYJJhJfIaKRsMlVVji"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Real-time Node Status</span>
                  <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Network Integrity Active</h3>
                  <p className="text-body-md text-on-surface-variant/80 max-w-md">The CertSentinel protocol is currently monitoring 1,248 global validation nodes with 99.9% clinical accuracy.</p>
                </div>
                <div className="text-right">
                  <p className="text-display-lg font-display-lg text-primary">1.2ms</p>
                  <p className="text-xs font-bold uppercase text-on-surface-variant/60">Global Latency</p>
                </div>
              </div>
              <div className="mt-auto flex gap-6 overflow-x-auto pb-2">
                <div className="glass-card bg-white/80 px-6 py-4 rounded-2xl flex items-center gap-4 border-white/60">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant/60">North America</p>
                    <p className="text-sm font-bold text-on-surface">Stable: 412 Nodes</p>
                  </div>
                </div>
                <div className="glass-card bg-white/80 px-6 py-4 rounded-2xl flex items-center gap-4 border-white/60">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant/60">European Union</p>
                    <p className="text-sm font-bold text-on-surface">Stable: 388 Nodes</p>
                  </div>
                </div>
                <div className="glass-card bg-white/80 px-6 py-4 rounded-2xl flex items-center gap-4 border-white/60">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant/60">Asia Pacific</p>
                    <p className="text-sm font-bold text-on-surface">Syncing: 448 Nodes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Validation Gauges */}
          <div className="col-span-4 flex flex-col gap-card-gap">
            <div className="glass-card flex-1 rounded-[32px] p-8 inner-glow flex flex-col items-center justify-center text-center">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary organic-pulse" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="44" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-headline-lg font-display-lg text-primary">94%</span>
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant/60">Efficiency</span>
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">System Throughput</h4>
              <p className="text-body-md text-on-surface-variant/70">Peak verification load handling</p>
            </div>
            <div className="glass-card rounded-[32px] p-6 inner-glow bg-gradient-to-br from-secondary/5 to-white/60">
              <div className="flex items-center justify-between mb-4">
                <p className="text-label-sm text-on-surface-variant/80">Validation Speed</p>
                <span className="text-secondary font-bold text-sm">+12.4%</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: "78%" }}></div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant/60 uppercase font-bold">Avg. Time</p>
                  <p className="text-lg font-bold text-on-surface">4.2 Sec</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant/60 uppercase font-bold">Protocol</p>
                  <p className="text-lg font-bold text-secondary">Sentinel v4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Secondary Row: Bento Grid */}
        <div className="grid grid-cols-12 gap-card-gap">
          {/* Recent Activity Feed */}
          <div className="col-span-7 glass-card rounded-[32px] p-8 inner-glow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Validations</h3>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View Audit Log
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-on-surface">Oxford Medical Board</h5>
                    <span className="text-[10px] font-bold text-on-surface-variant/40">2 MINS AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant/70">Degree certification verified for Dr. Julianne Smith</p>
                </div>
                <div className="bg-secondary/10 px-3 py-1 rounded-full text-secondary font-bold text-[10px] uppercase">Success</div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-on-surface">State Health Registry</h5>
                    <span className="text-[10px] font-bold text-on-surface-variant/40">15 MINS AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant/70">License renewal validation: Batch ID #8812-X</p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-[10px] uppercase">Pending</div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-on-surface">Identity Cross-Check</h5>
                    <span className="text-[10px] font-bold text-on-surface-variant/40">42 MINS AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant/70">Biometric fingerprint sync completed for New York Cluster</p>
                </div>
                <div className="bg-surface-variant px-3 py-1 rounded-full text-on-surface-variant font-bold text-[10px] uppercase">Archived</div>
              </div>
            </div>
          </div>
          {/* System Health & Quick Actions */}
          <div className="col-span-5 grid grid-cols-2 gap-card-gap">
            <div className="glass-card rounded-[32px] p-6 inner-glow flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <div>
                <h6 className="text-headline-md font-bold text-on-surface">24.5k</h6>
                <p className="text-xs text-on-surface-variant/60 font-bold uppercase">Weekly Audits</p>
              </div>
            </div>
            <div className="glass-card rounded-[32px] p-6 inner-glow flex flex-col justify-between bg-gradient-to-br from-primary to-primary-container text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-white">rocket_launch</span>
              </div>
              <div>
                <h6 className="text-headline-md font-bold">Turbo</h6>
                <p className="text-xs text-white/70 font-bold uppercase">Processing Mode</p>
              </div>
            </div>
            <div className="col-span-2 glass-card rounded-[32px] p-6 inner-glow flex items-center gap-6">
              <div className="flex-1 text-left">
                <h5 className="font-bold text-on-surface mb-1">Clinic Synchronization</h5>
                <p className="text-xs text-on-surface-variant/70">Last synced 4 minutes ago with the Central Medical Database.</p>
              </div>
              <button className="bg-white border border-outline-variant/30 text-on-surface px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-surface transition-all">
                Sync Now
              </button>
            </div>
            <div className="col-span-2 glass-card rounded-[32px] overflow-hidden relative inner-glow min-h-[140px] group cursor-pointer">
              <img 
                alt="Medical Collaboration" 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHFi-o1WZ-yXI4VAX6x22ZY7T6i9CP-NWjxqYkC7VWEHXqEWZAl2ODbBZBr1QJR85UgXC2S3u4MriwmCykJ3KPg0W_SvKjNXHhtdEYwC9aVWye3QIKV9w0JS6Pyx0wu4a45R1X88ur8T6xoF0AALUFHd7bkoC53qi03ay1D8-48dVX9bGIYPnjlk12y8uOUabf0b1GJi3Vg4MMNg3nwdAvrVc7L2jR5wc2XkgTF1OQBTI_a1fANui5M5gL3Tr_kzzG4bA3FIPVjCEC"
              />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <p className="text-xs font-bold uppercase text-primary tracking-widest text-left">Training Resources</p>
                <div className="flex justify-between items-end">
                  <h4 className="font-headline-md text-primary leading-tight text-left">Master the <br />Sentinel Suite</h4>
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contextual FAB (Only for main screens) */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="w-16 h-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        </button>
      </div>
    </body>
  );
}


