import { Outlet } from 'react-router-dom'; // Import Outlet
import { CarIcon } from 'lucide-react';
import { WrenchIcon } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const AuthLayout = ({ children }) => {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* HARDWARE ACCELERATION FIXES */
        .blob-fix {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0); /* Wymuszenie GPU */
          backface-visibility: hidden;
        }

        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-pulse-slow { animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .anim-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .anim-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .anim-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>

      <div className="min-h-screen flex bg-white dark:bg-gray-950 overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
          
          <div className="absolute inset-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] anim-pulse-slow blob-fix" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500 rounded-full blur-[100px] anim-pulse-slow blob-fix"/>
          </div>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10 flex flex-col justify-center px-16 h-full text-white">
            
            <div className="flex items-center gap-3 mb-12 anim-fade-in">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <CarIcon className="w-10 h-10 text-orange-500" />
              </div>
              <span className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">AutoFlow</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6 anim-slide-up" style={{ animationDelay: '0.1s' }}>
              Zarządzaj swoim<br />
              <span className="text-orange-500">
                serwisem samochodowym
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-md anim-slide-up" style={{ animationDelay: '0.2s' }}>
              Kompleksowy system do zarządzania zleceniami, klientami i magazynem części.
            </p>
            
            <div className="space-y-4">
              {[
                'Zarządzanie zleceniami i naprawami',
                'Kalendarz wizyt',
                'Magazyn części i historia serwisowa'
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 anim-slide-up" 
                  style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                  <span className="text-slate-200 font-medium tracking-wide">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-20 right-20 anim-float blob-fix">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
                <WrenchIcon className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 relative">
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>
          
          <div className="w-full max-w-md anim-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex lg:hidden items-center justify-center gap-3 mb-10 anim-scale-in">
              <div className="p-2.5 rounded-xl bg-orange-500 shadow-lg">
                <CarIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">AutoFlow</span>
            </div>
            
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;