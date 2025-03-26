import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext"; // Import UserContext
import "./Navbar.css";
import logo from "../../assets/logo.svg"; // Import your logo image

function Navbar() {
  const { user, setUser } = useContext(UserContext); // Use global user state
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null); // Update context state
        localStorage.removeItem("token"); // Remove token
        navigate("/"); // Redirect
      } else {
        console.error("Failed to log out:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="header-width">
      <nav className="grid">
        <img src={logo} alt="Logo" className="logo" />

        <div className="navbar">
          <ul>
            <li>
              <NavLink to="/">HOME</NavLink>
            </li>
            <li>
              <NavLink to="/alldoctors">ALL DOCTORS</NavLink>
            </li>
            <li>
              <NavLink to="/about">ABOUT</NavLink>
            </li>
            <li>
              <NavLink to="/contact">CONTACT</NavLink>
            </li>
          </ul>
        </div>

        {/* Conditional rendering */}
        {!user ? (
          <button className="create-acc">
            <Link to="/register">Create Account</Link>
          </button>
        ) : (
          <div className="profile-dropdown">
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.username} 
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                 <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <Link to="/appointments">Appointments</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </nav>
      <hr />
    </header>
  );
}

export default Navbar;
