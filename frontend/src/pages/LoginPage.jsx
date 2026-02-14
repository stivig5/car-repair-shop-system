import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, user } = useAuth(); 
    const [localLoading, setLocalLoading] = useState(false); 
    const navigate = useNavigate();

    const loading = isLoading || localLoading;

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else if (user.role === 'MECHANIC') navigate('/mechanic/dashboard'); 
            else navigate('/client/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalLoading(true);

        const loggedInUser = await login(username, password, rememberMe);
        
        if (loggedInUser) {
            if (loggedInUser.role === 'ADMIN') navigate('/admin/dashboard');
            else if (loggedInUser.role === 'MECHANIC') navigate('/mechanic/dashboard'); 
            else navigate('/client/dashboard');
        } else {
            alert("Błąd logowania! Sprawdź login i hasło.");
        }
        setLocalLoading(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Witaj ponownie</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Zaloguj się, aby uzyskać dostęp do panelu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
                    <input 
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        placeholder="Wprowadź login" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hasło</label>
                    </div>
                    <div className="relative">
                        <input 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all pr-12"
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Wprowadź hasło" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="remember" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                    />
                    <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">Zapamiętaj mnie</label>
                </div>

                <button 
                    disabled={loading}
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-lg shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Zaloguj się
                            <LogIn size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center mt-6">
                <p className="text-gray-500 dark:text-gray-400">
                    Nie masz konta?{' '}
                    <Link to="/register" className="text-orange-600 hover:text-orange-500 font-semibold inline-flex items-center gap-1 transition-colors">
                        Zarejestruj się <ArrowRight size={16} />
                    </Link>
                </p>
            </div>

            <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Dane testowe:</p>
                <div className="grid grid-cols-1 gap-1 font-mono">
                    <p><span className="font-semibold text-orange-600">Admin:</span> admin / password</p>
                    <p><span className="font-semibold text-blue-600">Mechanik:</span> mechanic / password</p>
                    <p><span className="font-semibold text-green-600">Klient:</span> klient / password</p>
                </div>
            </div>
        </div>
    );
}