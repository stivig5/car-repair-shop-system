import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { X, Check, Plus, Trash2, Package, Wrench, Calendar, User, Clock } from "lucide-react";

export default function OrderDetailsModal({ orderId, onClose, onUpdate, readOnly = false }) {
    const [order, setOrder] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedPartId, setSelectedPartId] = useState("");
    const [partQuantity, setPartQuantity] = useState(1);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskPrice, setNewTaskPrice] = useState("");

    useEffect(() => {
        fetchOrderDetails();

        if (!readOnly) {
            fetchInventory();
        }
    }, [orderId, readOnly]);

    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`/api/orders/${orderId}`);
            setOrder(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const res = await api.get("/api/inventory");
            setInventory(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleTask = async (task) => {
        if (readOnly) return; 

        try {
            const newStatus = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
            await api.put(`/api/orders/tasks/${task.id}`, { 
                taskName: task.taskName,
                price: task.price,
                status: newStatus 
            });
            fetchOrderDetails();
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskName) return;
        try {
            await api.post(`/api/orders/${orderId}/tasks`, {
                taskName: newTaskName,
                price: newTaskPrice || 0,
                status: 'IN_PROGRESS'
            });
            setNewTaskName("");
            setNewTaskPrice("");
            fetchOrderDetails();
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddPart = async (e) => {
        e.preventDefault();
        if (!selectedPartId) return;
        try {
            await api.post(`/api/orders/${orderId}/parts`, null, {
                params: { partId: selectedPartId, quantity: partQuantity }
            });
            setSelectedPartId("");
            setPartQuantity(1);
            fetchOrderDetails();
            fetchInventory(); 
            onUpdate();
        } catch (error) {
            alert("Błąd dodawania części (sprawdź stan magazynowy).");
        }
    };

    const handleRemovePart = async (partId) => {
        try {
            await api.delete(`/api/orders/parts/${partId}`);
            fetchOrderDetails();
            fetchInventory();
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !order) return null;

    const totalPartsPrice = order.parts?.reduce((sum, p) => sum + (p.part.price * p.quantity), 0) || 0;
    const totalTasksPrice = order.tasks?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
    const totalCost = totalPartsPrice + totalTasksPrice;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Szczegóły zlecenia #{order.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">
                    
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {order.car.brand} {order.car.model} <span className="text-gray-500">{order.car.year}</span>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">{order.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Klient</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">{order.car.owner.fullName}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Mechanik</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Wrench size={16} />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">{order.mechanic?.fullName || "Nieprzypisany"}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Data utworzenia</p>
                            <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                {new Date(order.createDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Planowane zakończenie</p>
                            <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                {order.endDate ? new Date(order.endDate).toLocaleDateString() : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wrench size={18} className="text-orange-500" /> Lista zadań
                        </h4>
                        
                        <div className="space-y-2">
                            {order.tasks?.map(task => (
                                <div key={task.id} 
                                     onClick={() => handleToggleTask(task)}
                                     className={`flex items-center justify-between p-3 rounded-xl transition-all border border-transparent 
                                        ${readOnly 
                                            ? 'cursor-default opacity-90' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer hover:border-gray-100 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                                            task.status === 'DONE' 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                            {task.status === 'DONE' && <Check size={14} />}
                                        </div>
                                        <span className={task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}>
                                            {task.taskName}
                                        </span>
                                    </div>
                                    <span className="font-mono font-medium text-gray-600 dark:text-gray-400">{task.price} zł</span>
                                </div>
                            ))}
                        </div>

                        {!readOnly && (
                            <form onSubmit={handleAddTask} className="flex gap-2 mt-2">
                                <input 
                                    placeholder="Nazwa nowego zadania..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                    value={newTaskName}
                                    onChange={e => setNewTaskName(e.target.value)}
                                />
                                <input 
                                    type="number"
                                    placeholder="Cena"
                                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                    value={newTaskPrice}
                                    onChange={e => setNewTaskPrice(e.target.value)}
                                />
                                <button type="submit" className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                    <Plus size={18} />
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package size={18} className="text-blue-500" /> Użyte części
                        </h4>

                        <div className="space-y-2">
                            {order.parts?.map(op => (
                                <div key={op.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{op.part.name}</p>
                                        <p className="text-xs text-gray-500">{op.part.serialNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">{op.quantity} szt. x {op.part.price} zł</span>
                                        
                                        {!readOnly && (
                                            <button onClick={() => handleRemovePart(op.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!readOnly && (
                            <form onSubmit={handleAddPart} className="flex gap-2">
                                <select 
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={selectedPartId}
                                    onChange={e => setSelectedPartId(e.target.value)}
                                >
                                    <option value="">-- Wybierz część --</option>
                                    {inventory.map(part => (
                                        <option key={part.id} value={part.id} disabled={part.quantityInStock <= 0}>
                                            {part.name} ({part.price} zł) - Stan: {part.quantityInStock}
                                        </option>
                                    ))}
                                </select>
                                <input 
                                    type="number"
                                    min="1"
                                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={partQuantity}
                                    onChange={e => setPartQuantity(e.target.value)}
                                />
                                <button type="submit" className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    <Plus size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <span className="text-gray-500 font-medium">Koszt całkowity</span>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{totalCost.toFixed(2)} zł</span>
                </div>
            </div>
        </div>
    );
}