import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './getDoctorPres.css'; // Import the CSS file
import { FaDownload, FaUserMd, FaUser, FaCalendarAlt, FaPills, FaNotesMedical, FaCalendarCheck } from 'react-icons/fa';

function GetDoctPres() { // Renamed component to follow convention
  const { id } = useParams(); // This is the appointmentId
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prescriptionRef = useRef(); // Ref for the content to download

  useEffect(() => {
    const fetchPrescription = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/admin/doctorPrescription/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch prescription');
        }
        const data = await response.json();
        setPrescription(data.prescription); // Assuming backend sends { prescription: {...} }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching prescription:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrescription();
    }
  }, [id]);

  const handleDownload = () => {
    const input = prescriptionRef.current;
    if (!input) {
      console.error("Prescription element not found");
      return;
    }

    html2canvas(input, { scale: 2 }) // Increase scale for better resolution
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4 size
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Add some margin top

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`prescription-${prescription?.patient_name || 'details'}-${new Date().toLocaleDateString()}.pdf`);
      })
      .catch(err => {
        console.error("Error generating PDF:", err);
        setError("Could not generate PDF for download.");
      });
  };

  if (loading) {
    return <div className="loading-pres">Loading Prescription...</div>;
  }

  if (error) {
    return <div className="error-pres">Error: {error}</div>;
  }

  if (!prescription) {
    return <div className="not-found-pres">No prescription found for this appointment.</div>;
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="get-prescription-container">
      <div ref={prescriptionRef} className="prescription-content">
        <h2>Medical Prescription</h2>

        {/* Header Info */}
        <div className="pres-header-info">
            <div><strong>Date:</strong> {formatDate(prescription.createdAt)}</div>
            <div><strong>Appointment ID:</strong> {prescription.appointmentId}</div>
        </div>

        {/* Patient Details */}
        <section className="pres-section">
          <h3><FaUser /> Patient Information</h3>
          <div className="pres-grid">
            <div><strong>Name:</strong> {prescription.patient_name}</div>
            <div><strong>DOB:</strong> {formatDate(prescription.patient_dob)}</div>
            <div><strong>Gender:</strong> {prescription.patient_gender}</div>
            <div><strong>Phone:</strong> {prescription.patient_phone}</div>
            <div className="grid-col-span-2"><strong>Email:</strong> {prescription.patient_email}</div>
          </div>
        </section>

        {/* Doctor Details */}
        <section className="pres-section">
          <h3><FaUserMd /> Doctor Information</h3>
          <div className="pres-grid">
            <div><strong>Name:</strong> {prescription.doctor_name}</div>
            <div><strong>Specialization:</strong> {prescription.doctor_specialization}</div>
            <div><strong>Phone:</strong> {prescription.doctor_phone}</div>
            <div className="grid-col-span-2"><strong>Email:</strong> {prescription.doctor_email}</div>
          </div>
        </section>

        <hr className="pres-divider" />

        {/* Prescription Details */}
        <section className="pres-section">
          <h3><FaNotesMedical /> Diagnosis</h3>
          <p>{prescription.diagnosis || 'No diagnosis provided.'}</p>
        </section>

        <section className="pres-section">
            <h3><FaPills /> Medications</h3>
            {prescription.medications && prescription.medications.length > 0 ? (
                <table className="medications-table-pres">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Medicine Name</th>
                            <th>Dosage</th>
                            <th>Duration</th>
                            <th>Timing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescription.medications.map((med, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{med.name}</td>
                                <td>{med.dosage}</td>
                                <td>{med.duration}</td>
                                <td>{med.timing}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No medications prescribed.</p>
            )}
        </section>

        <section className="pres-section">
          <h3>Instructions</h3>
          <p>{prescription.instructions || 'No specific instructions provided.'}</p>
        </section>

        <section className="pres-section">
          <h3><FaCalendarCheck /> Follow-up Date</h3>
          <p>{formatDate(prescription.followUp) || 'No follow-up date specified.'}</p>
        </section>
      </div>

      {/* Download Button Area */}
      <div className="download-button-area">
        <button onClick={handleDownload} className="download-btn">
          <FaDownload /> Download Prescription (PDF)
        </button>
      </div>
      

    </div>
  );
}

export default GetDoctPres;
