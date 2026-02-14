import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import DashboardCalendar from '../../components/dashboard/DashboardCalendar';
import { FileText, Car, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, subColor, linkTo }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => linkTo && navigate(linkTo)}
            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40 relative overflow-hidden group ${linkTo ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
        >
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${subColor} text-gray-700 dark:text-white`}>
                    <Icon size={24} className={color} />
                </div>
            </div>
            <div className="z-10">
                 {trend && <p className="text-xs font-bold text-green-500 flex items-center gap-1">{trend} <span className="text-gray-400 font-normal">vs. poprzedni miesiąc</span></p>}
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${subColor} opacity-20 group-hover:scale-150 transition-transform duration-500 ease-out`} />
        </div>
    );
};

export default function MechanicDashboard() {
    const [stats, setStats] = useState({ orders: 0, cars: 0, lowStock: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockParts, setLowStockParts] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, carsRes, inventoryRes, apptRes] = await Promise.all([
                    api.get('/api/orders'),
                    api.get('/api/cars'),
                    api.get('/api/inventory'),
                    api.get('/api/appointments')
                ]);

                const parts = inventoryRes.data;
                const lowStock = parts.filter(p => {
                    const minQty = p.minQuantity !== undefined ? p.minQuantity : 5;
                    return p.quantityInStock < minQty;
                });

                const activeOrdersCount = ordersRes.data.filter(o => o.status !== 'COMPLETED').length;
                const carsInServiceCount = carsRes.data.filter(c => c.status === 'IN_SERVICE').length;

                setStats({
                    orders: activeOrdersCount,
                    cars: carsInServiceCount,
                    lowStock: lowStock.length
                });

                const sortedOrders = ordersRes.data.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
                setRecentOrders(sortedOrders.slice(0, 5));
                setOrders(sortedOrders);
                
                setLowStockParts(lowStock.slice(0, 3));
                setAppointments(apptRes.data);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Moje Zlecenia" 
                    value={stats.orders} 
                    icon={FileText} 
                    trend="+5%" 
                    color="text-emerald-500" 
                    subColor="bg-emerald-50 dark:bg-emerald-500/10" 
                    linkTo="/mechanic/orders"
                />
                <StatCard 
                    title="Pojazdy w serwisie" 
                    value={stats.cars} 
                    icon={Car} 
                    color="text-blue-500" 
                    subColor="bg-blue-50 dark:bg-blue-500/10" 
                    linkTo="/mechanic/cars"
                />
                <StatCard 
                    title="Niski stan magazynu" 
                    value={stats.lowStock} 
                    icon={Package} 
                    color="text-red-500" 
                    subColor="bg-red-50 dark:bg-red-500/10" 
                    linkTo="/mechanic/inventory"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ostatnie zlecenia</h3>
                        <Link to="/mechanic/orders" className="text-sm text-blue-500 font-bold hover:underline">Zobacz wszystkie</Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Pojazd</th>
                                    <th className="px-4 py-3">Klient</th>
                                    <th className="px-4 py-3">Mechanik</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-800 dark:text-white">
                                            {order.car?.brand} {order.car?.model} <span className="text-gray-400 font-normal ml-1">{order.car?.year}</span>
                                        </td>
                                        <td className="px-4 py-4">{order.car?.owner?.fullName || 'Nieznany'}</td>
                                        <td className="px-4 py-4">{order.mechanic?.fullName || <span className="text-gray-400 italic">Brak</span>}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                                                ${order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                  order.status === 'IN_PROGRESS' || order.status === 'WAITING_PARTS' ? 'bg-orange-100 text-orange-700' :
                                                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status === 'WAITING_PARTS' ? 'CZEKA NA CZĘŚCI' : order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentOrders.length === 0 && <p className="text-center py-4 text-gray-400">Brak zleceń.</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Braki w magazynie</h3>
                        <AlertTriangle size={18} className="text-red-500" />
                    </div>

                    <div className="space-y-4">
                        {lowStockParts.map(part => {
                            const minStock = part.minQuantity || 5; 
                            const percentage = Math.min((part.quantityInStock / minStock) * 100, 100);
                            
                            return (
                                <div key={part.id} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
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
                            <div className="text-center py-8 text-green-600 bg-green-50 rounded-xl">
                                <Package size={32} className="mx-auto mb-2 opacity-50" />
                                Magazyn jest pełny!
                            </div>
                        )}
                        <Link to="/mechanic/inventory" className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
                            Przejdź do magazynu <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Kalendarz</h3>
                <DashboardCalendar appointments={appointments} orders={orders} />
            </div>
        </div>
    );
}