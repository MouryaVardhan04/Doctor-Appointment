import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import Notifi from '../Notification/notifi'; // ✅ Import notification component
import './auth.css';

function Login() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notifiMessage, setNotifiMessage] = useState(''); // ✅ Notification state
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  async function handleLogin(ev) {
    ev.preventDefault(); 
  
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log(data);
        setUser({ id: data.id, username: data.username });
        setNotifiMessage('✅ Login Successful!'); // ✅ Show success message
        setTimeout(() => navigate('/'), 1000); // ✅ Redirect after 2s
      } else {
        setErrorMessage(data.message || 'Invalid email or password');
        setNotifiMessage('❌ ' + (data.message || 'Login Failed!')); // ✅ Show error notification
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      setErrorMessage('❌ Server error, please try again.');
      setNotifiMessage('❌ Server error, please try again.'); // ✅ Show error notification
    }
  }
  
  return (
    <div className='auth'>
      {notifiMessage && <Notifi message={notifiMessage} onClose={() => setNotifiMessage('')} />} {/* ✅ Notification Component */}

      <form onSubmit={handleLogin}>
        <h2>Login</h2>

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

        {errorMessage && <p className="error">{errorMessage}</p>} 

        <p>Don't have an account? <a href="/register">Register</a></p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
