import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) { 
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <button
            onClick={toggleTheme}
            className={`p-1 rounded-full ease-in-out group relative
                       ${mounted ? 'transition-all duration-500' : ''}
                       bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-white
                       dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700
                       ${className}`} 
            title={"Przełącz na tryb " + (theme === 'dark' ? 'jasny' : 'ciemny')}
        >
            <div className="relative w-7 h-7 flex items-center justify-center">
                <Sun
                    className={`w-6 h-6 text-yellow-500 absolute ease-in-out
                        ${mounted ? 'transition-all duration-500' : ''}
                        ${theme === 'dark' 
                            ? 'rotate-180 scale-0 opacity-0' 
                            : 'rotate-0 scale-100 opacity-100'
                        }
                        group-hover:text-yellow-600
                    `}
                />
                
                <Moon
                    className={`w-6 h-6 text-blue-400 absolute ease-in-out
                        ${mounted ? 'transition-all duration-500' : ''}
                        ${theme === 'dark' 
                            ? 'rotate-0 scale-100 opacity-100' 
                            : '-rotate-180 scale-0 opacity-0'
                        }
                        dark:group-hover:text-blue-300
                    `}
                />
            </div>
            
            <span className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none
                ${theme === 'dark' 
                    ? 'bg-blue-400/20 opacity-0 group-hover:opacity-100' 
                    : 'bg-yellow-500/20 opacity-0 group-hover:opacity-100'
                } blur-md`} 
            />
        </button>
    );
}