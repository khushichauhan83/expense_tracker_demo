import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // ✅ Import Link
import '../App.css';

function Login() {
  const [form, setForm] = useState({
    email: '',
    passwordhash: ''
  });

  // 🔹 CAPTCHA states
  const [num1] = useState(Math.floor(Math.random() * 10));
  const [num2] = useState(Math.floor(Math.random() * 10));
  const [captchaInput, setCaptchaInput] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 CAPTCHA check
    if (parseInt(captchaInput) !== num1 + num2) {
      alert("Please solve the CAPTCHA correctly!");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5026/api/User/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);

      alert('✅ Login Successful!');
      window.location.href = '/dashboard';
    } catch (err) {
      alert('❌ Login failed: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-container">
        <h2>Login</h2>
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
            name="passwordhash"
            placeholder="Password"
            value={form.passwordhash}
            onChange={handleChange}
            required
          />

          {/* CAPTCHA */}
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <p>Solve this to prove you are human:</p>
            <label style={{ fontWeight: 'bold' }}>{num1} + {num2} = </label>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              style={{
                width: '60px',
                marginLeft: '5px',
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
              required
            />
          </div>

          <button type="submit" className="auth-btn" style={{ marginTop: '15px' }}>Login</button>
        </form>

        {/* 🔹 Register link */}
        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          Not have an account?{' '}
          <Link to="/register" style={{ color: '#6c4bc5', fontWeight: 'bold', textDecoration: 'none' }}>
            Register here
          </Link>

              <br/>

          <Link to="/" style={{ color: '#6c4bc5', fontWeight: 'bold', textDecoration: 'none' }}>
            Go Back Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
