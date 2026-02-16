import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const SystemDashboard = lazy(() => import('./components/superadmin/SystemDashboard'));
const AdminManagement = lazy(() => import('./components/superadmin/AdminManagement'));
const AuditLogs = lazy(() => import('./components/superadmin/AuditLogs'));
const SystemSettings = lazy(() => import('./components/superadmin/SystemSettings'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ManageElections = lazy(() => import('./components/admin/ManageElections'));
const ManageCandidates = lazy(() => import('./components/admin/ManageCandidates'));
const AdminActivityLogs = lazy(() => import('./components/admin/AdminActivityLogs'));
const VotingEvents = lazy(() => import('./components/voter/VotingEvents'));
const VotingEventDetail = lazy(() => import('./components/voter/VotingEventDetail'));
const ViewResults = lazy(() => import('./components/voter/ViewResults'));
const ResultsList = lazy(() => import('./components/voter/ResultsList'));
const MyVotes = lazy(() => import('./components/voter/MyVotes'));
const Profile = lazy(() => import('./components/auth/Profile'));

function App() {
    return (
        <Suspense fallback={<Loader />}>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' } }} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        {/* SuperAdmin Routes */}
                        <Route path="/superadmin/dashboard" element={<SystemDashboard />} />
                        <Route path="/superadmin/admins" element={<AdminManagement />} />
                        <Route path="/superadmin/logs" element={<AuditLogs />} />
                        <Route path="/superadmin/settings" element={<SystemSettings />} />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/elections" element={<ManageElections />} />
                        <Route path="/admin/candidates/:id" element={<ManageCandidates />} />
                        <Route path="/admin/logs" element={<AdminActivityLogs />} />

                        {/* Voter Routes */}
                        <Route path="/voter/dashboard" element={<VotingEvents />} />
                        <Route path="/voter/event/:id" element={<VotingEventDetail />} />
                        <Route path="/voter/results" element={<ResultsList />} />
                        <Route path="/voter/results/:id" element={<ViewResults />} />
                        <Route path="/voter/my-votes" element={<MyVotes />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
