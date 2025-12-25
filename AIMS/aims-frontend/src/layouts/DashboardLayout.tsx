import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
    const { user, isAdmin, isPM, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>AIMS Dashboard</h2>
                    <p className="user-email">{user?.email}</p>
                    <div className="user-roles">
                        {user?.roles?.map((role) => (
                            <span key={role} className="role-badge">
                                {role === 'ADMIN' ? 'Admin' : 'PM'}
                            </span>
                        ))}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Admin Section */}
                    {isAdmin() && (
                        <div className="nav-section">
                            <h3 className="nav-section-title">Admin</h3>
                            <Link
                                to="/management/admin/users"
                                className={`nav-link ${isActive('/management/admin/users') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">👥</span>
                                User Management
                            </Link>
                        </div>
                    )}

                    {/* Product Manager Section */}
                    {isPM() && (
                        <div className="nav-section">
                            <h3 className="nav-section-title">Product Manager</h3>
                            <Link
                                to="/management/pm/products"
                                className={`nav-link ${isActive('/management/pm/products') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">📦</span>
                                Products
                            </Link>
                            <Link
                                to="/management/pm/statistics"
                                className={`nav-link ${isActive('/management/pm/statistics') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">📊</span>
                                Statistics
                            </Link>
                            <Link
                                to="/management/pm/refunds"
                                className={`nav-link ${isActive('/management/pm/refunds') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">💰</span>
                                Refund Approval
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={() => navigate('/')} className="btn-secondary">
                        🏠 Back to Store
                    </button>
                    <button onClick={logout} className="btn-logout">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
