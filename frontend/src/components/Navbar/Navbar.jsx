import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext"; // Import UserContext
import "./Navbar.css";

function Navbar() {
  const { user, setUser } = useContext(UserContext); // Use global user state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null); // Update context state
        localStorage.removeItem("token"); // Remove token
        navigate("/login"); // Redirect
      } else {
        console.error("Failed to log out:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">MyApp</Link>
      </div>

      <ul className="navbar-links">
        {!user ? (
          <>
            <li>
              <Link to="/register">Register</Link>

            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/profile">{user.username}</Link>
            </li>
            <li>
              <Link to="/admin">Admin Home</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
