import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { 
    LayoutDashboard, Users, Car, Wrench, Package, CalendarDays, 
    BarChart3, Settings, LogOut, Bell 
} from "lucide-react";

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const NavItem = ({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
                <Icon size={20} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-700 font-sans">
            <aside className="w-72 bg-[#0f172a] text-white hidden md:flex flex-col z-20 shadow-xl">
                <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                        <Car className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">AutoFlow</span>
                </div>

                <div className="px-6 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.fullName || user?.username}</p>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                                {user?.role || 'Administrator'}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavItem to="/admin/dashboard" label="Panel główny" icon={LayoutDashboard} />
                    <NavItem to="/admin/users" label="Użytkownicy" icon={Users} />
                    <NavItem to="/admin/cars" label="Pojazdy" icon={Car} />
                    <NavItem to="/admin/orders" label="Zlecenia" icon={Wrench} />
                    <NavItem to="/admin/inventory" label="Magazyn" icon={Package} />
                    <NavItem to="/admin/appointments" label="Kalendarz" icon={CalendarDays} />
                    <NavItem to="/admin/reports" label="Raporty" icon={BarChart3} />
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Wyloguj</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shadow-sm z-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {location.pathname === '/admin/dashboard' ? 'Panel Główny' : 'Panel Administratora'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}