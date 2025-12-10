import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "../App.css";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    totalCategories: 0,
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topSpenders, setTopSpenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#0088FE", "#A569BD"];

  // Fetch dashboard counts
  useEffect(() => {
    axios
      .get("https://localhost:7027/api/admin/stats")
      .then((res) => setCounts(res.data))
      .catch((err) => console.error("Error fetching counts:", err));
  }, []);

  // Fetch monthly expenses
  useEffect(() => {
    axios
      .get("https://localhost:7027/api/admin/expenses/monthly")
      .then((res) => setMonthlyExpenses(res.data))
      .catch((err) => console.error("Error fetching monthly expenses:", err));
  }, []);

  // Fetch category distribution
  useEffect(() => {
    axios
      .get("https://localhost:7027/api/admin/expenses/categorydis")
      .then((res) => {
        const total = res.data.reduce((sum, item) => sum + item.total, 0);
        const withPercent = res.data.map((item) => ({
          ...item,
          percentage: ((item.total / total) * 100).toFixed(1),
        }));
        setCategoryData(withPercent);
      })
      .catch((err) => console.error("Error fetching category data:", err));
  }, []);

  // Fetch top spenders
  useEffect(() => {
    axios
      .get("https://localhost:7027/api/admin/expenses/topspenders")
      .then((res) => {
        setTopSpenders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching top spenders:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    alert("Admin logged out!");
    window.location.href = "/";
  };

  // ✅ Custom label inside each pie slice
  const renderCustomPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    const item = categoryData[index];
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        ₹{item.total} ({item.percentage}%)
      </text>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar open">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "40px" }}>Admin Panel</h2>

        <nav className="sidebar-nav">
          <a href="admin-dashboard" className="nav-link active">
            Dashboard
          </a>
          <a href="manage-user" className="nav-link">
            Manage Users
          </a>
          <a href="managecategory" className="nav-link">
            Manage Categories
          </a>
          <a href="viewexpenses" className="nav-link">
            View Expenses
          </a>

           <a href="adminfeedback" className="nav-link">
              manage feedback
          </a>
        </nav>

        <button
          className="logout-btn"
          style={{ padding: "12px 18px", fontSize: "0.9rem" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Dashboard</h1>
        </header>

        {/* KPI Cards */}
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Users</h3>
            <p>{loading ? "Loading..." : counts.totalUsers}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Expenses</h3>
            <p>{loading ? "Loading..." : counts.totalExpenses}</p>
          </div>
          <div className="dashboard-card">
            <h3>Categories</h3>
            <p>{loading ? "Loading..." : counts.totalCategories}</p>
          </div>
        </section>

        {/* Charts Section */}
        <section
          className="charts-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Horizontal Bar Chart */}
          <div className="dashboard-card" style={{ height: "350px" }}>
            <h3>Monthly Expenses</h3>
            {monthlyExpenses.length === 0 ? (
              <p className="muted">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={monthlyExpenses}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="month" type="category" />
                  <Tooltip formatter={(v) => `₹${v}`} />
                  <Legend />
                  <Bar dataKey="total" fill="#82ca9d">
                    {/* ✅ Money inside the bar */}
                    <LabelList
                      dataKey="total"
                      position="insideLeft"
                      fill="#fff"
                      formatter={(v) => `₹${v}`}
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart */}
          <div className="dashboard-card" style={{ height: "400px" }}>
            <h3>Category Distribution</h3>
            {categoryData.length === 0 ? (
              <p className="muted">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    labelLine={false}
                    label={renderCustomPieLabel}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, entry) => [
                      `₹${value} (${entry.payload.percentage}%)`,
                      entry.payload.category,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Top Spenders Table */}
        <section
          className="dashboard-card"
          style={{ marginTop: "25px", padding: "20px" }}
        >
          <h3>Top 5 Spenders</h3>
          {topSpenders.length === 0 ? (
            <p className="muted">No data available</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f0f0f0",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  <th style={{ padding: "8px" }}>No.</th>
                  <th style={{ padding: "8px" }}>User Name</th>
                  <th style={{ padding: "8px" }}>Total Spent (₹)</th>
                </tr>
              </thead>
              <tbody>
                {topSpenders.map((s, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{index + 1}</td>
                    <td style={{ padding: "8px" }}>{s.userName}</td>
                    <td style={{ padding: "8px" }}>{s.totalSpent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
