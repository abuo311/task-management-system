import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LaborerList from './pages/LaborerList';
import TaskManager from './pages/TaskManager';
import MyTasks from './pages/MyTasks'; 
import SpecializationManager from './pages/SpecializationManager'; 
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import AttendanceManager from './pages/AttendanceManager'; // 1. Import the component
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Securing Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        // Handle array of roles or single role string
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const isAuthorized = roles.some(role => hasRole(role));

        if (!isAuthorized) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/my-tasks" element={
                    <ProtectedRoute requiredRole={["USER", "SYSTEM_ADMIN", "ADMIN", "MANAGER"]}>
                        <MyTasks />
                    </ProtectedRoute>
                } />

                {/* 2. Added Attendance Manager Route (Accessible to Management roles) */}
                <Route path="/attendance" element={
                    <ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}>
                        <AttendanceManager />
                    </ProtectedRoute>
                } />

                <Route path="/laborers" element={
                    <ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}>
                        <LaborerList />
                    </ProtectedRoute>
                } />

                <Route path="/tasks" element={
                    <ProtectedRoute requiredRole={["SYSTEM_ADMIN", "ADMIN", "MANAGER"]}>
                        <TaskManager />
                    </ProtectedRoute>
                } />

                <Route path="/users" element={
                    <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                        <UserManagement />
                    </ProtectedRoute>
                } />

                <Route path="/trades" element={
                    <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                        <SpecializationManager />
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={<Navigate to="/trades" replace />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;