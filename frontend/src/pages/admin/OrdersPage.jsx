import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext"; // Import auth context
import { 
    Search, Plus, CheckCircle, 
    AlertCircle, Eye, Trash2, ChevronDown, Check, Wrench, ArrowUpDown
} from "lucide-react";
import OrderDetailsModal from "../../components/OrderDetailsModal"; 
import CreateOrderModal from "../../components/CreateOrderModal"; 

const getStatusStyles = (status) => {
    switch (status) {
        case 'COMPLETED':
            return {
                color: 'text-green-600 dark:text-green-500',
                bg: 'bg-green-500',
                border: 'border-green-200 dark:border-green-900/50',
                softBg: 'bg-green-50 dark:bg-green-900/20',
                icon: CheckCircle
            };
        case 'IN_PROGRESS':
        case 'WAITING_PARTS':
            return {
                color: 'text-orange-500',
                bg: 'bg-orange-500',
                border: 'border-orange-200 dark:border-orange-900/50',
                softBg: 'bg-orange-50 dark:bg-orange-900/20',
                icon: Wrench 
            };
        case 'NEW':
        default:
            return {
                color: 'text-blue-500',
                bg: 'bg-blue-500',
                border: 'border-blue-200 dark:border-blue-900/50',
                softBg: 'bg-blue-50 dark:bg-blue-900/20',
                icon: AlertCircle 
            };
    }
};

