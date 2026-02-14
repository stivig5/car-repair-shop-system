import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function DashboardCalendar({ appointments = [], orders = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; 

        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const today = new Date();

    const eventsForDay = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        
        const apps = appointments.filter(a => new Date(a.requestedDate).toDateString() === checkDate)
            .map(a => ({ type: 'WIZYTA', title: `Wizyta - ${a.client?.fullName || 'Klient'}`, status: a.status, color: 'bg-orange-100 text-orange-700 border-orange-200' }));
        
        const ords = orders.filter(o => o.createDate && new Date(o.createDate).toDateString() === checkDate)
            .map(o => ({ type: 'ZLECENIE', title: `Naprawa - ${o.car?.brand} ${o.car?.model}`, status: o.status, color: 'bg-green-100 text-green-700 border-green-200' }));

        return [...apps, ...ords];
    };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const monthNames = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];

    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const displayedEvents = eventsForDay(selectedDay);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={20} /></button>
                    <span className="font-bold text-lg capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={20} /></button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400">
                    {['pon', 'wto', 'śro', 'czw', 'pią', 'sob', 'nie'].map(d => <div key={d}>{d}</div>)}
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth();
                        const isSelected = day === selectedDay;
                        const hasEvents = eventsForDay(day).length > 0;

                        return (
                            <button 
                                key={day} 
                                onClick={() => setSelectedDay(day)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                                    ${isSelected ? 'bg-[#0f172a] text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                                    ${isToday && !isSelected ? 'text-orange-500 font-bold border border-orange-200' : ''}
                                `}
                            >
                                {day}
                                {hasEvents && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {selectedDay} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
                        <Plus size={16} /> Dodaj wydarzenie
                    </button>
                </div>

                <div className="space-y-4">
                    {displayedEvents.length > 0 ? displayedEvents.map((evt, idx) => (
                        <div key={idx} className={`p-5 rounded-xl border ${evt.color} flex justify-between items-center transition-transform hover:scale-[1.01]`}>
                            <div>
                                <h4 className="font-bold text-lg">{evt.title}</h4>
                                <span className="text-sm opacity-80 font-medium mt-1 inline-block">{evt.status}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">{evt.type}</span>
                        </div>
                    )) : (
                        <div className="text-gray-400 text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            Brak zaplanowanych wydarzeń na ten dzień.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}