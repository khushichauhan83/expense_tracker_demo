import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const token = localStorage.getItem("token");

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://localhost:7027/api/admin/getexpenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      alert("Failed to fetch expenses");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Normalize function for case-insensitive comparison
  const normalize = (val) => (val ? val.toString().toLowerCase() : "");

  // Filtered expenses by selected field (case-insensitive)
  const filteredByField =
    filterField && filterValue
      ? expenses.filter((exp) => {
          let fieldVal = exp[filterField];
          if (filterField === "date") {
            fieldVal = fieldVal ? new Date(fieldVal).toLocaleDateString() : "";
          } else {
            fieldVal = fieldVal ? fieldVal.toString() : "";
          }
          return normalize(fieldVal).startsWith(normalize(filterValue));
        })
      : expenses;

  // Filtered by search (case-insensitive)
  const filteredExpenses = filteredByField.filter((exp) =>
    Object.values(exp)
      .map((val) =>
        val instanceof Date ? val.toLocaleDateString() : val?.toString() || ""
      )
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleLogout = () => {
    alert("Admin logged out!");
    window.location.href = "/login";
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar open">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "40px" }}>Admin Panel</h2>
        <nav className="sidebar-nav">
          <a href="admin-dashboard" className="nav-link">Dashboard</a>
          <a href="manage-user" className="nav-link">Manage Users</a>
          <a href="managecategory" className="nav-link">Manage Categories</a>
          <a href="viewexpenses" className="nav-link active">View Expenses</a>
          <a href="adminfeedback" className="nav-link">Manage Feedback</a>
         
          {/* <a href="reports" className="nav-link">Reports</a> */}
        </nav>
        <button
          className="logout-btn"
          style={{ padding: "12px 18px", fontSize: "0.9rem" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1 style={{ fontSize: "1.6rem" }}>View All Expenses</h1>
        </header>

        {/* Filter & Search */}
        <section className="filter-section" style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="filter-select"
          >
            <option value="">Filter Field</option>
            <option value="title">Title</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
            <option value="date">Date</option>
            <option value="uid">User ID</option>
          </select>

          <input
            type="text"
            placeholder="Filter value..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="search-input"
          />

          <input
            type="text"
            placeholder="Search all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Expenses Table */}
        {loading ? (
          <p className="loading-text">Loading expenses...</p>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.eid}>
                      <td>{exp.eid}</td>
                      <td>{exp.title}</td>
                      <td>{exp.amount}</td>
                      <td>{exp.category}</td>
                      <td>{exp.date ? new Date(exp.date).toLocaleDateString() : "-"}</td>
                      <td>{exp.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExpenses;