const CustomDropdown = ({ options, value, onChange, placeholder = "Wybierz", icon: Icon, isCompleted, isSort, readOnly }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    if (readOnly) {
        return (
            <div className="px-4 py-2.5 rounded-xl border border-transparent text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon size={16} />}
                    <span>{selectedLabel}</span>
                </div>
            </div>
        );
    }

    let colorClasses = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200";
    
    if (value && !isSort) {
        if (isCompleted) {
            colorClasses = "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400";
        } else {
            colorClasses = "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400";
        }
    }

    return (
        <div className="relative min-w-[160px]" ref={ref} onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium ${colorClasses}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon size={16} />}
                    <span>{selectedLabel}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-full min-w-[180px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-scale-in">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                        >
                            {opt.label}
                            {value === opt.value && <Check size={14} className={isCompleted || isSort ? "text-green-500" : "text-orange-500"} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function OrdersPage() {
    const { user } = useAuth();
    const isClient = user?.role === 'CLIENT'; 

    const [orders, setOrders] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortOption, setSortOption] = useState("DATE_DESC");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0 });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const orderStatusOpts = [
        { value: 'NEW', label: 'Oczekuje' },
        { value: 'IN_PROGRESS', label: 'W trakcie' },
        { value: 'COMPLETED', label: 'Zakończone' }
    ];

    const sortOptions = [
        { value: 'DATE_DESC', label: 'Najnowsze' },
        { value: 'DATE_ASC', label: 'Najstarsze' },
        { value: 'PRICE_DESC', label: 'Cena: Najwyższa' },
        { value: 'PRICE_ASC', label: 'Cena: Najniższa' }
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { search: searchTerm };
            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            const promises = [api.get("/api/orders", { params })];
            
            if (!isClient) {
                promises.push(api.get("/api/users/mechanics"));
            }

            const results = await Promise.all(promises);
            setOrders(results[0].data);
            
            if (!isClient && results[1]) {
                setMechanics(results[1].data); 
            }
            
            // Statystyki
            const allOrders = results[0].data; 
            setStats({
                new: allOrders.filter(o => o.status === 'NEW').length,
                inProgress: allOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length,
                completed: allOrders.filter(o => o.status === 'COMPLETED').length
            });

        } catch (error) {
            console.error("Błąd pobierania danych", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const loadInitialStats = async () => {
            try {
                const res = await api.get("/api/orders");
                const allOrders = res.data;
                setStats({
                    new: allOrders.filter(o => o.status === 'NEW').length,
                    inProgress: allOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length,
                    completed: allOrders.filter(o => o.status === 'COMPLETED').length
                });
            } catch(e) { console.error(e); }
        };
        loadInitialStats();
    }, []);

    useEffect(() => {
        const delay = setTimeout(fetchData, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, statusFilter]);

    const getSortedOrders = () => {
        return [...orders].sort((a, b) => {
            switch (sortOption) {
                case 'DATE_ASC':
                    return new Date(a.createDate) - new Date(b.createDate);
                case 'DATE_DESC':
                    return new Date(b.createDate) - new Date(a.createDate);
                case 'PRICE_ASC':
                    return (a.totalPrice || 0) - (b.totalPrice || 0);
                case 'PRICE_DESC':
                    return (b.totalPrice || 0) - (a.totalPrice || 0);
                default:
                    return 0;
            }
        });
    };

    const handleFilterClick = (selectedStatus) => {
        if (statusFilter === selectedStatus) {
            setStatusFilter('ALL');
        } else {
            setStatusFilter(selectedStatus);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, null, { params: { status: newStatus } });
            fetchData();
        } catch (e) { alert("Błąd zmiany statusu"); }
    };

    const handleMechanicChange = async (orderId, mechanicId) => {
        try {
            await api.put(`/api/orders/${orderId}/mechanic`, null, { params: { mechanicId } });
            fetchData();
        } catch (e) { alert("Błąd przypisywania mechanika"); }
    };

    const handleDelete = async (e, id) => { 
        e.stopPropagation(); 
        if(window.confirm("Usunąć zlecenie?")) {
            try { await api.delete(`/api/orders/${id}`); fetchData(); } catch(e){}
        }
    };

    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'DONE').length;
        return Math.round((completed / tasks.length) * 100);
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const sortedOrders = getSortedOrders();

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isClient ? "Moje Naprawy" : "Zarządzanie zleceniami"}
            </h1>

            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="relative flex-1 w-full xl:max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Szukaj zleceń..." 
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <CustomDropdown 
                        options={sortOptions}
                        value={sortOption}
                        onChange={setSortOption}
                        placeholder="Sortuj"
                        icon={ArrowUpDown}
                        isSort={true}
                    />

                    {!isClient && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <Plus size={20} /> Nowe zlecenie
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                    onClick={() => handleFilterClick('NEW')}
                    className={`cursor-pointer transition-all p-5 rounded-2xl border flex items-center gap-4 hover:shadow-md
                        ${statusFilter === 'NEW' 
                            ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 dark:bg-blue-900/30' 
                            : 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/20'}
                    `}
                >
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-blue-600 shadow-sm">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.new}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Oczekujące</p>
                    </div>
                </div>
                
                <div 
                    onClick={() => handleFilterClick('IN_PROGRESS')}
                    className={`cursor-pointer transition-all p-5 rounded-2xl border flex items-center gap-4 hover:shadow-md
                        ${statusFilter === 'IN_PROGRESS' 
                            ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900 dark:bg-orange-900/30' 
                            : 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/20'}
                    `}
                >
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-orange-600 shadow-sm">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inProgress}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">W trakcie</p>
                    </div>
                </div>

                <div 
                    onClick={() => handleFilterClick('COMPLETED')}
                    className={`cursor-pointer transition-all p-5 rounded-2xl border flex items-center gap-4 hover:shadow-md
                        ${statusFilter === 'COMPLETED' 
                            ? 'bg-green-100 border-green-300 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900 dark:bg-green-900/30' 
                            : 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/20'}
                    `}
                >
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-green-600 shadow-sm">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completed}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Zakończone</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10"><div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    sortedOrders.map(order => {
                        const progress = calculateProgress(order.tasks);
                        
                        const mechanicOptions = isClient 
                            ? (order.mechanic ? [{value: order.mechanic.id, label: order.mechanic.fullName}] : [])
                            : mechanics.map(m => ({ value: m.id, label: m.fullName }));
                        
                        const statusStyles = getStatusStyles(order.status);
                        const StatusIcon = statusStyles.icon;
                        const isCompleted = order.status === 'COMPLETED';

                        return (
                            <div 
                                key={order.id} 
                                onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow animate-fade-in cursor-pointer"
                            >
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className={`flex items-center gap-3 ${statusStyles.color} font-bold`}>
                                            <StatusIcon size={18} />
                                            <h3 className="text-gray-800 dark:text-white">
                                                {order.car?.brand} {order.car?.model} <span className="text-gray-400 font-normal">{order.car?.year}</span>
                                            </h3>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded font-mono">{order.car?.licPlate}</span>
                                        </div>
                                        <p className="text-lg font-medium text-gray-800 dark:text-white">{order.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            {!isClient && <span>Klient: <span className="text-gray-700 dark:text-gray-300 font-medium">{order.car?.owner?.fullName}</span></span>}
                                            <span>Data: {new Date(order.createDate).toLocaleDateString()}</span>
                                            <span>Koszt: <span className="text-gray-900 dark:text-white font-bold">{order.totalPrice || 0} zł</span></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <CustomDropdown 
                                            placeholder={order.mechanic?.fullName || "Nieprzypisany"}
                                            options={mechanicOptions}
                                            value={order.mechanic?.id}
                                            onChange={(val) => handleMechanicChange(order.id, val)}
                                            isCompleted={isCompleted}
                                            readOnly={isClient}
                                        />
                                        
                                        <CustomDropdown 
                                            options={orderStatusOpts}
                                            value={order.status === 'WAITING_PARTS' ? 'IN_PROGRESS' : order.status}
                                            onChange={(val) => handleStatusChange(order.id, val)}
                                            isCompleted={isCompleted}
                                            readOnly={isClient}
                                        />
                                        
                                        {!isClient && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openModal(order); }}
                                                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                
                                                <button 
                                                    onClick={(e) => handleDelete(e, order.id)}
                                                    className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between text-xs mb-1.5 text-gray-500">
                                        <span>Postęp zadań</span>
                                        <span>{order.tasks?.filter(t => t.status === 'DONE').length}/{order.tasks?.length || 0}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${statusStyles.bg}`} 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {sortedOrders.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        Brak zleceń w wybranej kategorii.
                    </div>
                )}
            </div>

            {isModalOpen && selectedOrder && (
                <OrderDetailsModal 
                    orderId={selectedOrder.id} 
                    onClose={closeModal} 
                    onUpdate={fetchData} 
                    readOnly={isClient} 
                />
            )}

            {!isClient && isCreateModalOpen && (
                <CreateOrderModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={() => { fetchData(); }} 
                />
            )}
        </div>
    );
}