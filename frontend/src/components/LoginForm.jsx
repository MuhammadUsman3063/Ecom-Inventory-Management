import React, { useState } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save token and user info to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setSuccessMsg('✅ Login successful!');
        onLoginSuccess(); // 🔁 Notify App.jsx that login succeeded
      } else {
        setError(data.message || '❌ Login failed');
      }
    } catch (err) {
      setError('❌ Server error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      <div>
        <label>Email:</label>
        <input
         type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  autoComplete="username"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  autoComplete="current-password"
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
