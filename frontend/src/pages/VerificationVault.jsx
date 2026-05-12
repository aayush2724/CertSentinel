import Sidebar from '../components/Sidebar';

export default function VerificationVault() {
  const user = {
    name: "Dr. Julian Vance",
    role: "System Admin",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBI5yXTs3iQj9PPlbwofQaf-AXJAGTrweO2U3i86cRxUM7jDc7YmcOkevbtWTbcjMCa2PHGqzVyZ6cYFYKRjvqNI4q7o_Olc_MJOHQ3pKPVjEeRgfDOJqQxM0Gx-6GHqp0ZWCClQnFNi5J5b29d4WmMGdS904TqpFp4hxzTCOC3L-YKcqORBaAk-k_yvPAqaX6FxEkUxoCGNZ2tFudcvpe3egK1IdnDjBtkPk73iwMc7qvQ_iPUHtijf2UL_0Vks4tWsr7MSXxb2923"
  };

  const logs = [
    { date: 'Oct 24, 2023', time: '09:42:15 AM', hash: '0x7F2A...E4B1', type: 'Radiology Scan', icon: 'radiology', status: 'Validated', statusIcon: 'verified', typeColor: 'secondary' },
    { date: 'Oct 24, 2023', time: '08:15:02 AM', hash: '0x3C9D...F209', type: 'Prescription Ledger', icon: 'medication', status: 'Validated', statusIcon: 'verified', typeColor: 'secondary' },
    { date: 'Oct 23, 2023', time: '11:59:59 PM', hash: '0x9B11...A01D', type: 'Clinical Notes', icon: 'clinical_notes', status: 'Hash Mismatch', statusIcon: 'gpp_maybe', typeColor: 'error', isAlert: true },
    { date: 'Oct 23, 2023', time: '04:22:11 PM', hash: '0x1F4A...B222', type: 'Patient Identity', icon: 'biometrics', status: 'Validated', statusIcon: 'verified', typeColor: 'secondary' },
  ];

  return (
    <div className="text-on-surface font-body-md overflow-x-hidden min-h-screen relative">
      <div className="bg-mesh"></div>
      
      <Sidebar user={user} />

      {/* Main Canvas */}
      <main className="ml-72 p-gutter min-h-screen">
        {/* TopAppBar */}
        <header className="h-20 flex items-center justify-between px-gutter w-full mb-8">
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 w-1/3">
            <span className="material-symbols-outlined text-on-surface-variant/60">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/40 outline-none" 
              placeholder="Search hash or resource ID..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-low/50 rounded-full cursor-pointer transition-colors">notifications</span>
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-low/50 rounded-full cursor-pointer transition-colors">settings</span>
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-low/50 rounded-full cursor-pointer transition-colors">help</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="text-right">
              <p className="text-label-sm font-bold text-primary">MedVerify Suite</p>
              <p className="text-[10px] text-on-surface-variant/60 font-bold">v4.2.0-STABLE</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-[1280px] mx-auto space-y-gutter">
          {/* Bento Grid Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
            {/* Vault Capacity Card */}
            <div className="glass-card inner-glow rounded-xl p-6 md:col-span-2 flex items-center justify-between overflow-hidden relative text-left">
              <div className="z-10">
                <h2 className="text-headline-md font-headline-md text-primary mb-2">Vault Capacity</h2>
                <p className="text-body-md text-on-surface-variant/70 mb-6 max-w-sm">Your digital ledger is currently operating at 64% capacity across clinical nodes.</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-display-lg font-display-lg text-primary leading-tight">12.4TB</p>
                    <p className="text-label-sm text-on-surface-variant/60 font-bold uppercase tracking-wider">Storage Utilized</p>
                  </div>
                  <div>
                    <p className="text-display-lg font-display-lg text-secondary leading-tight">99.9%</p>
                    <p className="text-label-sm text-on-surface-variant/60 font-bold uppercase tracking-wider">Integrity Score</p>
                  </div>
                </div>
              </div>
              {/* 3D Organic Visual */}
              <div className="relative w-48 h-48 opacity-80">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 to-secondary-fixed/40 rounded-full blur-3xl organic-pulse"></div>
                <div className="glass-card w-32 h-32 rounded-3xl rotate-12 flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
                  <span className="material-symbols-outlined text-[64px] text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
                </div>
              </div>
            </div>

            {/* Live Status Bead */}
            <div className="glass-card inner-glow rounded-xl p-6 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Node Status</span>
                  <div className="flex items-center gap-2 bg-secondary-container/30 px-3 py-1 rounded-full border border-secondary/20">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                    <span className="text-[10px] font-bold text-secondary uppercase">Active</span>
                  </div>
                </div>
                <p className="text-body-lg font-bold text-on-surface">Global Sync Active</p>
                <p className="text-label-sm text-on-surface-variant/60">Last sync: 2 minutes ago</p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant/60 font-medium">Encryption Level</span>
                  <span className="text-primary font-bold">AES-256-GCM</span>
                </div>
              </div>
            </div>
          </section>

          {/* Audit Logs Glassmorphic Table */}
          <section className="glass-card inner-glow rounded-xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between bg-white/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="text-headline-md font-headline-md text-on-surface">Verification Audit Logs</h3>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/40 border border-white/40 text-label-sm font-bold hover:bg-white/60 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filters
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/40 border border-white/40 text-label-sm font-bold hover:bg-white/60 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30">
                    <th className="px-8 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Timestamp</th>
                    <th className="px-8 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Verification Hash</th>
                    <th className="px-8 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Resource Type</th>
                    <th className="px-8 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Integrity Status</th>
                    <th className="px-8 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {logs.map((log, i) => (
                    <tr key={i} className={`hover:bg-white/40 transition-colors ${log.isAlert ? 'hover:bg-error/5' : ''}`}>
                      <td className="px-8 py-6">
                        <p className="text-label-sm font-bold text-on-surface">{log.date}</p>
                        <p className="text-[12px] text-on-surface-variant/60 font-medium">{log.time}</p>
                      </td>
                      <td className="px-8 py-6">
                        <code className={`text-[12px] font-mono px-2 py-1 rounded border ${
                          log.isAlert 
                            ? 'bg-error-container/40 text-error border-error/10' 
                            : 'bg-primary-fixed/30 text-primary border-primary/10'
                        }`}>
                          {log.hash}
                        </code>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-sm ${log.isAlert ? 'text-error' : 'text-on-surface-variant/60'}`}>{log.icon}</span>
                          <span className="text-body-md text-on-surface font-medium">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-bold border ${
                          log.isAlert 
                            ? 'bg-error-container/40 text-error border-error/10' 
                            : 'bg-secondary-fixed/40 text-secondary border-secondary/10'
                        }`}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{log.statusIcon}</span>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className={`material-symbols-outlined transition-colors ${log.isAlert ? 'text-error hover:text-error/80' : 'text-on-surface-variant/40 hover:text-primary'}`}>
                          {log.isAlert ? 'warning' : 'open_in_new'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 flex items-center justify-between border-t border-white/20">
              <p className="text-label-sm text-on-surface-variant/60 italic font-medium">Showing 1-10 of 2,492 verifications</p>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-white/40 text-on-surface-variant transition-colors disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-label-sm">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-white/40 text-on-surface-variant font-bold text-label-sm transition-colors">2</button>
                <button className="w-8 h-8 rounded-lg hover:bg-white/40 text-on-surface-variant font-bold text-label-sm transition-colors">3</button>
                <button className="p-2 rounded-lg hover:bg-white/40 text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
            {[
              { label: 'Audit Trails', val: '842', sub: 'Manual Audits (Oct)', icon: 'security', color: 'primary' },
              { label: 'Avg. Time', val: '0.42s', sub: 'Per Verification', icon: 'speed', color: 'secondary' },
              { label: 'Active Nodes', val: '14', sub: 'Distributed Ledger', icon: 'hub', color: 'tertiary' },
              { label: 'Blockage Rate', val: '0.02%', sub: 'Auto-rejected logs', icon: 'rule_folder', color: 'error' },
            ].map((stat, i) => (
              <div key={i} className="glass-card inner-glow rounded-xl p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary-container/20 text-primary' : 
                    stat.color === 'secondary' ? 'bg-secondary-container/20 text-secondary' : 
                    stat.color === 'tertiary' ? 'bg-tertiary-container/20 text-tertiary' : 
                    'bg-error-container/10 text-error'
                  }`}>
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                  <p className="text-label-sm font-bold text-on-surface">{stat.label}</p>
                </div>
                <p className={`text-[24px] font-bold text-${stat.color}`}>{stat.val}</p>
                <p className="text-[10px] text-on-surface-variant/60 uppercase font-bold tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Background 3D Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/20 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-fixed/20 blur-[120px] rounded-full -z-10"></div>
    </div>
  );
}


