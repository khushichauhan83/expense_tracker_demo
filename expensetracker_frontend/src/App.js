// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/register';
import Login from './pages/login';
import AdminDashboard from "./pages/admin-dashboard";
import ManageUsers from './pages/manage-user';
import ManageCategory from './pages/managecategory';
import ViewExpenses from './pages/viewexpenses';
import Reports from './pages/reports';
import Dashboard from './pages/dashboard';
import Expenses from './pages/expenses';
import AdminLogin from './pages/admin-login';
import Budget from './pages/Budget';
import Feedback from './pages/feedback';
import AdminFeedback from './pages/adminfeedback';
import Messages from './pages/messages';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-user" element={<ManageUsers />} />
         <Route path="/managecategory" element={<ManageCategory />} />
         <Route path="/viewexpenses" element={<ViewExpenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={token ? <Expenses /> : <Navigate to="/login" />} />
        <Route path="/Budget" element={<Budget />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/adminfeedback" element={<AdminFeedback />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
