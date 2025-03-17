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
import HomeAllDoc from "./components/HomeAlldoctors/HomeAllDoc";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact"
import Doctor from "./components/Doctor/Doctor";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar /> {/* ✅ Navbar Added */}
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminHome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/postprofile" element={<Profile />} />
          <Route path="/profile" element={<GetProfile />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/alldoctors" element={<HomeAllDoc/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/doctor/:id" element={<Doctor/>} />
        </Routes>
      </Router>
      <Footer/>
    </UserProvider>
  );
}

export default App;
