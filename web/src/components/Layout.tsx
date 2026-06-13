import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV = [
  { to: '/',            icon: '🏠', label: 'Dashboard'    },
  { to: '/transactions',icon: '💰', label: 'Transactions' },
  { to: '/inventory',   icon: '📦', label: 'Inventory'    },
  { to: '/debts',       icon: '📒', label: 'Debt Book'    },
  { to: '/analytics',   icon: '📊', label: 'Analytics'    },
  { to: '/advisor',     icon: '🤖', label: 'AI Advisor'   },
];

export default function Layout() {
  const { user, clearAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        const { default: api } = await import('../services/api');
        await api.post('/auth/logout', { refreshToken });
      } catch { /* continue */ }
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-primary-500 flex flex-col text-white shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-primary-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary-500 font-extrabold text-lg">S</div>
            <div>
              <div className="font-extrabold text-base leading-tight">StreetOS</div>
              <div className="text-xs text-primary-200">AI Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-primary-500'
                    : 'text-primary-100 hover:bg-primary-400'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-primary-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-300 flex items-center justify-center font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.businessName || `${user?.firstName} ${user?.lastName}`}</div>
              <div className="text-xs text-primary-200 truncate capitalize">{user?.businessType?.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-center text-xs text-primary-200 hover:text-white transition-colors py-1">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
