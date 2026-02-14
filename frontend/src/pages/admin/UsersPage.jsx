import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
    Search, Plus, Mail, Phone, Edit, Trash2, 
    User as UserIcon, Shield, Filter, X, Save, Lock 
} from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 
    
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        userRole: "CLIENT"
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (selectedRole) params.role = selectedRole;

            const res = await api.get("/api/users", { params });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedRole]);

    const openModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({
                username: user.username,
                password: "", 
                fullName: user.fullName || "",
                phoneNumber: user.phoneNumber || "",
                userRole: user.userRole
            });
        } else {
            setFormData({
                username: "",
                password: "",
                fullName: "",
                phoneNumber: "",
                userRole: "CLIENT"
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/api/users/${editingUser.id}/role`, null, { params: { role: formData.userRole } });
                
                 await api.put(`/api/users/${editingUser.id}`, formData);

            } else {
                await api.post("/api/users", formData);
            }
            closeModal();
            fetchUsers();
        } catch (error) {
            alert("Wystąpił błąd podczas zapisywania.");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
            try {
                await api.delete(`/api/users/${id}`);
                fetchUsers();
            } catch (e) {
                alert("Nie można usunąć użytkownika (Błąd 500 naprawiony w backendzie?).");
            }
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return { label: 'Administrator', bg: 'bg-orange-500', text: 'text-white' };
            case 'MECHANIC': return { label: 'Mechanik', bg: 'bg-yellow-500', text: 'text-white' };
            default: return { label: 'Klient', bg: 'bg-green-500', text: 'text-white' };
        }
    };

    return (
        <div className="animate-fade-in space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Zarządzanie użytkownikami</h1>
                <button 
                    onClick={() => openModal(null)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    Dodaj użytkownika
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Szukaj (login, nazwisko)..." 
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-11 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer shadow-sm font-medium"
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                    >
                        <option value="">Wszystkie role</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="MECHANIC">Mechanik</option>
                        <option value="CLIENT">Klient</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {users.map((u) => {
                        const badge = getRoleBadge(u.userRole);
                        return (
                            <div key={u.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${u.userRole === 'ADMIN' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : <UserIcon />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {u.fullName || "Użytkownik"}
                                            </h3>
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 ${badge.bg} ${badge.text}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                        <Mail size={16} />
                                        <span className="text-sm truncate">Login: {u.username}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                        <Phone size={16} />
                                        <span className="text-sm">{u.phoneNumber || "Brak numeru"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button 
                                        onClick={() => openModal(u)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold transition-colors"
                                    >
                                        <Edit size={16} />
                                        Edytuj
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(u.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Usuń"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingUser ? "Edytuj użytkownika" : "Nowy użytkownik"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Login *</label>
                                    <input 
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rola</label>
                                    <select 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.userRole}
                                        onChange={e => setFormData({...formData, userRole: e.target.value})}
                                    >
                                        <option value="CLIENT">Klient</option>
                                        <option value="MECHANIC">Mechanik</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Imię i Nazwisko</label>
                                <input 
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Telefon</label>
                                <input 
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1 pt-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Lock size={14} /> 
                                    {editingUser ? "Zmień hasło (opcjonalne)" : "Hasło *"}
                                </label>
                                <input 
                                    type="password"
                                    required={!editingUser} 
                                    placeholder={editingUser ? "Pozostaw puste aby nie zmieniać" : "Wpisz hasło"}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold"
                                >
                                    Anuluj
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    Zapisz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}