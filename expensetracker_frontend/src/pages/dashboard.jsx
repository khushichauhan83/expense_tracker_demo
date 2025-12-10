import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import "../App.css";
import { FaCommentDots } from "react-icons/fa";

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#64B5F6", "#4DD0E1", "#4DB6AC", "#81C784",
  "#AED581", "#FFD54F", "#FFB74D", "#A1887F"
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", passwordhash: "", gender: "", bdate: "", pno: "" });
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      showToast("No token or user ID found. Please login.");
      setTimeout(() => window.location.href = "/login", 1500);
      return;
    }

    axios.get(`https://localhost:7027/api/User/getuser/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUser(res.data);
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        passwordhash: "",
        gender: res.data.gender || "",
        bdate: res.data.bdate ? res.data.bdate.split("T")[0] : "",
        pno: res.data.pno || ""
      });
    }).catch(() => showToast("Unauthorized. Please login again."));

    axios.get(`https://localhost:7027/api/User/getbyuser/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const normalized = Array.isArray(res.data) ? res.data.map(e => ({
        ...e,
        amount: Number(e.amount) || 0,
        date: e.date || "",
        category: e.category || "Uncategorized"
      })) : [];
      setExpenses(normalized);
    }).catch(() => showToast("Failed to fetch expenses"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      await axios.delete(`https://localhost:7027/api/User/deleteuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Account deleted successfully.");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/register";
      }, 1000);
    } catch {
      showToast("Failed to delete account.");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      await axios.put(`https://localhost:7027/api/User/updateuser/${userId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Profile updated successfully.");
      setIsEditing(false);
      setUser({ ...user, ...form });
    } catch {
      showToast("Failed to update profile.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackMessage.trim() === "") {
      showToast("Enter feedback message.");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      await axios.post("https://localhost:7027/api/User/add", {
        userId,
        message: feedbackMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast("Feedback sent!");
      setFeedbackMessage("");
      setIsFeedbackOpen(false);
    } catch {
      showToast("Failed to send feedback.");
    }
  };

  const categories = [...new Set(expenses.map(e => e.category))];
  const categoryColorMap = {};
  categories.forEach((cat, idx) => categoryColorMap[cat] = COLORS[idx % COLORS.length]);

  const pieData = expenses.reduce((acc, exp) => {
    const cat = exp.category;
    const existing = acc.find(item => item.name === cat);
    if (existing) existing.value += Number(exp.amount) || 0;
    else acc.push({ name: cat, value: Number(exp.amount) || 0 });
    return acc;
  }, []);

  const barMap = {};
  expenses.forEach(exp => {
    const date = exp.date.includes("T") ? exp.date.split("T")[0] : exp.date;
    if (!barMap[date]) barMap[date] = {};
    barMap[date][exp.category] = (barMap[date][exp.category] || 0) + Number(exp.amount);
  });

  const barData = Object.keys(barMap).sort((a, b) => new Date(a) - new Date(b)).map(date => ({
    date,
    ...barMap[date]
  }));

  const sidebarStyle = { width: "30%", minWidth: "300px", background: "#fdf6fb", borderRadius: "15px", padding: "30px", boxShadow: "0 10px 25px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", alignItems: "center" };
  const mainStyle = { width: "70%", display: "flex", flexDirection: "column", gap: "25px", position: "relative" };
  const containerStyle = { display: "flex", gap: "25px", padding: "25px", minHeight: "100vh", background: "#f8f8f8" };
  const avatarStyle = { width: "90px", height: "90px", borderRadius: "50%", background: "#d6c5f2", color: "#6c4bc5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" };
  const buttonStyle = { padding: "12px 22px", borderRadius: "10px", border: "none", cursor: "pointer", background: "#6c4bc5", color: "#fff", width: "100%", fontWeight: "bold", marginBottom: "15px", fontSize: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" };
  const cardStyle = { borderRadius: "15px", padding: "25px", background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={containerStyle}>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", background: "#ff8c94", color: "#fff", padding: "12px 20px", borderRadius: "10px", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        {user && (
          <>
            <div style={avatarStyle}>{user.email ? user.email[0].toUpperCase() : "U"}</div>
            <h2 style={{ color: "#6c4bc5", marginBottom: "15px" }}>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Birth Date:</strong> {user.bdate ? user.bdate.split("T")[0] : "-"}</p>
            <p><strong>Phone:</strong> {user.pno}</p>

            <div style={{ marginTop: "25px", width: "100%" }}>
              <button style={buttonStyle} onClick={() => setIsEditing(true)}>Update Profile</button>
              <button style={buttonStyle} onClick={handleDelete}>Delete Account</button>
              <button style={buttonStyle} onClick={() => window.location.href = "/expenses"}>View Expenses</button>
              <button style={buttonStyle} onClick={() => window.location.href = "/budget"}>Budget</button>
              <button style={buttonStyle} onClick={() => window.location.href = "/feedback"}>Give Feedback</button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={mainStyle}>

     {/* Feedback Reply Button + Logout Button */}
<div style={{ position: "absolute", top: 0, right: 0, display: "flex", alignItems: "center", gap: "10px", margin: "10px" }}>
  
  <button
    onClick={() => window.location.href = "/messages"}
    style={{
      padding: "10px 16px",
      borderRadius: "10px",
      background: "#6c4bc5",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
    }}
  >
    Feedback Reply
  </button>

  <button
    onClick={handleLogout}
    style={{
      padding: "10px 16px",
      borderRadius: "10px",
      background: "#6c4bc5",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
    }}
  >
    Logout
  </button>
</div>


        <h2 style={{ color: "#6c4bc5" }}>Dashboard</h2>

        {/* Update Profile Form */}
        {isEditing && user && (
          <div style={cardStyle}>
            <form onSubmit={handleUpdateSubmit}>
              {["name", "email", "gender", "bdate", "pno"].map((field, i) => (
                <div key={i} style={{ marginBottom: "15px" }}>
                  <input
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
                    type={field === "bdate" ? "date" : field === "email" ? "email" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    required
                  />
                </div>
              ))}
              <button type="submit" style={buttonStyle}>Save Changes</button>
              <button type="button" style={{ ...buttonStyle, background: "#ccc", color: "#4b0082" }} onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Feedback Form */}
        {isFeedbackOpen && (
          <div style={cardStyle}>
            <h3 style={{ color: "#6c4bc5", textAlign: "center" }}>Send Feedback</h3>
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                style={{ width: "100%", minHeight: "120px", padding: "12px", borderRadius: "10px", border: "1px solid #bbb", resize: "none", fontSize: "15px" }}
                placeholder="Write your feedback..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                required
              />
              <button type="submit" style={buttonStyle}>Submit</button>
              <button type="button" style={{ ...buttonStyle, background: "#ccc", color: "#4b0082" }} onClick={() => setIsFeedbackOpen(false)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Charts */}
        {!isEditing && !isFeedbackOpen && (
          <>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", ...cardStyle }}>
                <h3 style={{ textAlign: "center", color: "#6c4bc5" }}>Expenses by Category</h3>
                {pieData.length === 0 ? <p style={{ textAlign: "center" }}>No expense data</p> :
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {pieData.map(entry => <Cell key={entry.name} fill={categoryColorMap[entry.name]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ flexWrap: "wrap", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </div>

              <div style={{ flex: "1", ...cardStyle }}>
                <h3 style={{ textAlign: "center", color: "#6c4bc5" }}>Date-wise Expenses</h3>
                {barData.length === 0 ? <p style={{ textAlign: "center" }}>No expense data</p> :
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={5}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ flexWrap: "wrap", fontSize: 12 }} />
                      {categories.map((cat) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={categoryColorMap[cat]} stroke="#f8f8f8" strokeWidth={2}>
                          <LabelList dataKey={cat} position="center" formatter={(value) => value ? `₹${value}` : ""} style={{ fill: "#fff", fontSize: 12, fontWeight: "bold" }} />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
