import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';  // ✅ Same CSS as user login

function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: ''   // ✅ Correct field name (NOT passwordhash)
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'http://localhost:5026/api/admin/login',
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        alert('✅ Admin login successful!');
        window.location.href = '/admin-dashboard';   // ✅ Create this page later
      } else {
        alert('❌ Invalid email or password!');
      }
    } catch (err) {
      alert('❌ Login failed: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-container">
        <h2>Admin Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"   // ✅ Must match backend
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          Not an admin?{' '}
          <Link to="/" style={{ color: '#6c4bc5', fontWeight: 'bold', textDecoration: 'none' }}>
            Go back home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
