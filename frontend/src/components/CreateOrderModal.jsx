import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { X, Save, Car, User, FileText } from "lucide-react";

export default function CreateOrderModal({ onClose, onCreated }) {
    const [cars, setCars] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [formData, setFormData] = useState({
        carId: "",
        mechanicId: "",
        description: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carsRes, mechanicsRes] = await Promise.all([
                    api.get("/api/cars"),
                    api.get("/api/users/mechanics")
                ]);
                setCars(carsRes.data);
                setMechanics(mechanicsRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                description: formData.description,
                status: "NEW",
                car: { id: formData.carId },
                mechanic: formData.mechanicId ? { id: formData.mechanicId } : null
            };

            await api.post("/api/orders", payload);
            onCreated();
            onClose();
        } catch (error) {
            alert("Błąd podczas tworzenia zlecenia. Sprawdź dane.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nowe zlecenie</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Car size={16} className="text-orange-500" /> Wybierz pojazd *
                        </label>
                        <select 
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={formData.carId}
                            onChange={e => setFormData({...formData, carId: e.target.value})}
                        >
                            <option value="">-- Wybierz samochód z bazy --</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.licPlate}) - {car.owner?.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User size={16} className="text-blue-500" /> Przypisz mechanika (opcjonalne)
                        </label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={formData.mechanicId}
                            onChange={e => setFormData({...formData, mechanicId: e.target.value})}
                        >
                            <option value="">-- Brak / Przypisz później --</option>
                            {mechanics.map(mech => (
                                <option key={mech.id} value={mech.id}>
                                    {mech.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" /> Opis usterki / zlecenia *
                        </label>
                        <textarea 
                            required
                            rows="3"
                            placeholder="np. Wymiana oleju, stuki w zawieszeniu..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition-colors"
                        >
                            Anuluj
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            Utwórz zlecenie
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}