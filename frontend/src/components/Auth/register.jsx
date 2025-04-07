import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import Notifi from '../Notification/notifi'; // ✅ Import Notification Component
import './auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState(null); // ✅ Notification with message and type
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  async function handleRegister(ev) {
    ev.preventDefault();
    setNotification(null); // Reset notification

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setNotification({ message: '✅ Successfully Registered', type: 'success' });
        setTimeout(() => navigate('/postprofile'), 1000); // redirect after 5 seconds
      } else {
        setNotification({
          message: data.message || '❌ Registration failed. Try again.',
          type: 'error',
        });
      }
    } catch (err) {
      setNotification({
        message: '❌ Something went wrong. Please try again.',
        type: 'error',
      });
    }
  }

  return (
    <div className="auth">
      {notification && (
        <Notifi
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
        />

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
