import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import DashboardCalendar from '../../components/dashboard/DashboardCalendar';
import { Users, FileText, Package, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, subColor, linkTo }) => {
    const Content = () => (
        <>
            <div className="flex justify-between items-start z-20 relative">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${subColor} text-gray-700 dark:text-white`}>
                    <Icon size={24} className={color} />
                </div>
            </div>
            <div className="z-20 relative mt-2">
                 {trend && <p className="text-xs font-bold text-green-500 flex items-center gap-1">{trend}</p>}
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${subColor} opacity-20 group-hover:scale-150 transition-transform duration-500 ease-out z-0`} />
        </>
    );

    if (linkTo) {
        return (
            <Link 
                to={linkTo}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all block cursor-pointer"
            >
                <Content />
            </Link>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40 relative overflow-hidden">
            <Content />
        </div>
    );
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, lowStock: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockParts, setLowStockParts] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, ordersRes, inventoryRes, apptRes] = await Promise.all([
                    api.get('/api/users'),
                    api.get('/api/orders'),
                    api.get('/api/inventory'),
                    api.get('/api/appointments')
                ]);

                const parts = inventoryRes.data;
                const lowStock = parts.filter(p => {
                    const minQty = p.minQuantity !== undefined ? p.minQuantity : 5;
                    return p.quantityInStock < minQty;
                });

                const activeOrdersCount = ordersRes.data.filter(o => o.status !== 'COMPLETED').length;
                
                const totalRevenue = ordersRes.data
                    .filter(o => o.status === 'COMPLETED')
                    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

                setStats({
                    users: usersRes.data.length,
                    orders: activeOrdersCount,
                    revenue: totalRevenue.toFixed(2), 
                    lowStock: lowStock.length
                });

                const sortedOrders = ordersRes.data.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
                setRecentOrders(sortedOrders.slice(0, 5));
                setOrders(sortedOrders); 
                
                setLowStockParts(lowStock.slice(0, 3));
                setAppointments(apptRes.data); 

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Ładowanie panelu administratora...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Użytkownicy" 
                    value={stats.users} 
                    icon={Users} 
                    color="text-blue-500" 
                    subColor="bg-blue-50 dark:bg-blue-500/10" 
                    linkTo="/admin/users"
                />
                <StatCard 
                    title="Aktywne Zlecenia" 
                    value={stats.orders} 
                    icon={FileText} 
                    color="text-orange-500" 
                    subColor="bg-orange-50 dark:bg-orange-500/10" 
                    linkTo="/admin/orders"
                />
                <StatCard 
                    title="Całkowity Przychód" 
                    value={`${stats.revenue} zł`} 
                    icon={DollarSign} 
                    color="text-green-500" 
                    subColor="bg-green-50 dark:bg-green-500/10" 
                    linkTo="/admin/reports"
                />
                <StatCard 
                    title="Braki w Magazynie" 
                    value={stats.lowStock} 
                    icon={Package} 
                    color="text-red-500" 
                    subColor="bg-red-50 dark:bg-red-500/10" 
                    linkTo="/admin/inventory"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ostatnie zlecenia</h3>
                        <Link to="/admin/orders" className="text-sm text-orange-500 font-bold hover:underline flex items-center gap-1">
                            Zobacz wszystkie <ArrowRight size={16}/>
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Pojazd</th>
                                    <th className="px-4 py-3">Klient</th>
                                    <th className="px-4 py-3 hidden sm:table-cell">Mechanik</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-800 dark:text-white">
                                            {order.car?.brand} {order.car?.model} 
                                            <span className="text-gray-400 font-normal ml-1 text-xs block sm:inline">({order.car?.licPlate})</span>
                                        </td>
                                        <td className="px-4 py-4">{order.car?.owner?.fullName || 'Nieznany'}</td>
                                        <td className="px-4 py-4 hidden sm:table-cell">{order.mechanic?.fullName || <span className="text-gray-400 italic">-</span>}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap
                                                ${order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                  order.status === 'IN_PROGRESS' || order.status === 'WAITING_PARTS' ? 'bg-orange-100 text-orange-700' :
                                                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status === 'WAITING_PARTS' ? 'CZEKA' : order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentOrders.length === 0 && <p className="text-center py-8 text-gray-400">Brak ostatnich zleceń.</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Braki w magazynie</h3>
                        <AlertTriangle size={18} className="text-red-500" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {lowStockParts.map(part => {
                            const minStock = part.minQuantity || 5; 
                            const percentage = Math.min((part.quantityInStock / minStock) * 100, 100);
                            
                            return (
                                <div key={part.id} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-gray-800 dark:text-white text-sm truncate pr-2">{part.name}</span>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">min. {minStock}</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-extrabold text-red-600">{part.quantityInStock} <span className="text-sm font-medium text-red-400">szt.</span></span>
                                    </div>
                                    <div className="w-full h-1.5 bg-red-200 dark:bg-red-900/30 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {lowStockParts.length === 0 && (
                            <div className="text-center py-12 text-green-600 bg-green-50 dark:bg-green-900/10 rounded-2xl h-full flex flex-col items-center justify-center">
                                <Package size={48} className="mb-3 opacity-50" />
                                <p className="font-bold">Magazyn jest pełny!</p>
                                <p className="text-sm opacity-75">Brak produktów poniżej stanu.</p>
                            </div>
                        )}
                    </div>
                    
                    <Link to="/admin/inventory" className="flex items-center justify-center gap-2 w-full mt-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 transition-all">
                        Przejdź do magazynu <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Kalendarz Warsztatu</h3>
                <DashboardCalendar appointments={appointments} orders={orders} />
            </div>
        </div>
    );
}