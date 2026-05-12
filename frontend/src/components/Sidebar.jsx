import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const defaultUser = {
    name: "Dr. Sarah Chen",
    role: "Senior Registrar",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa6G3Q8kwHSiHkw7ZmkBXFJky0E9nooljgfIaRSqatAHeQohRAz7wxLsJnIHwFWtk6J6kStg09ChHiMuGo5_7f4_P9oNGy41lTC5ukZbE1oAM4Mtk9drLndh--YKEwsOGw_3jXXs1ZibzTRB1jK_ooTyFzbZknTRvR48TnVXh_5r3LVZ6M6sTAJQ7Yi_oPsC4Md-qI70bwczOcDCWSwmtESqPXNVGJwYqs0lC2N1k0GX6rlmT8BpY5Oz4VZfEIad8PBpgLau8by2zK"
  };

  const currentUser = user || defaultUser;

  const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: 'dashboard' },
    { path: '/analysis', label: 'Analysis Engine', icon: 'query_stats' },
    { path: '/forensic', label: 'Forensic Report', icon: 'description' },
    { path: '/vault', label: 'Verification Vault', icon: 'verified_user' },
  ];

  return (
    <nav className="h-screen w-72 fixed left-0 top-0 border-r border-white/40 bg-white/60 backdrop-blur-3xl flex flex-col p-container-padding z-50">
      <div className="mb-12 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center inner-glow">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">MedVerify</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Verification Suite</p>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'bg-white/40 text-primary border-l-4 border-primary font-bold shadow-sm backdrop-blur-md' 
                  : 'text-on-surface-variant/70 hover:text-primary hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 border-t border-white/30">
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all inner-glow flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          New Verification
        </button>
        <div className="mt-6 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img 
              alt="Medical Professional Avatar" 
              src={currentUser.avatar}
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-on-surface">{currentUser.name}</p>
            <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}



