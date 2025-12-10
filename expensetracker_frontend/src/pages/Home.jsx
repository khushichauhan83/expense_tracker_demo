import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="home-title">
          <h1>Expense Tracker</h1>
        </div>
        <div className="home-links" style={{ position: "relative" }}>
          <Link to="/register">
            <button className="home-btn">Register</button>
          </Link>

          {/* Dropdown for Login */}
          <button
            className="home-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Login
          </button>
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: "8px",
                zIndex: 10,
                overflow: "hidden",
              }}
            >
              <Link to="/login">
                <div
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderBottom: "1px solid #ddd",
                  }}
                  onClick={() => setShowDropdown(false)}
                >
                  User Login
                </div>
              </Link>
              <Link to="/admin-login">
                <div
                  style={{ padding: "10px 20px", cursor: "pointer" }}
                  onClick={() => setShowDropdown(false)}
                >
                  Admin Login
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Middle Info Section */}
      <main className="home-info">
        <h2>Welcome to Expense Tracker</h2>
        <p>
          Track your expenses efficiently, categorize them, and gain insights 
          to manage your finances better. Simple, fast, and secure!
        </p>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 Expense Tracker. All rights reserved.</p>
        <p>Contact: expensetracker6817@gmail.com</p>
      </footer>
    </div>
  );
}

export default Home;
