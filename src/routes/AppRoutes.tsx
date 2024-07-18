import React, { useContext } from 'react';
import { Routes as Router, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../common/context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

const PrivateRoutes = () => {
  const { authenticated } = useContext(AuthContext);

  if (!authenticated || localStorage.getItem('account') === null) return <Navigate to="/" replace />;

  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Router>
  );
};

export default AppRoutes;
