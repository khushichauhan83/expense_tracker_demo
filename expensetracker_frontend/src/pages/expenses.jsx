import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import "../App.css";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    eid: null,
    title: "",
    amount: "",
    category: null,      // { value: categoryId, label: cname }
    date: "",
    paymentMethod: null  // { value: pmid, label: pmname }
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://localhost:7027/api/User/getexpenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data.map(exp => ({
        ...exp,
        paymentMethod: exp.payment_method // normalize
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("https://localhost:7027/api/User/getcategories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.map(cat => ({ value: cat.cid, label: cat.cname })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get("https://localhost:7027/api/User/payment_method", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentMethods(res.data.map(pm => ({ value: pm.pmid, label: pm.pmname })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  const handleEdit = (exp) => {
    setIsEditing(true);
    setShowForm(true);
    const catObj = categories.find(c => c.label === exp.category) || { value: null, label: exp.category };
    const pmObj = paymentMethods.find(pm => pm.label === exp.paymentMethod) || { value: null, label: exp.paymentMethod };
    setFormData({
      eid: exp.eid,
      title: exp.title,
      amount: exp.amount,
      category: catObj,
      date: exp.date.split("T")[0],
      paymentMethod: pmObj
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.category.value) {
      alert("Please select or enter a category");
      return;
    }

    try {
      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: formData.date,
        id: parseInt(userId),
        cid: formData.category.value,
        pmid : formData.paymentMethod.value
      };

      if (isEditing) {
        expenseData.eid = formData.eid;
        await axios.put(
          `https://localhost:7027/api/User/updateexpense/${formData.eid}`,
          expenseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://localhost:7027/api/User/addexpense",
          expenseData,
          { headers: { Authorization:` Bearer ${token}` } }
        );
      }

      // Refetch expenses + categories
      await fetchExpenses();
      await fetchCategories();

      // Reset form
      setFormData({ eid: null, title: "", amount: "", category: null, date: "" , payment_method : null});
      setIsEditing(false);
      setShowForm(false);

    } catch (err) {
      console.error(err);
      alert("Failed to save expense");
    }
  };
  

  const handleDelete = async (eid) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`https://localhost:7027/api/User/deleteexpense/${eid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  return (
    <div className="expenses-container">
      <h2 className="expenses-title">My Expenses</h2>
      <div className="expense-actions">
        <button className="add-expense-btn" onClick={() => { setShowForm(!showForm); setIsEditing(false); setFormData({ eid: null, title: "", amount: "", category: null, date: "", paymentMethod: null }); }}>
          {showForm ? "Close Form" : "Add Expense"}
        </button>
        <Link to="/dashboard" className="add-expense-btn">⬅ Back</Link>
      </div>

      {showForm && (
        <form className="expense-form" onSubmit={handleFormSubmit}>
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
          <input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
           <CreatableSelect value={formData.category} onChange={selected => setFormData({ ...formData, category: selected })} options={categories} placeholder="select category..." />
          <CreatableSelect value={formData.paymentMethod} onChange={selected => setFormData({ ...formData, paymentMethod: selected })} options={paymentMethods} placeholder="Select Payment Method..." />
          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
          <button type="submit" className="save-btn">{isEditing ? "Update" : "Save"}</button>
        </form>
      )}

      <table className="expenses-table">
        <thead>
          <tr>
            <th>Expense ID</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? expenses.map(exp => (
            <tr key={exp.eid}>
              <td>{exp.eid}</td>
              <td>{exp.title}</td>
              <td>₹{exp.amount}</td>
              <td>{exp.category}</td>
              <td>{exp.paymentMethod || "-"}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(exp)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(exp.eid)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan="7" className="no-data">No expenses found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;
