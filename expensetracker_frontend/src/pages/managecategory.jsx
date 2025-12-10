import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ cname: "", cid: null });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState(""); // New state for search
  const token = localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://localhost:7027/api/admin/getcategories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch categories");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add or Update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cname.trim()) return alert("Category name is required");

    try {
      if (isEditing) {
        await axios.put(
          `https://localhost:7027/api/admin/updatecategory/${formData.cid}`,
          { cname: formData.cname },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsEditing(false);
      } else {
        await axios.post(
          "https://localhost:7027/api/admin/categories",
          { cname: formData.cname },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setFormData({ cname: "", cid: null });
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

  // Edit category
  const handleEdit = (cat) => {
    setFormData({ cname: cat.cname, cid: cat.cid });
    setIsEditing(true);
  };

  // Delete category
  const handleDelete = async (cid) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`https://localhost:7027/api/admin/deletecategory/${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  // Filter categories based on search input
  const filteredCategories = categories.filter(cat =>
    cat.cname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar open">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "40px" }}>Admin Panel</h2>
        <nav className="sidebar-nav">
          <a href="admin-dashboard" className="nav-link">Dashboard</a>
          <a href="manage-user" className="nav-link">Manage Users</a>
          <a href="managecategory" className="nav-link active">Manage Categories</a>
          <a href="viewexpenses" className="nav-link">View Expenses</a>
          <a href="adminfeedback" className="nav-link">Manage Feedback</a>
          {/* <a href="reports" className="nav-link">Reports</a> */}
        </nav>
        <button
          className="logout-btn"
          style={{ padding: "12px 18px", fontSize: "0.9rem" }}
          onClick={() => { alert("Admin logged out!"); window.location.href = "/login"; }}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1 style={{ fontSize: "1.6rem" }}>Manage Categories</h1>
        </header>

        {/* Search */}
        <section className="filter-section" style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Add / Edit form */}
        <section className="filter-section" style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Category Name"
            value={formData.cname}
            onChange={(e) => setFormData({ ...formData, cname: e.target.value })}
            className="search-input"
          />
          <button className="dashboard-btn" onClick={handleSubmit}>
            {isEditing ? "Update Category" : "Add Category"}
          </button>
          {isEditing && (
            <button
              className="dashboard-btn"
              onClick={() => { setFormData({ cname: "", cid: null }); setIsEditing(false); }}
            >
              Cancel
            </button>
          )}
        </section>

        {/* Categories Table */}
        {loading ? (
          <p className="loading-text">Loading categories...</p>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">No categories found.</td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.cid}>
                      <td>{cat.cid}</td>
                      <td>{cat.cname}</td>
                      <td>
                        <button className="dashboard-btn" onClick={() => handleEdit(cat)}>Edit</button>
                        <button className="dashboard-btn" onClick={() => handleDelete(cat.cid)}>Delete</button>
                      </td>
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

export default ManageCategory;
