import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import MechanicLayout from './layouts/MechanicLayout'; // Import nowego layoutu

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import MechanicDashboard from './pages/mechanic/MechanicDashboard'; // Import nowego dashboardu

import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';

import UsersPage from './pages/admin/UsersPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import InventoryPage from './pages/admin/InventoryPage';
import CarsPage from './pages/admin/CarsPage';
import OrdersPage from './pages/admin/OrdersPage';
import ReportsPage from './pages/admin/ReportsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    
    if (!user) return <Navigate to="/" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'MECHANIC') return <Navigate to="/mechanic/dashboard" />;
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
        return <Navigate to="/" />;
    }
    
    return children;
};

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AuthLayout />}>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                        </Route>

                        {/* --- FOR ADMIN --- */}
                        <Route element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UsersPage />} />
                            <Route path="/admin/appointments" element={<AppointmentsPage />} />
                            <Route path="/admin/inventory" element={<InventoryPage />} />
                            <Route path="/admin/cars" element={<CarsPage />} />
                            <Route path="/admin/orders" element={<OrdersPage />} />
                            <Route path="/admin/reports" element={<ReportsPage />} />
                        </Route>

                        {/* --- FOR MECHANIC --- */}
                        <Route element={
                            <ProtectedRoute allowedRoles={['MECHANIC']}>
                                <MechanicLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="/mechanic/dashboard" element={<MechanicDashboard />} />
                            <Route path="/mechanic/appointments" element={<AppointmentsPage />} />
                            <Route path="/mechanic/inventory" element={<InventoryPage />} />
                            <Route path="/mechanic/cars" element={<CarsPage />} />
                            <Route path="/mechanic/orders" element={<OrdersPage />} />
                        </Route>
                        
                        {/* --- FOR CLIENT --- */}
                        <Route element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientLayout /></ProtectedRoute>}>
                            <Route path="/client/dashboard" element={<ClientDashboard />} />
                            <Route path="/client/cars" element={<CarsPage />} />
                            <Route path="/client/orders" element={<OrdersPage />} />
                            <Route path="/client/appointments" element={<AppointmentsPage />} />
                        </Route>

                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}