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
import PatientAppointment from "./components/Appointments/patientAppoint";
import Loading from "./components/Loading/loading";
import PatientReport from "./components/Prescription/patientreport";
import Payment from "./components/Payment/PaymentModal";
import GetPatientReport from "./components/Prescription/getPatientReport";
import DoctorPres from "./components/Prescription/doctorPres";
import GetDoctPres from "./components/Prescription/getDoctPres";
import GetAllPrescription from "./components/Prescription/getAllPrescription";
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
          <Route path="/doctors" element={<HomeAllDoc/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/doctor/:id" element={<Doctor/>} />
          <Route path="/appointments" element={<PatientAppointment/>} />
          <Route path="/load" element={<Loading/>} />
          <Route path="/patientreport/:id" element={<PatientReport/>} />
          <Route path="/payment/:id" element={<Payment/>} />
          <Route path="/getPatientReports/:id" element={<GetPatientReport/>} />
          <Route path="/doctorPrescription/:id" element={<doctorPres/>} />
          <Route path="/postDoctPres/:id" element={<DoctorPres/>} />
          <Route path="/getDoctPres/:id" element={<GetDoctPres/>} />
          <Route path="/getAllPrescription" element={<GetAllPrescription/>} />

        </Routes>
      </Router>
      <Footer/>
    </UserProvider>
  );
}

export default App;
