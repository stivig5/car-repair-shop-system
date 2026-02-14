import { X, Check, XCircle, Clock, Calendar, User, Car } from "lucide-react";
import { useState } from "react";
import api from "../api/axiosConfig";

export default function AppointmentActionModal({ appointmentId, onClose, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (status) => {
        setIsLoading(true);
        try {
            const cleanId = appointmentId.replace('app-', '');
            
            await api.put(`/api/appointments/${cleanId}/status`, null, {
                params: { status: status }
            });
            
            onSuccess(); 
            onClose();
        } catch (error) {
            console.error("Błąd zmiany statusu", error);
            alert("Nie udało się zmienić statusu wizyty.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Zarządzanie wizytą</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                        Wybierz akcję dla wizyty <strong>#{appointmentId.replace('app-', '')}</strong>
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => handleStatusChange('CONFIRMED')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-all font-bold"
                        >
                            <Check size={20} />
                            Zatwierdź wizytę
                        </button>

                        <button
                            onClick={() => handleStatusChange('REJECTED')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-all font-bold"
                        >
                            <XCircle size={20} />
                            Odrzuć / Anuluj
                        </button>
                        
                        <button
                            onClick={() => handleStatusChange('COMPLETED')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-all font-bold"
                        >
                            <Check size={20} className="text-blue-600" />
                            Oznacz jako zrealizowane
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}