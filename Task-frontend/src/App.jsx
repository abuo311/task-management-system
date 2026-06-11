import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LaborerDashboard from './pages/LaborerDashboard'; // New Component
import LaborerList from './pages/LaborerList';
import TaskManager from './pages/TaskManager';
import MyTasks from './pages/MyTasks';
import SpecializationManager from './pages/SpecializationManager';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import AttendanceManager from './pages/AttendanceManager';
import ThemeSettings from './pages/ThemeSettings';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const isAuthorized = roles.some(role => hasRole(role));
        if (!isAuthorized) return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const { user, hasRole } = useAuth();

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<DashboardLayout />}>
                    {/* Role-based Home Routing */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {hasRole("LABORER") ? <LaborerDashboard /> : <Dashboard />}
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    
                    {/* Added LABORER to allowed roles */}
                    <Route path="/my-tasks" element={
                        <ProtectedRoute requiredRole={["USER", "SYSTEM_ADMIN", "ADMIN", "MANAGER", "LABORER"]}>
                            <MyTasks />
                        </ProtectedRoute>
                    } />

                    <Route path="/attendance" element={<ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}><AttendanceManager /></ProtectedRoute>} />
                    <Route path="/laborers" element={<ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}><LaborerList /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}><TaskManager /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><UserManagement /></ProtectedRoute>} />
                    <Route path="/trades" element={<ProtectedRoute requiredRole={["SYSTEM_ADMIN", "MANAGER"]}><SpecializationManager /></ProtectedRoute>} />
                    <Route path="/theme-settings" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;