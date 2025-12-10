import React, { useState } from "react";
import axios from "axios";

function Feedback() {
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Please enter feedback");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("userId"));

    try {
      await axios.post(
        "https://localhost:7027/api/User/add",
        {
          aid: 0,               // default
          id: userId,           // userId
          msg: message,         // user feedback
          admin_reply: "string",
          createdat: new Date().toISOString(),
          repliedat: new Date().toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showToast("Feedback submitted!");
      setMessage("");

      setTimeout(() => window.location.href = "/dashboard", 1500);
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      showToast("Failed to send feedback. Try again");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px", background: "#f8f8f8", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", background: "#ff8c94", color: "#fff", padding: "12px 20px", borderRadius: "10px", zIndex: 999 }}>{toast}</div>}

      <div style={{ width: "450px", background: "#fff", padding: "30px", borderRadius: "15px", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#6c4bc5", textAlign: "center", marginBottom: "20px" }}>Send Feedback</h2>

        <form onSubmit={handleSubmit}>
          <textarea
            style={{ width: "100%", minHeight: "150px", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", resize: "none", fontSize: "15px" }}
            placeholder="Write your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" style={{ padding: "12px 22px", borderRadius: "10px", border: "none", cursor: "pointer", background: "#6c4bc5", color: "#fff", width: "100%", fontWeight: "bold", marginTop: "12px", fontSize: "15px" }}>Submit Feedback</button>

          <button type="button" style={{ padding: "12px 22px", borderRadius: "10px", border: "none", cursor: "pointer", background: "#ccc", color: "#4b0082", width: "100%", fontWeight: "bold", marginTop: "12px", fontSize: "15px" }} onClick={() => window.location.href = "/dashboard"}>Back to Dashboard</button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
