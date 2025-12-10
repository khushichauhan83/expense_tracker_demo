import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    passwordhash: '',
    gender: '',
    bdate: '',
    pno: ''
  });

  const [userId, setUserId] = useState(null); // for OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate(); // for redirect

  // Timer countdown for OTP
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && otpSent) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Register and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5026/api/User/register', form);
      setUserId(res.data.userId); // backend returns userId
      alert('✅ OTP sent to your email!');
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      setOtp(''); // clear OTP input
    } catch (err) {
      if (err.response) alert(`❌ Registration failed: ${err.response.data}`);
      else alert('❌ Server error. Please try again.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (timer === 0) {
      alert('⏰ OTP expired! Please resend OTP.');
      return;
    }
    try {
      await axios.post('http://localhost:5026/api/User/verify-otp', {
        userId: userId,
        OTP: otp
      });
      alert('✅ Registration completed successfully!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) alert(`❌ ${err.response.data}`);
      else alert('❌ OTP verification failed!');
    }
  };

  // Step 3: Resend OTP
  const handleResendOtp = async () => {
    if (!userId) return alert('User ID not found. Please register first.');
    try {
      await axios.post('http://localhost:5026/api/User/resend-otp', { userId }); // only send userId
      setTimer(60);       // reset timer
      setCanResend(false); // hide resend button
      setOtp('');          // clear previous OTP input
      alert('✅ OTP resent successfully! Valid for 1 minute.');
    } catch (err) {
      if (err.response && err.response.data) alert(`❌ ${err.response.data}`);
      else alert('❌ Failed to resend OTP!');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-container">
        <h2>User Registration</h2>

        {!otpSent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input type="password" name="passwordhash" placeholder="Password" value={form.passwordhash} onChange={handleChange} required />
            <input type="text" name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} required />
            <input type="date" name="bdate" value={form.bdate} onChange={handleChange} required />
            <input type="text" name="pno" placeholder="Phone No" value={form.pno} onChange={handleChange} required />
            <button type="submit" className="auth-btn">Register</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">Verify OTP</button>
            <p>Time remaining: {timer}s</p>
            {canResend && <button type="button" className="auth-btn" onClick={handleResendOtp}>Resend OTP</button>}
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
