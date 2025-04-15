import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    todayAppointments: 0
  });
  const [appointmentsByDate, setAppointmentsByDate] = useState({
    today: [],
    tomorrow: [],
    dayAfterTomorrow: [],
    later: []
  });
  const [selectedGroup, setSelectedGroup] = useState('today');
  const [loading, setLoading] = useState(true);

  const parseDate = (appointmentDateString) => {
    const currentYear = new Date().getFullYear();
    const fullDateStr = `${appointmentDateString}, ${currentYear}`;
    return new Date(fullDateStr);
  };

  const formatDate = (dateString) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDateGroup = (appointmentDateString) => {
    const today = new Date();
    const appointmentDate = parseDate(appointmentDateString);
  
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
  
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0) return null; // 🔴 Past appointment – ignore
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === 2) return 'dayAfterTomorrow';
    return 'later';
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8000/admin/adminAppoint");
        const data = await response.json();

        const grouped = {
          today: [],
          tomorrow: [],
          dayAfterTomorrow: [],
          later: []
        };

        data.forEach(appointment => {
          const group = getDateGroup(appointment.appointment_date);
if (group) {
  grouped[group].push(appointment);
}

        });

        Object.keys(grouped).forEach(group => {
          grouped[group].sort((a, b) => {
            const dateA = parseDate(a.appointment_date);
            const dateB = parseDate(b.appointment_date);
            if (dateA.getTime() === dateB.getTime()) {
              return a.appointment_time.localeCompare(b.appointment_time);
            }
            return dateA.getTime() - dateB.getTime();
          });
        });

        const totalAppointments = data.length;
        const pendingAppointments = data.filter(app => app.appointment_status === 'Pending').length;
        const completedAppointments = data.filter(app => app.appointment_status === 'Completed').length;
        const todayAppointments = grouped.today.length;
        const totalPatients = new Set(data.map(app => app.patient_name)).size;

        setStats({
          totalAppointments,
          pendingAppointments,
          completedAppointments,
          totalPatients,
          todayAppointments
        });

        setAppointmentsByDate(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const renderAppointmentsTable = () => {
    const appointments = appointmentsByDate[selectedGroup];
    if (appointments.length === 0) {
      return (
        <div className="no-appointments">
          <p>No appointments for {selectedGroup}</p>
        </div>
      );
    }

    return (
      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td><span className="name">{appointment.patient_name}</span></td>
                <td><span className="name">{appointment.doctor_name}</span></td>
                <td><span className="date">{formatDate(appointment.appointment_date)}</span></td>
                <td><span className="time">{formatTime(appointment.appointment_time)}</span></td>
                <td>
                  <span className={`status-badge ${appointment.appointment_status.toLowerCase()}`}>
                    {appointment.appointment_status}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/getPatientReports/${appointment.appointment_id}`)}
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome to Your Dashboard</h1>
          <p className="subtitle">Manage your appointments and patients efficiently</p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate('/admin/appointments')}>
            <i className="fas fa-calendar"></i> Appointments
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/profile')}>
            <i className="fas fa-user"></i> Profile
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Appointments', value: stats.totalAppointments, icon: 'calendar-check', trend: 'All Time' },
          { label: "Today's Appointments", value: stats.todayAppointments, icon: 'calendar-day', trend: 'Today' },
          { label: 'Pending', value: stats.pendingAppointments, icon: 'clock', trend: 'Needs attention', warning: true },
          { label: 'Total Patients', value: stats.totalPatients, icon: 'user-friends', trend: 'Active Patients' },
        ].map(({ label, value, icon, trend, warning }) => (
          <div className="stat-card" key={label}>
            <div className="stat-content">
              <div className="stat-icon">
                <i className={`fas fa-${icon}`}></i>
              </div>
              <div className="stat-info">
                <h3>{label}</h3>
                <p className="stat-number">{value}</p>
              </div>
            </div>
            <div className="stat-footer">
              <span className={`trend ${warning ? 'warning' : 'positive'}`}>
                <i className={`fas fa-${warning ? 'exclamation-circle' : 'arrow-up'}`}></i> {trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-appointments">
          <div className="section-header">
            <h2>Appointments</h2>
            <div className="date-filter-buttons">
              {['today', 'tomorrow', 'dayAfterTomorrow', 'later'].map(group => (
                <button
                  key={group}
                  className={`filter-btn ${selectedGroup === group ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group === 'dayAfterTomorrow' ? 'Day After' : group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {renderAppointmentsTable()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
