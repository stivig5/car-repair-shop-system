import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
    Package, Search, Plus, Trash2, Edit, 
    X, Save, RefreshCw, AlertTriangle, ArrowUpDown
} from "lucide-react";

export default function InventoryPage() {
    const [parts, setParts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [sortOption, setSortOption] = useState("NAME_ASC"); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [formData, setFormData] = useState({
        name: "", serialNumber: "", quantityInStock: 0, minQuantity: 5, price: ""
    });

    const fetchParts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/inventory", { params: { search: searchTerm } });
            setParts(res.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delay = setTimeout(fetchParts, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    const getSortedParts = () => {
        return [...parts].sort((a, b) => {
            switch (sortOption) {
                case 'NAME_ASC':
                    return a.name.localeCompare(b.name);
                case 'QTY_ASC':
                    return a.quantityInStock - b.quantityInStock;
                case 'QTY_DESC':
                    return b.quantityInStock - a.quantityInStock;
                case 'PRICE_ASC':
                    return a.price - b.price;
                case 'PRICE_DESC':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
    };

    const updateStock = async (id, currentStock) => {
        const amountStr = prompt("Podaj ilość do dodania (np. 5) lub odjęcia (np. -2):");
        if (amountStr) {
            const amount = parseInt(amountStr);
            if (!isNaN(amount)) {
                try {
                    await api.put(`/api/inventory/${id}/stock`, null, { params: { amount } });
                    fetchParts();
                } catch (e) {
                    alert("Błąd aktualizacji stanu.");
                }
            }
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Usunąć część z magazynu?")) {
            try { await api.delete(`/api/inventory/${id}`); fetchParts(); } 
            catch(e) { alert("Nie można usunąć części (może być używana w zleceniach)."); }
        }
    };

    const openModal = (part = null) => {
        setEditingPart(part);
        if (part) {
            setFormData({
                name: part.name,
                serialNumber: part.serialNumber,
                quantityInStock: part.quantityInStock,
                minQuantity: part.minQuantity || 5, 
                price: part.price
            });
        } else {
            setFormData({ name: "", serialNumber: "", quantityInStock: 0, minQuantity: 5, price: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingPart) {
                await api.put(`/api/inventory/${editingPart.id}`, formData);
            } else {
                await api.post("/api/inventory", formData);
            }
            setIsModalOpen(false);
            fetchParts();
        } catch (error) {
            alert("Błąd zapisu.");
        }
    };

    const sortedParts = getSortedParts();

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Magazyn Części</h1>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Szukaj części (nazwa, nr seryjny)..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ArrowUpDown size={16} className="text-gray-500" />
                        </div>
                        <select 
                            className="h-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer text-sm font-medium"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="NAME_ASC">Nazwa A-Z</option>
                            <option value="QTY_ASC">Ilość: Rosnąco</option>
                            <option value="QTY_DESC">Ilość: Malejąco</option>
                            <option value="PRICE_ASC">Cena: Rosnąco</option>
                            <option value="PRICE_DESC">Cena: Malejąco</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => openModal(null)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={20} /> Dodaj część
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedParts.map(part => {
                        const minQty = part.minQuantity || 5;
                        const isLowStock = part.quantityInStock < minQty;
                        
                        return (
                            <div key={part.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all relative overflow-hidden group 
                                ${isLowStock ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}>
                                
                                {isLowStock && (
                                    <div className="absolute top-0 right-0 p-3 bg-red-100 dark:bg-red-900/30 rounded-bl-2xl text-red-500">
                                        <AlertTriangle size={20} />
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 shrink-0">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{part.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{part.serialNumber}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Cena</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{part.price} zł</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Stan (Min: {minQty})</p>
                                        <span className={`text-xl font-bold ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
                                            {part.quantityInStock} szt.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button 
                                        onClick={() => updateStock(part.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold transition-colors"
                                    >
                                        <RefreshCw size={16} /> Stan
                                    </button>
                                    <button 
                                        onClick={() => openModal(part)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(part.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                                {editingPart ? "Edytuj część" : "Dodaj nową część"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nazwa części *</label>
                                <input 
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Numer seryjny *</label>
                                <input 
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ilość początkowa</label>
                                    <input 
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.quantityInStock}
                                        onChange={e => setFormData({...formData, quantityInStock: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Minimalna ilość</label>
                                    <input 
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.minQuantity}
                                        onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cena (PLN)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>

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