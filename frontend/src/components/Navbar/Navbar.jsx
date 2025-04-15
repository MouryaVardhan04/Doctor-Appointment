import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import "./Navbar.css";
import logo from "../../assets/logo.svg";
import Notifi from "../Notification/notifi";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [id, setId] = useState("");
  const [message, setMessage] = useState(null);
  const dropdownRef = useRef();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:8000/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setId(data.user.id);
        } else {
          console.error("Failed to fetch user:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessage("❌ Failed to load user session.");
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchPatientData() {
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:8000/patient/getpatient/${id}`);
        if (!response.ok) {
          throw new Error("Patient not found!");
        }
        const patient = await response.json();
        setProfileImage(patient.file || "default-profile.png");
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setMessage("⚠️ Unable to fetch profile picture.");
      }
    }

    fetchPatientData();
  }, [id]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        localStorage.removeItem("token");
        setMessage("✅ Logged out successfully.");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage("❌ Failed to log out.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setMessage("❌ Logout error! Try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="header-width">
      <div className="grid">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" style={{ height: '50px' }} />
          </Link>
        </div>

        <nav className="navbar">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/doctors">Doctors</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div className="auth-section">
          {user ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="profimg">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "8px",
                      border:"1px solid white"
                    }}
                  />
                </div>
                <span>{user.username}</span>
              </button>

              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <div className="profile">
                    <Link to="/profile">
                      Profile
                    </Link>
                    </div>
                  </li>
                  <li>
                    <Link to="/appointments">Appointments</Link>
                  </li>
                  <li>
                    <Link to="/getAllPrescription">Prescriptions</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <button className="create-acc">
              <Link to="/login">Create Account</Link>
            </button>
          )}
        </div>

        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logo} alt="Logo" style={{ height: '40px' }} />
            </Link>
          </div>
          <button className="close-btn" onClick={toggleMobileMenu}>
            ×
          </button>
        </div>

        <div className="mobile-menu-content">
          <nav className="navbar">
            <ul>
              <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
              <li><Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)}>Doctors</Link></li>
              <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
              <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
              {user ? (

        <ul>
  <li><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link></li>
  <li><button className="logout-button" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button></li>
</ul>
) : (
<button className="create-acc">
<Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
</button>
)}
            </ul>
          </nav>
        </div>
      </div>
      <hr />
      {message && <Notifi message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default Navbar;
