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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-width">
      <nav className="grid">
        <img src={logo} alt="Logo" className="logo" />

        <div className="navbar">
          <ul>
            <li><NavLink to="/">HOME</NavLink></li>
            <li><NavLink to="/alldoctors">ALL DOCTORS</NavLink></li>
            <li><NavLink to="/about">ABOUT</NavLink></li>
            <li><NavLink to="/contact">CONTACT</NavLink></li>
          </ul>
        </div>

        {!user ? (
          <button className="create-acc">
            <Link to="/register">Create Account</Link>
          </button>
        ) : (
          <div className="profile-dropdown" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={profileImage}
                alt="Profile"
                className="nav-profile-thumb"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "8px",
                  border:"1px solid white"
                }}
              />
              {user.username}
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
      {message && <Notifi message={message} onClose={() => setMessage(null)} />}
    </header>
  );
}

export default Navbar;
