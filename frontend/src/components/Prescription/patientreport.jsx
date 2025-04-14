import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import './PatientReport.css';

function PatientReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problemDescription, setProblemDescription] = useState('');
  const [reports, setReports] = useState([{ file: null, preview: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');

  const handleFileChange = (file, index) => {
    const previewURL = file ? URL.createObjectURL(file) : null;
    const updatedReports = [...reports];
    updatedReports[index] = { file, preview: previewURL };

    if (index === reports.length - 1 && file) {
      updatedReports.push({ file: null, preview: null });
    }

    setReports(updatedReports);
  };

  const handleRemoveFile = (index) => {
    const updatedReports = reports.filter((_, i) => i !== index);
    if (updatedReports.length === 0 || updatedReports.every((r) => r.file !== null)) {
      updatedReports.push({ file: null, preview: null });
    }
    setReports(updatedReports);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('problem_description', problemDescription);
      
      // Add only files that are not null
      reports.forEach((report) => {
        if (report.file) {
          formData.append('reports', report.file);
        }
      });

      const response = await fetch(`http://localhost:8000/home/addpatientreport/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setMessage('✅ Report submitted successfully!');
      setType('success');
      
      // Navigate to appointments page after 2 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);

    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-report-container">
      <h2>🩺 Patient Report Form</h2>
      {message && (
        <div className={`message ${type}`}>
          {message}
        </div>
      )}
      <form className="patient-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>📝 Describe Your Problem</label>
          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            rows="5"
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className="preview-section">
          <label className="file-upload-button">
            <span>📎 Upload Medical Reports</span>
            <p>Click or drag files to upload</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e.target.files[0], reports.length - 1)}
              multiple
              disabled={isSubmitting}
            />
          </label>

          <div className="file-grid">
            {reports
              .filter((entry) => entry.file !== null)
              .map((entry, index) => (
                <div key={index} className="file-preview">
                  {entry.file.type.startsWith('image/') ? (
                    <img
                      src={entry.preview}
                      alt="Preview"
                      className="image-preview"
                    />
                  ) : (
                    <p className="pdf-preview">📄 {entry.file.name}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="remove-button"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default PatientReport;
