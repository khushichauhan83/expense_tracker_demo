import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import { FaTrash } from "react-icons/fa"; // ⬅ Added delete icon

function Messages() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      showToast("No token or user ID found. Please login.");
      setTimeout(() => (window.location.href = "/login"), 1500);
      return;
    }

    fetchFeedbacks(userId, token);
  }, []);

  const fetchFeedbacks = async (userId, token) => {
    try {
      const res = await axios.get(
        `https://localhost:7027/api/User/getfeedbackbyuser/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dataArray = Array.isArray(res.data) ? res.data : [];

      const normalized = dataArray
        .map((fb) => ({
          id: fb.aid, // ⬅ Added ID for deletion
          msg: fb.msg || "",
          admin_reply: fb.admin_reply || null,
          createdat: fb.createdat || "",
          repliedat: fb.repliedat || null,
        }))
        .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));

      setFeedbacks(normalized);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch feedbacks.");
    }
  };

  // ✅ DELETE FEEDBACK FUNCTION
  const deleteFeedback = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Do you want to delete this feedback?")) return;

    try {
      await axios.delete(
        `https://localhost:7027/api/User/feedbackdeletebyuser/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // remove from UI
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      showToast("Feedback deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete.");
    }
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "20px",
    background: "#f8f8f8",
    borderRadius: "15px",
    minHeight: "80vh",
  };
  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "15px 20px",
    marginBottom: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    position: "relative",
  };
  const linkStyle = {
    color: "#6c4bc5",
    fontWeight: "bold",
    textDecoration: "underline",
    cursor: "pointer",
    marginBottom: "20px",
    display: "inline-block",
  };

  return (
    <div style={containerStyle}>
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
            zIndex: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Back to Dashboard Link */}
      <span style={linkStyle} onClick={() => (window.location.href = "/dashboard")}>
        ← Back to Dashboard
      </span>

      <h2
        style={{ textAlign: "center", color: "#6c4bc5", marginBottom: "25px" }}
      >
        Your Feedbacks
      </h2>

      {feedbacks.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No feedbacks submitted yet.
        </p>
      ) : (
        feedbacks.map((fb, index) => (
          <div key={index} style={cardStyle}>
            
            {/* 🗑 DELETE ICON */}
            <FaTrash
              onClick={() => deleteFeedback(fb.id)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                cursor: "pointer",
                color: "red",
                fontSize: "18px",
              }}
            />

            <p>
              <strong>Feedback:</strong> {fb.msg}
            </p>

            <p>
              <strong>Reply:</strong>{" "}
              {fb.admin_reply && fb.admin_reply.trim() !== "" && fb.admin_reply !== "string" ? (
                fb.admin_reply
              ) : (
                <span style={{ color: "red", fontWeight: "bold" }}>Pending</span>
              )}
            </p>

            <small style={{ color: "#888" }}>
              Feedback on: {fb.createdat.split("T")[0]}
              {fb.admin_reply && fb.admin_reply !== "string" ? (
                <> | Replied: {fb.repliedat.split("T")[0]}</>
              ) : (
                <> | Reply Pending</>
              )}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default Messages;
