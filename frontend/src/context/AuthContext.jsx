import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isLoading, setIsLoading] = useState(false);

    const login = async (username, password, rememberMe = false) => {
        setIsLoading(true);
        try {
            const loginData = {
                username: username,
                password: password
            };

            const response = await api.post('/login', loginData);

            if (response.status === 200 && response.data.token) {
                const userData = { 
                    username: response.data.username, 
                    role: response.data.roles && response.data.roles.length > 0 ? response.data.roles[0] : 'CLIENT',
                    id: response.data.id,
                    token: response.data.token
                };
                
                setUser(userData);
                if (rememberMe) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    sessionStorage.removeItem('user'); 
                } else {
                    sessionStorage.setItem('user', JSON.stringify(userData));
                    localStorage.removeItem('user'); 
                }
                
                setIsLoading(false);
                return userData; 
            }
        } catch (error) {
            console.error("Login error", error);
        }
        setIsLoading(false);
        return null;
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);