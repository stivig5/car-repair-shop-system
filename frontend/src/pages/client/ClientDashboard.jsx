import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { FileText, Car, CalendarClock, ArrowRight, CheckCircle, XCircle, Clock, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subColor, linkTo }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => linkTo && navigate(linkTo)}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
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
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${subColor} opacity-20 group-hover:scale-150 transition-transform duration-500 ease-out`} />
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                <ArrowRight size={20} />
            </div>
        </div>
    );
};

export default function ClientDashboard() {
    const [stats, setStats] = useState({ orders: 0, cars: 0, appointments: 0 });
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, carsRes, apptRes] = await Promise.all([
                    api.get('/api/orders'),
                    api.get('/api/cars/my'),
                    api.get('/api/appointments/my')
                ]);

                const activeOrdersList = ordersRes.data.filter(o => o.status !== 'COMPLETED');
                const activeAppointmentsList = apptRes.data
                    .filter(a => a.status !== 'CANCELED' && a.status !== 'COMPLETED')
                    .sort((a, b) => new Date(a.requestedDate) - new Date(b.requestedDate));

                setStats({
                    orders: activeOrdersList.length,
                    cars: carsRes.data.length,
                    appointments: activeAppointmentsList.length
                });

                setOrders(activeOrdersList.slice(0, 3));
                setAppointments(activeAppointmentsList.slice(0, 3));
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getApptStatusBadge = (status) => {
        switch(status) {
            case 'CONFIRMED':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-500/10 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/20"><CheckCircle size={12}/> Potwierdzona</span>;
            case 'CANCELED':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-500/10 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-500/20"><XCircle size={12}/> Odrzucona</span>;
            case 'PENDING':
            default:
                return <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-500/20"><Clock size={12}/> Oczekuje</span>;
        }
    };

    const getOrderStatusBadge = (status) => {
        if (status === 'WAITING_PARTS') 
            return <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">Czeka na części</span>;
        if (status === 'IN_PROGRESS') 
            return <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-500/10 px-2.5 py-1 rounded-full">W trakcie</span>;
        return <span className="text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">Przyjęte</span>;
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Ładowanie pulpitu...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Moje Pojazdy" 
                    value={stats.cars} 
                    icon={Car} 
                    color="text-blue-500" 
                    subColor="bg-blue-50 dark:bg-blue-500/10" 
                    linkTo="/client/cars"
                />
                <StatCard 
                    title="Aktywne Naprawy" 
                    value={stats.orders} 
                    icon={Wrench} 
                    color="text-green-500" 
                    subColor="bg-green-50 dark:bg-green-500/10" 
                    linkTo="/client/orders"
                />
                <StatCard 
                    title="Nadchodzące Wizyty" 
                    value={stats.appointments} 
                    icon={CalendarClock} 
                    color="text-purple-500" 
                    subColor="bg-purple-50 dark:bg-purple-500/10" 
                    linkTo="/client/appointments"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <CalendarClock className="text-purple-500" size={20} /> 
                            Twoje Wizyty
                        </h3>
                        <Link to="/client/appointments" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
                            Zobacz wszystkie &rarr;
                        </Link>
                    </div>

                    <div className="flex-1 space-y-4">
                        {appointments.length > 0 ? appointments.map(appt => (
                            <div key={appt.id} className="group p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                                        <Clock size={16} className="text-purple-400" />
                                        {new Date(appt.requestedDate).toLocaleDateString()} 
                                        <span className="text-gray-400 font-normal">|</span>
                                        {new Date(appt.requestedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    {getApptStatusBadge(appt.status)}
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                                    {appt.car ? `${appt.car.brand} ${appt.car.model}` : 'Pojazd nieznany'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {appt.description}
                                </p>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 text-gray-400">
                                    <CalendarClock size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Brak nadchodzących wizyt.</p>
                                <Link to="/client/appointments" className="mt-2 inline-block text-sm font-bold text-orange-500 hover:text-orange-600">
                                    Umów wizytę
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Wrench className="text-green-500" size={20} /> 
                            Status Napraw
                        </h3>
                        <Link to="/client/orders" className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400">
                            Historia &rarr;
                        </Link>
                    </div>

                    <div className="flex-1 space-y-4">
                        {orders.length > 0 ? orders.map(order => (
                            <div key={order.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Zlecenie #{order.id}
                                    </span>
                                    {getOrderStatusBadge(order.status)}
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                                    {order.car ? `${order.car.brand} ${order.car.model}` : 'Pojazd'}
                                </h4>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-xs text-gray-500">Data przyjęcia: {new Date(order.createDate).toLocaleDateString()}</p>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {order.totalCost ? `${order.totalCost} PLN` : '- PLN'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 text-gray-400">
                                    <Wrench size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Brak aktywnych napraw.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}