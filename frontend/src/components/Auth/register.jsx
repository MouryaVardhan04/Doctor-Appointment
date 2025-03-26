import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import Notifi from '../Notification/notifi'; // ✅ Import Notification Component
import './auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null); // ✅ Stores notification message
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  async function handleRegister(ev) {
    ev.preventDefault();
    setMessage(null); // Reset notification

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
        setMessage('✅ Successfully Registered'); // ✅ Success Notification
        setTimeout(() => navigate('/postprofile'), 5000);
      } else {
        setMessage(data.message || '❌ Registration failed. Try again.');
      }
    } catch (err) {
      setMessage('❌ Something went wrong. Please try again.');
    }
  }

  return (
    <div className='auth'>
      {message && <Notifi message={message} onClose={() => setMessage(null)} />} {/* ✅ Display Notification */}
      
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

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
