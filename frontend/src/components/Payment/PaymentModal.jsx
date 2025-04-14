import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PaymentModal.css';

const PaymentModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // First get the user's ID
        const userResponse = await fetch("http://localhost:8000/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Then fetch the appointment details
        const response = await fetch(`http://localhost:8000/home/displayappoint/${userId}`);
        if (response.ok) {
          const data = await response.json();
          // Find the specific appointment by ID
          const foundAppointment = data.find(app => app.appointment_id === id);
          if (foundAppointment) {
            setAppointment(foundAppointment);
          } else {
            setError('Appointment not found');
          }
        } else {
          setError('Failed to fetch appointment details');
        }
      } catch (error) {
        setError('Error fetching appointment details: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      // Process payment
      const paymentResponse = await fetch(`http://localhost:8000/payment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber,
          expiryDate,
          cvv,
          name,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      // Update appointment status
      const statusResponse = await fetch(`http://localhost:8000/home/appointment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update appointment status');
      }

      // Send email confirmation
      const emailResponse = await fetch(`http://localhost:8000/send-email/${id}`, {
        method: 'POST',
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email confirmation');
      }

      // Navigate back to appointments page
      navigate('/appointments');
    } catch (error) {
      setError(error.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="payment-container">
        <div className="loading">Loading appointment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="error-message">{error}</div>
        <button className="pay-button" onClick={() => navigate('/appointments')}>
          Go Back
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="payment-container">
        <div className="error-message">Appointment not found</div>
        <button className="pay-button" onClick={() => navigate('/appointments')}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Complete Payment</h2>
        <button className="close-btn" onClick={() => navigate('/appointments')}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="payment-details">
        <p>Doctor: {appointment.doctor_name}</p>
        <p>Date: {appointment.appointment_date}</p>
        <p>Time: {appointment.appointment_time}</p>
        <p className="amount">Amount: ₹{appointment.doct_consultationFees}</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="1234 5678 9012 3456"
            required
            pattern="[0-9]{16}"
          />
        </div>

        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setExpiryDate(value);
                }
              }}
              placeholder="MMYY"
              maxLength="4"
              required
              pattern="[0-9]{4}"
            />
          </div>

          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="123"
              maxLength="3"
              required
              pattern="[0-9]{3}"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="pay-button"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>

      <div className="payment-security">
        <p>🔒 Secure Payment</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default PaymentModal; 