# DocuBook - Medical Appointment System

DocuBook is a comprehensive medical appointment management system that connects patients with healthcare providers, streamlining the appointment booking process and enhancing healthcare accessibility.

## Features

### For Patients
- Easy appointment booking
- Doctor search and selection
- Medical report management
- Prescription tracking
- Appointment history
- Secure messaging with doctors
- Emergency contact information

### For Doctors
- Appointment management
- Patient record access
- Prescription generation
- Report viewing
- Schedule management
- Patient communication

### For Administrators
- User management
- Doctor management
- Appointment oversight
- Report generation
- System monitoring
- Analytics dashboard

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- React Icons
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer
- PDFKit

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/mouryavardhan/docubook.git
cd docubook
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
PORT=8000
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## Project Structure

```
docubook/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Appointments
- GET /api/appointments - Get all appointments
- POST /api/appointments - Create new appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Delete appointment

### Doctors
- GET /api/doctors - Get all doctors
- POST /api/doctors - Add new doctor
- PUT /api/doctors/:id - Update doctor
- DELETE /api/doctors/:id - Delete doctor

### Patients
- GET /api/patients - Get all patients
- GET /api/patients/:id - Get patient details
- PUT /api/patients/:id - Update patient

### Prescriptions
- POST /api/prescriptions - Create prescription
- GET /api/prescriptions/:id - Get prescription
- PUT /api/prescriptions/:id - Update prescription

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- JWT-based authentication
- Password encryption
- Role-based access control
- Input validation
- CORS protection
- Rate limiting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the component library
- React Icons for the icon set
- MongoDB for the database
- Express.js for the backend framework

## Contact

For any queries or support, please contact:
- Email: support@docubook.com
- Website: www.docubook.com
- Phone: +1 (555) 123-4567

## Future Enhancements

- Video consultation feature
- Mobile application
- AI-powered symptom checker
- Integration with health insurance providers
- Multi-language support
- Advanced analytics dashboard
