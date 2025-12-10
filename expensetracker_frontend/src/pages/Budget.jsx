import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#FF4D4F", "#4CAF50"]; // Red = Spent, Green = Remaining

const Budget = () => {
  const [monthYear, setMonthYear] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [toast, setToast] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchBudgetAndExpenses = async (my) => {
    if (!my) return;
    try {
      const budgetRes = await axios.get(
        `https://localhost:7027/api/User/getbudget/${userId}/${my}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const budgetValue = budgetRes.data[0]?.amount || 0;
      setMonthlyBudget(budgetValue);
      setBudgetAmount(budgetValue > 0 ? budgetValue : "");

      const expenseRes = await axios.get(
        `https://localhost:7027/api/User/getexpenses/${userId}/${my}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const total = expenseRes.data.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      );
      setExpenses(total);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const message =
        err.response?.data?.title ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Failed to fetch budget/expenses");
      showToast(message);
    }
  };

  useEffect(() => {
    const today = new Date();
    const defaultMonthYear = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    setMonthYear(defaultMonthYear);
    fetchBudgetAndExpenses(defaultMonthYear);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountValue = Number(budgetAmount);

    if (!monthYear) {
      showToast("Please select a month.");
      return;
    }
    if (!budgetAmount || isNaN(amountValue) || amountValue <= 0) {
      showToast("Enter a valid budget amount (>0).");
      return;
    }

    const payload = { id: Number(userId), amount: amountValue, month_year: monthYear };

    try {
      if (monthlyBudget > 0) {
        await axios.put(
          `https://localhost:7027/api/User/updatebudget`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Budget updated successfully!");
      } else {
        await axios.post(
          `https://localhost:7027/api/User/addbudget`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Budget added successfully!");
      }
      fetchBudgetAndExpenses(monthYear);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const message =
        err.response?.data?.title ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Failed to save budget");
      showToast(message);
    }
  };

  const remaining = monthlyBudget - expenses;
  const spentPercent = monthlyBudget ? (expenses / monthlyBudget) * 100 : 0;
  const pieData = [
    { name: "Spent", value: expenses },
    { name: "Remaining", value: remaining > 0 ? remaining : 0 },
  ];

  return (
    <div style={{ padding: "30px", minHeight: "100vh", background: "#f3f6fb", fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "#6c4bc5", color: "#fff", padding: "12px 22px",
          borderRadius: "12px", zIndex: 999, boxShadow: "0 6px 18px rgba(0,0,0,0.25)", fontWeight: "600"
        }}>{toast}</div>
      )}

      {/* Go Back Button */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(90deg,#8e44ad,#6c4bc5)",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(108,75,197,0.3)",
            transition: "0.3s",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "linear-gradient(90deg,#6c4bc5,#8e44ad)"} 
          onMouseOut={(e) => e.currentTarget.style.background = "linear-gradient(90deg,#8e44ad,#6c4bc5)"}
        >
          ← Go Back to Dashboard
        </button>
      </div>

      <h2 style={{ color: "#6c4bc5", textAlign: "center", marginBottom: "30px" }}>
       Set Monthly Budget 
      </h2>

      {/* Month Selector */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <input
          type="month"
          value={monthYear}
          onChange={(e) => { setMonthYear(e.target.value); fetchBudgetAndExpenses(e.target.value); }}
          style={{
            padding: "12px 18px", borderRadius: "12px", border: "1px solid #ccc",
            fontWeight: "500", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        />
      </div>

      {/* Budget Form */}
      <div style={{
        maxWidth: "450px", margin: "auto", marginBottom: "35px",
        background: "linear-gradient(145deg,#ffffff,#f0f4ff)", padding: "30px", borderRadius: "20px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginBottom: "22px", color: "#6c4bc5" }}>
          {monthlyBudget > 0 ? "Update Budget" : "Add Budget"}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <input
            type="number"
            placeholder="Budget Amount (₹)"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            style={{
              padding: "14px", borderRadius: "14px", border: "1px solid #ccc",
              fontSize: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "16px", borderRadius: "14px", border: "none",
              background: "linear-gradient(90deg,#6c4bc5,#8e44ad)", color: "#fff",
              fontWeight: "600", fontSize: "16px", cursor: "pointer",
              boxShadow: "0 6px 15px rgba(108,75,197,0.3)", transition: "0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "linear-gradient(90deg,#8e44ad,#6c4bc5)"}
            onMouseOut={(e) => e.currentTarget.style.background = "linear-gradient(90deg,#6c4bc5,#8e44ad)"}
          >
            {monthlyBudget > 0 ? "Update Budget" : "Add Budget"}
          </button>
        </form>
      </div>

      {/* Summary + Pie Chart Side by Side */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
        {/* Summary */}
        <div style={{
          background: "linear-gradient(145deg,#ffffff,#f9f9ff)", padding: "30px", borderRadius: "20px",
          boxShadow: "0 12px 28px rgba(0,0,0,0.1)", maxWidth: "300px", textAlign: "center"
        }}>
          <p style={{ fontSize: "16px" }}>Monthly Budget: <b>₹{monthlyBudget}</b></p>
          <p style={{ fontSize: "16px" }}>Total Expenses: <b>₹{expenses}</b></p>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: remaining < 0 ? "#FF4D4F" : "#4CAF50" }}>
            Remaining: ₹{remaining}
          </p>
          {spentPercent >= 100 && <p style={{ color: "#FF4D4F", fontWeight: "bold", marginTop: "12px" }}>
            ❌ You exceeded your budget by ₹{Math.abs(remaining)}
          </p>}
          {spentPercent >= 80 && spentPercent < 100 && <p style={{ color: "#FFA500", fontWeight: "bold", marginTop: "12px" }}>
            ⚠️ You're at {Math.round(spentPercent)}% of your budget!
          </p>}
        </div>

        {/* Pie Chart */}
        {monthlyBudget > 0 && <div style={{
          background: "linear-gradient(145deg,#ffffff,#f9f9ff)", padding: "30px", borderRadius: "20px",
          boxShadow: "0 12px 28px rgba(0,0,0,0.1)", maxWidth: "300px"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#6c4bc5", textAlign: "center" }}>Budget vs Expenses</h3>
          <PieChart width={250} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
              paddingAngle={5}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </div>}
      </div>
    </div>
  );
};

export default Budget;
