import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,Cell
} from "recharts";
import "../App.css";

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const COLORS = ["#6c4bc5", "#ff6b6b", "#4cafef", "#ffb74d", "#81c784"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, categoriesRes, expensesRes] = await Promise.all([
        axios.get("https://localhost:7027/api/admin/getalluser", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("https://localhost:7027/api/admin/getcategories", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("https://localhost:7027/api/admin/getexpenses", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setExpenses(expensesRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch reports data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const topUsers = users
    .map(user => {
      const userExpenses = expenses.filter(exp => exp.uid === user.id);
      const totalSpent = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return { id: user.id, name: user.name, totalSpent, count: userExpenses.length };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const categorySummary = categories.map(cat => {
    const total = expenses
      .filter(exp => exp.categoryname === cat.cname)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: cat.cname, amount: total };
  });

  const monthlyData = {};
  expenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthlyData[month]) monthlyData[month] = 0;
    monthlyData[month] += exp.amount;
  });
  const trendData = Object.keys(monthlyData).map(month => ({ month, amount: monthlyData[month] }));

  const handleLogout = () => {
    alert("Admin logged out!");
    window.location.href = "/login";
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar open">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "40px" }}>Admin Panel</h2>
        <nav className="sidebar-nav">
          <a href="admin-dashboard" className="nav-link">Dashboard</a>
          <a href="manage-user" className="nav-link">Manage Users</a>
          <a href="manage-category" className="nav-link">Manage Categories</a>
          <a href="view-expenses" className="nav-link">View Expenses</a>
          <a href="reports" className="nav-link active">Reports</a>
        </nav>
        <button className="logout-btn" style={{ padding: "12px 18px", fontSize: "0.9rem" }} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="main-content">
        <header className="header">
          <h1 style={{ fontSize: "1.6rem" }}>Reports</h1>
        </header>

        {loading ? (
          <p className="loading-text">Loading reports...</p>
        ) : (
          <div>
            {/* Total Amount */}
            <div className="dashboard-cards" style={{ marginBottom: "40px", width: "200px" }}>
              <div className="dashboard-card">
                <h3>Total Amount</h3>
                <p>₹{totalAmount}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="dashboard-cards" style={{ marginBottom: "40px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
              <div className="dashboard-card" style={{ flex: 1, minWidth: "350px" }}>
                <h3>Category-wise Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categorySummary} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#6c4bc5" barSize={40}>
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="dashboard-card" style={{ flex: 1, minWidth: "350px" }}>
                <h3>Monthly Expense Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#ff6b6b" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Spending Users */}
            <div className="table-container">
              <h3 style={{ marginBottom: "10px" }}>Top Spending Users</h3>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Total Spent</th>
                    <th>Number of Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>₹{user.totalSpent}</td>
                      <td>{user.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
