import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UserPlus, ArrowLeft } from 'lucide-react';

const InputField = ({ name, type = "text", label, placeholder, value, onChange, required = true, disabled = false }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input 
            name={name}
            type={type}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            placeholder={placeholder}
            value={value} 
            onChange={onChange}
            required={required}
            disabled={disabled}
        />
    </div>
);

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '', password: '', confirmPassword: '', fullName: '', phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Hasła nie są identyczne!");
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...dataToSend } = formData;
            await api.post('/register', dataToSend);
            alert("Rejestracja udana! Możesz się zalogować.");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Błąd rejestracji: " + (error.response?.data?.message || "Wystąpił błąd"));
        }
        setLoading(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Utwórz konto</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Dołącz do AutoFlow i zarządzaj naprawami</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField 
                    name="fullName" 
                    label="Imię i Nazwisko *" 
                    placeholder="Jan Kowalski"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                />
                
                <InputField 
                    name="username" 
                    label="Login *" 
                    placeholder="Wybierz nazwę użytkownika"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                        name="password" 
                        type="password" 
                        label="Hasło *" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <InputField 
                        name="confirmPassword" 
                        type="password" 
                        label="Powtórz hasło *" 
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <InputField 
                    name="phoneNumber" 
                    label="Numer telefonu" 
                    placeholder="+48 123 456 789"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required={false}
                    disabled={loading}
                />

                <button 
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Zarejestruj się
                            <UserPlus size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center mt-6">
                <Link to="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} />
                    Powrót do logowania
                </Link>
            </div>
        </div>
    );
}