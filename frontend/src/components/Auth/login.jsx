import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext'; // ✅ Import context

import './auth.css';

function Login() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // ✅ Use global user state
  
  async function handleLogin(ev) {
    ev.preventDefault(); 
  
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
  
      const data = await response.json(); // Parse the JSON response
  
      if (response.ok) {
        console.log(data);
        alert(data.message); // Display success message from the server
        setUser({ id: data.id, username: data.username });
        navigate('/'); 
      } else {
        setErrorMessage(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      setErrorMessage('❌ Server error, please try again.'); 
    }
  }
  
  return (
    <div className='auth'>
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

        {errorMessage && <p className="error">{errorMessage}</p>} {/* ✅ Display error message conditionally */}

        <p>Don't have an account? <a href="/register">Register</a></p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
