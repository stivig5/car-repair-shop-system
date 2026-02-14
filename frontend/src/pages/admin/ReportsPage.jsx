import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    TrendingUp, Users, Car, CheckCircle, DollarSign, 
    Calendar, Wrench, AlertCircle 
} from "lucide-react";

const StatCard = ({ title, value, subValue, icon: Icon, colorBg, colorText }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
            {subValue && (
                <p className={`text-xs font-bold flex items-center gap-1 ${colorText}`}>
                    <TrendingUp size={14} /> {subValue}
                </p>
            )}
        </div>
        <div className={`p-4 rounded-xl ${colorBg} ${colorText}`}>
            <Icon size={24} />
        </div>
    </div>
);

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeClients: 0,
        carsInService: 0,
        completedOrders: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [topMechanics, setTopMechanics] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, usersRes, carsRes] = await Promise.all([
                    api.get("/api/orders"),
                    api.get("/api/users"),
                    api.get("/api/cars")
                ]);

                const orders = ordersRes.data;
                const users = usersRes.data;
                const cars = carsRes.data;

                const revenue = orders
                    .filter(o => o.status === 'COMPLETED')
                    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

                const clientsCount = users.filter(u => u.userRole === 'CLIENT').length;
                const carsServiceCount = cars.filter(c => c.status === 'IN_SERVICE').length;
                const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

                setStats({
                    totalRevenue: revenue,
                    activeClients: clientsCount,
                    carsInService: carsServiceCount,
                    completedOrders: completedCount
                });

                const months = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
                const monthlyData = new Array(12).fill(0);

                orders.forEach(order => {
                    if (order.status === 'COMPLETED' && order.endDate) {
                        const month = new Date(order.endDate).getMonth();
                        monthlyData[month] += (order.totalPrice || 0);
                    }
                });

                setRevenueData(monthlyData.map((val, index) => ({
                    name: months[index],
                    total: val
                })));

                const statusCounts = { NEW: 0, IN_PROGRESS: 0, WAITING_PARTS: 0, COMPLETED: 0 };
                orders.forEach(o => {
                    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
                });

                setStatusData([
                    { name: 'Oczekujące', value: statusCounts.NEW, color: '#3b82f6' },
                    { name: 'W trakcie', value: statusCounts.IN_PROGRESS + statusCounts.WAITING_PARTS, color: '#f97316' },
                    { name: 'Zakończone', value: statusCounts.COMPLETED, color: '#22c55e' },
                ]);

                const mechanicMap = {};
                orders.forEach(o => {
                    if (o.status === 'COMPLETED' && o.mechanic) {
                        const name = o.mechanic.fullName || o.mechanic.username;
                        if (!mechanicMap[name]) mechanicMap[name] = { name, count: 0, value: 0 };
                        mechanicMap[name].count += 1;
                        mechanicMap[name].value += (o.totalPrice || 0);
                    }
                });
                
                const sortedMechanics = Object.values(mechanicMap)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3);
                
                setTopMechanics(sortedMechanics);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Raporty i Statystyki</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Przychód całkowity" 
                    value={`${stats.totalRevenue.toLocaleString()} zł`} 
                    subValue="+12% vs poprz. msc"
                    icon={DollarSign}
                    colorBg="bg-green-100 dark:bg-green-900/30"
                    colorText="text-green-600 dark:text-green-500"
                />
                <StatCard 
                    title="Aktywni klienci" 
                    value={stats.activeClients} 
                    subValue="+3 nowych"
                    icon={Users}
                    colorBg="bg-blue-100 dark:bg-blue-900/30"
                    colorText="text-blue-600 dark:text-blue-500"
                />
                <StatCard 
                    title="Pojazdy w serwisie" 
                    value={stats.carsInService} 
                    subValue="Aktualnie naprawiane"
                    icon={Car}
                    colorBg="bg-orange-100 dark:bg-orange-900/30"
                    colorText="text-orange-600 dark:text-orange-500"
                />
                <StatCard 
                    title="Zlecenia zakończone" 
                    value={stats.completedOrders} 
                    subValue="98% terminowo"
                    icon={CheckCircle}
                    colorBg="bg-gray-100 dark:bg-gray-700"
                    colorText="text-gray-600 dark:text-gray-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-orange-500" /> Przychody miesięczne
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                                    tickFormatter={(value) => `${value/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-500" /> Status zleceń
                    </h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">{stats.completedOrders + stats.activeClients}</span>
                            <p className="text-xs text-gray-500">Razem</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Wrench size={20} className="text-purple-500" /> Najlepsi mechanicy (przychód)
                </h3>
                <div className="space-y-4">
                    {topMechanics.length > 0 ? topMechanics.map((mech, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-700'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{mech.name}</p>
                                    <p className="text-xs text-gray-500">Zakończone zlecenia: {mech.count}</p>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-green-600 dark:text-green-400">{mech.value} zł</span>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">Brak danych o zakończonych zleceniach.</p>
                    )}
                </div>
            </div>
        </div>
    );
}