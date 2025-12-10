import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  // <-- added for back button
import "../App.css";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [replies, setReplies] = useState({});
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "https://localhost:7027/api/admin/getallfeedback",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(res.data);
    } catch (err) {
      console.log("Error fetching feedbacks:", err.response || err);
      showToast("Failed to fetch feedbacks");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleReplyChange = (aid, value) => {
    setReplies((prev) => ({ ...prev, [aid]: value }));
  };

  const handleReplySubmit = async (f) => {
    const replyText =
      replies[f.aid] !== undefined ? replies[f.aid] : f.admin_reply || "";

    if (!replyText.trim()) {
      showToast("Enter a reply");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const body = { admin_reply: replyText };

      const res = await axios.put(
        `https://localhost:7027/api/admin/reply/${f.aid}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Reply API Response:", res.data);
      showToast("Reply sent!");

      setFeedbacks((prev) =>
        prev.map((item) =>
          item.aid === f.aid
            ? {
                ...item,
                admin_reply: replyText,
                repliedat: new Date().toISOString(),
              }
            : item
        )
      );

      setReplies((prev) => ({ ...prev, [f.aid]: "" }));
    } catch (err) {
      console.log("Reply error details:", err);
      showToast("Failed to send reply");
    }
  };

  // ✅ DELETE FEEDBACK FUNCTION (Only new thing added)
  const handleDelete = async (aid) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`https://localhost:7027/api/admin/deletefeedback/${aid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedbacks(feedbacks.filter((f) => f.aid !== aid));
      showToast("Feedback deleted");
    } catch (err) {
      console.log("Delete error:", err);
      showToast("Failed to delete feedback");
    }
  };

  return (
    <div style={{ padding: "40px", background: "#f8f8f8", minHeight: "100vh" }}>
      
      {/* 🔙 Back to Dashboard Button */}
      <Link
        to="/admin-dashboard"
        style={{
          padding: "10px 18px",
          background: "#6c4bc5",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          marginBottom: "20px",
          display: "inline-block"
        }}
      >
        ⬅ Back to Dashboard
      </Link>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#ff8c94",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {toast}
        </div>
      )}

      <h2 style={{ color: "#6c4bc5", marginBottom: "20px" }}>User Feedback</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {feedbacks.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          feedbacks.map((f) => (
            <div
              key={f.aid}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <p>
                <strong>Feedback ID:</strong> {f.aid}
              </p>
              <p>
                <strong>User ID:</strong> {f.id}
              </p>
              <p>
                <strong>Message:</strong> {f.msg}
              </p>
              <p>
                <strong>Admin Reply:</strong> {f.admin_reply || "No reply yet"}
              </p>
              <p>
                <strong>Created At:</strong> {formatDate(f.createdat)}
              </p>
              <p>
                <strong>Replied At:</strong> {formatDate(f.repliedat)}
              </p>

              <textarea
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "8px",
                  borderRadius: "8px",
                  marginTop: "8px",
                  border: "1px solid #ccc",
                }}
                placeholder="Write or update reply..."
                value={
                  replies[f.aid] !== undefined ? replies[f.aid] : f.admin_reply || ""
                }
                onChange={(e) => handleReplyChange(f.aid, e.target.value)}
              />

              <button
                style={{
                  marginTop: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#6c4bc5",
                  color: "#fff",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
                onClick={() => handleReplySubmit(f)}
              >
                Send / Update Reply
              </button>

              {/* ✅ Delete Button (Added Safely) */}
              <button
                style={{
                  marginTop: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "red",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => handleDelete(f.aid)}
              >
                Delete Feedback
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
