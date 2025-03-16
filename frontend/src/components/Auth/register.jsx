import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../UserContext'; // ✅ Import context

import './auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // ✅ Use global user state

  async function handleRegister(ev) {
    ev.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user); // ✅ Update global user state
        alert('Successfully Registered');
        navigate('/postprofile'); // Redirect after successful registration
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  }

  return (
    <div className='auth'>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
