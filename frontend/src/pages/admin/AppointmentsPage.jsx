import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
    Plus, Wrench, Truck, Users, Clock 
} from "lucide-react";
import CreateAppointmentModal from "../../components/CreateAppointmentModal";
import AppointmentActionModal from "../../components/AppointmentActionModal";
import OrderDetailsModal from "../../components/OrderDetailsModal";

export default function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const monthNames = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
    const daysShort = ['pon', 'wto', 'śro', 'czw', 'pią', 'sob', 'nie'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [apptRes, orderRes] = await Promise.all([
                api.get("/api/appointments"),
                api.get("/api/orders")
            ]);

            const mappedAppointments = apptRes.data.map(app => {
                let colorClass = 'text-yellow-600';
                let bgClass = 'bg-yellow-50 dark:bg-yellow-900/10';
                let borderClass = 'border-yellow-200 dark:border-yellow-900/30';

                if (app.status === 'CONFIRMED') {
                    colorClass = 'text-green-600';
                    bgClass = 'bg-green-50 dark:bg-green-900/10';
                    borderClass = 'border-green-200 dark:border-green-900/30';
                } else if (app.status === 'CANCELED') {
                    colorClass = 'text-red-600';
                    bgClass = 'bg-red-50 dark:bg-red-900/10';
                    borderClass = 'border-red-200 dark:border-red-900/30';
                }

                return {
                    id: `app-${app.id}`,
                    type: 'MEETING',
                    title: app.description || 'Wizyta serwisowa',
                    subtitle: app.client?.fullName || 'Klient',
                    date: new Date(app.requestedDate),
                    status: app.status,
                    icon: Users,
                    color: colorClass,
                    bgColor: bgClass,
                    borderColor: borderClass,
                    originalData: app
                };
            });

            const mappedOrders = orderRes.data.map(order => {
                const isDelivery = order.status === 'WAITING_PARTS';
                return {
                    id: `ord-${order.id}`,
                    type: isDelivery ? 'DELIVERY' : 'SERVICE',
                    title: `${isDelivery ? 'Dostawa części' : 'Naprawa'} - ${order.car?.brand} ${order.car?.model}`,
                    subtitle: order.car?.owner?.fullName || 'Właściciel',
                    date: new Date(order.createDate),
                    status: order.status,
                    icon: isDelivery ? Truck : Wrench,
                    color: isDelivery ? 'text-blue-600' : 'text-orange-600',
                    bgColor: isDelivery ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-orange-50 dark:bg-orange-900/10',
                    borderColor: isDelivery ? 'border-blue-200 dark:border-blue-900/30' : 'border-orange-200 dark:border-orange-900/30',
                    originalData: order
                };
            });

            setEvents([...mappedAppointments, ...mappedOrders]);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; 
        return { days, firstDay: adjustedFirstDay };
    };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getFullYear() === d2.getFullYear();
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const today = new Date();
    const selectedDateEvents = events.filter(e => isSameDay(e.date, selectedDate));

    const handleEventClick = (event) => {
        if (event.type === 'MEETING') {
            setSelectedAppointmentId(event.id);
        } else if (event.type === 'SERVICE' || event.type === 'DELIVERY') {
            setSelectedOrder(event.originalData);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="text-orange-500" /> Kalendarz
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    <div className="w-full lg:w-5/12 max-w-md mx-auto lg:mx-0">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="font-bold text-xl capitalize text-gray-800 dark:text-white">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-3 text-center mb-3">
                            {daysShort.map(d => (
                                <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-wide">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: days }).map((_, i) => {
                                const day = i + 1;
                                const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isToday = isSameDay(currentDayDate, today);
                                const isSelected = isSameDay(currentDayDate, selectedDate);
                                const hasEvent = events.some(e => isSameDay(e.date, currentDayDate));

                                return (
                                    <button 
                                        key={day} 
                                        onClick={() => setSelectedDate(currentDayDate)}
                                        className={`
                                            relative h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all
                                            ${isSelected 
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl scale-110 z-10' 
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                                            ${isToday && !isSelected ? 'text-orange-500 border-2 border-orange-100 dark:border-orange-900/30' : ''}
                                        `}
                                    >
                                        {day}
                                        {hasEvent && !isSelected && (
                                            <div className="absolute bottom-2 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full lg:w-7/12 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 pt-8 lg:pt-0 lg:pl-10 flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                                    {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                    {isSameDay(selectedDate, today) && <span className="text-sm font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">Dzisiaj</span>}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    Zaplanowane wydarzenia: {selectedDateEvents.length}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105"
                            >
                                <Plus size={18} /> Dodaj wizytę
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-4 custom-scrollbar">
                            {selectedDateEvents.length > 0 ? selectedDateEvents.map(event => (
                                <div 
                                    key={event.id} 
                                    onClick={() => handleEventClick(event)}
                                    className={`${event.bgColor} p-5 rounded-2xl border ${event.borderColor} relative group cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className={`p-3 rounded-xl bg-white dark:bg-black/10 ${event.color}`}>
                                                <event.icon size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-bold opacity-60 mb-1">
                                                    <Clock size={14} />
                                                    {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    <span>•</span>
                                                    <span className="uppercase">{event.type === 'SERVICE' ? 'Naprawa' : event.type === 'MEETING' ? 'Wizyta' : 'Dostawa'}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{event.title}</h4>
                                                <p className="text-sm font-medium opacity-80 mt-1">{event.subtitle}</p>
                                            </div>
                                        </div>
                                        
                                        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm ${event.color}`}>
                                            {event.status}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30">
                                    <CalendarIcon size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">Brak zaplanowanych wydarzeń</p>
                                    <p className="text-sm opacity-60">Kliknij "Dodaj wizytę" aby coś zaplanować</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateAppointmentModal 
                    selectedDate={selectedDate}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={fetchData}
                />
            )}

            {selectedAppointmentId && (
                <AppointmentActionModal 
                    appointmentId={selectedAppointmentId}
                    onClose={() => setSelectedAppointmentId(null)}
                    onSuccess={fetchData}
                />
            )}

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}