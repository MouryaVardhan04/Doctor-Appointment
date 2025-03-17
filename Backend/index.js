const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const admin_route = require('./routes/admin_route');
const auth_route= require('./routes/auth_route');
const patient_route = require('./routes/patient_route');
const home_route = require('./routes/home_route');

const app = express();
const PORT = 8000; // ✅ Make sure your frontend is calling the correct port

// ✅ Fix CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend URL
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    // ✅ Handle preflight requests manually
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    
    next();
});

// ✅ Additional Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use('/uploads', express.static('uploads'));  

// ✅ Database Connection
mongoose
    .connect('mongodb+srv://mouryavardhan:mourya04@docbook.xenp8.mongodb.net/DocBook?retryWrites=true&w=majority&appName=DocBook')
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection failed:', err));

// ✅ Routes
app.use('/admin', admin_route);
app.use('/auth', auth_route);
app.use('/patient', patient_route);
app.use('/home', home_route);

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});






//mongodb+srv://mouryavardhan:mourya04@docbook.xenp8.mongodb.net/?retryWrites=true&w=majority&appName=DocBook




// const express = require('express');
// const mongoose = require('mongoose');
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const admin_route = require('./routes/admin_route');
// const auth_route= require('./routes/auth_route');
// const patient_route = require('./routes/patient_route')

// const app = express();
// const PORT = 8000;

// // Middleware
// app.use(
//     cors({
//       credentials: true,
//       origin: 'http://localhost:3000', // matches frontend URL
//     })
//   );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // ✅ Required for form-data
// app.use('/uploads', express.static('uploads'));  // ✅ Serves uploaded images
// app.use(cookieParser()); 
// // Database Connection
// mongoose
//     .connect('mongodb://127.0.0.1:27017/Doctor-Appointment')
//     .then(() => console.log('Database connected successfully'))
//     .catch((err) => console.error('Database connection failed:', err));

// // Routes
// app.use('/admin', admin_route);
// app.use('/auth',auth_route);
// app.use('/patient',patient_route);

// app.listen(PORT, () => {
//     console.log(`Server started at http://localhost:${PORT}`);
// });

