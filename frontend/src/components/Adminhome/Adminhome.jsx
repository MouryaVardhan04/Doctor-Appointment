import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Dashboard from '../Dashboard/dashboard';
import Appointments from '../Appointments/appointment';
import Adddoctors from '../AddDoctors/addDoctor';
import ListofDoctors from '../Listdoctors/listdoctors';
import Editdoctor from '../EditDoctor/editdoctor';
import './Adminhome.css';
import GetDoctor from '../AddDoctors/getdoctor';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="left-side">
        <button onClick={() => navigate('/admin')} aria-label="Go to Dashboard"> 
          <i className="fa-solid fa-chart-line"></i> Dashboard
        </button>
        <button onClick={() => navigate('/admin/appointments')} aria-label="Go to Appointments"> 
          <i className="fa-solid fa-calendar-check"></i> Appointments
        </button>
        <button onClick={() => navigate('/admin/adddoctor')} aria-label="Add a Doctor">
          <i className="fa-solid fa-user-plus"></i> Add Doctor
        </button>
        <button onClick={() => navigate('/admin/listdoctors')} aria-label="List of Doctors"> 
          <i className="fa-solid fa-list"></i> List of Doctors
        </button>
      </div>
      
      {/* Content Area */}
      <div className="right-side">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/adddoctor" element={<Adddoctors />} />
          <Route path="/listdoctors" element={<ListofDoctors />} />
          <Route path="/editdoctor/:id" element={<Editdoctor />} />
          <Route path="/getdoctor/:id" element={<GetDoctor />} />
          {/* Fallback Route */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;