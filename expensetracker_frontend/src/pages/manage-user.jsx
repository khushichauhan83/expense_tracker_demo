import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    axios
      .get("https://localhost:7027/api/admin/getalluser")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  const clean = (val) => (val ? val.toString().trim().toLowerCase() : "");

  const normalizeGender = (val) => {
    if (!val) return "";
    val = clean(val);
    if (val.startsWith("m")) return "male";
    if (val.startsWith("f")) return "female";
    return val;
  };

  const filteredByField =
    filterField && filterValue
      ? users.filter((user) => {
          let fieldVal = user[filterField];
          if (filterField === "bdate" || filterField === "createdat") {
            fieldVal = fieldVal ? new Date(fieldVal).toLocaleDateString() : "";
            fieldVal = clean(fieldVal);
          } else if (filterField === "gender") {
            fieldVal = normalizeGender(fieldVal);
          } else {
            fieldVal = clean(fieldVal);
          }
          const inputVal = filterField === "gender" ? normalizeGender(filterValue) : clean(filterValue);
          return fieldVal.startsWith(inputVal);
        })
      : users;

  const filteredUsers = filteredByField.filter((user) =>
    Object.values(user)
      .map((val) =>
        val && (val instanceof Date ? val.toLocaleDateString() : val.toString())
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
          <a href="manage-user" className="nav-link active">Manage Users</a>
          <a href="managecategory" className="nav-link">Manage Categories</a>
          <a href="viewexpenses" className="nav-link">View Expenses</a>
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
          <h1 style={{ fontSize: "1.6rem" }}>Manage Users</h1>
        </header>

        {/* Search */}
        <section className="search-section" style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Filter */}
        <section className="filter-section" style={{ marginBottom: "20px" }}>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="filter-select"
          >
            <option value="">Select field</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="gender">Gender</option>
            <option value="pno">Phone</option>
            <option value="bdate">DOB</option>
            <option value="createdat">Registered At</option>
          </select>

          <input
            type="text"
            placeholder="Filter value..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-input"
          />
        </section>

        {/* Users Table */}
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.gender}</td>
                      <td>{user.bdate ? new Date(user.bdate).toLocaleDateString() : "-"}</td>
                      <td>{user.email}</td>
                      <td>{user.pno}</td>
                      <td>{user.createdat ? new Date(user.createdat).toLocaleDateString() : "-"}</td>
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

export default ManageUsers;
