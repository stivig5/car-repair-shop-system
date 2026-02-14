import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { X, Save, Car, Calendar, FileText, Clock, User } from "lucide-react";

export default function CreateAppointmentModal({ selectedDate, onClose, onCreated }) {
    const { user } = useAuth(); 
    const [cars, setCars] = useState([]);
    const [formData, setFormData] = useState({
        carId: "",
        date: "",
        time: "09:00",
        description: ""
    });

    useEffect(() => {
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
        }

        const fetchCars = async () => {
            try {
                const endpoint = user?.role === 'CLIENT' ? '/api/cars/my' : '/api/cars';
                
                const res = await api.get(endpoint);
                setCars(res.data);
            } catch (error) {
                console.error("Błąd podczas pobierania pojazdów:", error);
            }
        };
        fetchCars();
    }, [selectedDate, user]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);
            
            const selectedCar = cars.find(c => c.id === parseInt(formData.carId));
            if (!selectedCar) return;

            const payload = {
                client: { id: selectedCar.owner.id }, 
                car: { id: selectedCar.id },          
                requestedDate: dateTime.toISOString(),
                description: formData.description
            };

            await api.post("/api/appointments", payload);
            onCreated();
            onClose();
        } catch (error) {
            alert("Błąd podczas tworzenia wizyty.");
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nowa wizyta</h2>
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
                            <option value="">-- Wybierz samochód --</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.licPlate}) {user?.role !== 'CLIENT' && `- ${car.owner?.fullName}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500" /> Data *
                            </label>
                            <input 
                                type="date"
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Clock size={16} className="text-gray-500" /> Godzina *
                            </label>
                            <input 
                                type="time"
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" /> Cel wizyty *
                        </label>
                        <textarea 
                            required
                            rows="3"
                            placeholder="np. Przegląd okresowy, wymiana opon..."
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
                            Zapisz wizytę
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}