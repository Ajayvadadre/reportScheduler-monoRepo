import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const userName = user?.email?.split('@')[0] || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (  
    <div className="h-full w-full bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-xs">
      {/* Brand logo & name */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-400 hover:bg-gray-950 hover:text-white cursor-pointer text-black shadow-sm shadow-blue-500/20">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">Chronos</h1>
          <span className="text-[10px] font-medium text-slate-500 block leading-none">Report Automation Cluster</span>
        </div>
      </div>

      {/* Right status details */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Cluster Active
        </div>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* User profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{userName}</p>
            <span className="text-[10px] font-medium text-slate-500 block leading-none">Cluster Admin</span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
            {initials}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
