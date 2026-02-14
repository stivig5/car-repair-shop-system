import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { 
    Car, Search, Plus, User, 
    Edit, Trash2, X, Save, ChevronDown, Check 
} from "lucide-react";

export default function CarsPage() {
    const { user } = useAuth();
    const isClient = user?.role === 'CLIENT';

    const [cars, setCars] = useState([]);
    const [users, setUsers] = useState([]); 
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState({
        brand: "", model: "", year: new Date().getFullYear(), licPlate: "", ownerId: "", status: "AVAILABLE"
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = isClient ? "/api/cars/my" : "/api/cars";
            const params = { search: searchTerm };
            const promises = [api.get(endpoint, { params })];

            if (!isClient) {
                promises.push(api.get("/api/users/clients"));
            }

            const results = await Promise.all(promises);
            setCars(results[0].data);

            if (!isClient && results[1]) {
                setUsers(results[1].data);
            }

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'IN_SERVICE':
                return { label: 'W serwisie', color: 'bg-orange-100 text-orange-700 border-orange-200' };
            case 'WAITING':
                return { label: 'Oczekuje', color: 'bg-amber-100 text-amber-700 border-amber-200' };
            case 'AVAILABLE':
            default:
                return { label: 'Gotowy', color: 'bg-green-100 text-green-700 border-green-200' };
        }
    };

    const filteredCars = cars.filter(car => {
        if (statusFilter === "ALL") return true;
        const currentStatus = car.status || 'AVAILABLE';
        return currentStatus === statusFilter;
    });

    const openModal = (car = null) => {
        setEditingCar(car);
        if (car) {
            setFormData({
                brand: car.brand,
                model: car.model,
                year: car.year,
                licPlate: car.licPlate,
                ownerId: car.owner?.id || "",
                status: car.status || "AVAILABLE"
            });
        } else {
            setFormData({
                brand: "", model: "", year: new Date().getFullYear(), licPlate: "", ownerId: "", status: "AVAILABLE"
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (!isClient && !formData.ownerId) {
                alert("Wybierz właściciela pojazdu!");
                return;
            }

            if (editingCar) {
                const payload = { ...formData };
                if (!isClient) {
                    payload.owner = { id: formData.ownerId };
                }
                
                await api.put(`/api/cars/${editingCar.id}`, payload);
            } else {
                if (isClient) {
                    await api.post('/api/cars', { ...formData, owner: null });
                } else {
                    await api.post(`/api/cars?ownerId=${formData.ownerId}`, {
                        ...formData,
                        owner: { id: formData.ownerId }
                    });
                }
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Błąd zapisu pojazdu. Sprawdź czy masz uprawnienia.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Usunąć pojazd?")) {
            try {
                await api.delete(`/api/cars/${id}`);
                fetchData();
            } catch (e) {
                console.error(e);
                alert("Błąd usuwania.");
            }
        }
    };

    const statusOptions = [
        { value: 'ALL', label: 'Wszystkie' },
        { value: 'AVAILABLE', label: 'Gotowe' },
        { value: 'IN_SERVICE', label: 'W serwisie' },
        { value: 'WAITING', label: 'Oczekujące' }
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isClient ? "Moje pojazdy" : "Zarządzanie pojazdami"}
            </h1>
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative flex-1 w-full xl:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Szukaj pojazdów..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative min-w-[200px]" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-orange-500 transition-colors"
                        >
                            <span className="font-medium">
                                {statusOptions.find(o => o.value === statusFilter)?.label}
                            </span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-scale-in origin-top">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-colors"
                                    >
                                        {option.label}
                                        {statusFilter === option.value && <Check size={16} className="text-orange-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => openModal(null)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Dodaj pojazd
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-5">Pojazd</th>
                                <th className="px-6 py-5">Nr rejestracyjny</th>
                                {!isClient && <th className="px-6 py-5">Właściciel</th>}
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredCars.map(car => {
                                const statusConfig = getStatusConfig(car.status || 'AVAILABLE');
                                
                                return (
                                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center shrink-0">
                                                    <Car size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">
                                                        {car.brand} {car.model}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">{car.year}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                                                {car.licPlate}
                                            </span>
                                        </td>
                                        {!isClient && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <User size={16} className="text-gray-400 shrink-0" />
                                                    <span className="truncate max-w-[150px]">
                                                        {car.owner?.fullName || car.owner?.username || "Nieznany"}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center min-w-[100px] border ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(car)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                
                                                {(user.role === 'ADMIN' || isClient) && (
                                                    <button 
                                                        onClick={() => handleDelete(car.id)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredCars.length === 0 && (
                        <div className="text-center py-12 text-gray-400">Brak pojazdów spełniających kryteria.</div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingCar ? "Edytuj pojazd" : "Dodaj nowy pojazd"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Marka *</label>
                                    <input 
                                        required
                                        placeholder="np. BMW"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.brand}
                                        onChange={e => setFormData({...formData, brand: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Model *</label>
                                    <input 
                                        required
                                        placeholder="np. X5"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.model}
                                        onChange={e => setFormData({...formData, model: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nr Rejestracyjny *</label>
                                    <input 
                                        required
                                        placeholder="WA 12345"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                                        value={formData.licPlate}
                                        onChange={e => setFormData({...formData, licPlate: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rocznik *</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.year}
                                        onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {!isClient && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Właściciel *</label>
                                        <select 
                                            required={!isClient}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={formData.ownerId}
                                            onChange={e => setFormData({...formData, ownerId: e.target.value})}
                                        >
                                            <option value="">-- Wybierz klienta --</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.fullName} ({u.username})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
                                        <select 
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={formData.status}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                        >
                                            <option value="AVAILABLE">Gotowy</option>
                                            <option value="IN_SERVICE">W serwisie</option>
                                            <option value="WAITING">Oczekuje</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
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