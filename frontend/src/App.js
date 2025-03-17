import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar"; // Import Navbar
import AdminHome from "./components/Adminhome/Adminhome";
import Register from "./components/Auth/register";
import Home from "./components/Home/Home";
import Login from "./components/Auth/login";
import Profile from "./components/Profile/profile";
import GetProfile from "./components/Profile/getprofile";
import EditProfile from "./components/Profile/editProfile";
import { UserProvider } from "./UserContext";
import Footer from "./components/Footer/Footer";


function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar /> {/* ✅ Navbar Added */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminHome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/postprofile" element={<Profile />} />
          <Route path="/profile" element={<GetProfile />} />
          <Route path="/editprofile" element={<EditProfile />} />
        </Routes>
      </Router>
      <Footer/>
    </UserProvider>
  );
}

export default App;
