const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Import path module
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema
const Patient = require("../models/patientSchema");
const Appointment = require("../models/appoinmentSchema");
const PatientProblem = require("../models/patProblem");
const DoctorPrescription = require("../models/doctPres");
const app = express();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// --- Nodemailer Configuration (IMPORTANT: Use Environment Variables in Production!) ---
// You might want to move this to a separate config file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      // Replace with your email and an App Password generated from Google Account settings
      user: process.env.EMAIL_USER || 'img_2023028@iiitm.ac.in', // Fallback, but use env vars!
      pass: process.env.EMAIL_PASS || 'Vi@27052004' // Fallback, use env vars!
  }
});

// --- PDF Generation Function (Adding Backgrounds & Outline) ---
async function generatePrescriptionPDF(prescription) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                console.error("PDF Generation Error:", err);
                reject(err);
            });

            // --- Constants and Helpers ---
            const pageMargin = 50;
            const contentWidth = doc.page.width - pageMargin * 2;
            const columnGap = 30;
            const columnWidth = (contentWidth - columnGap) / 2;
            const leftColX = pageMargin;
            const rightColX = pageMargin + columnWidth + columnGap;

            const boldFont = 'Helvetica-Bold';
            const regularFont = 'Helvetica';
            const titleFontSize = 18;
            const sectionHeadingFontSize = 12;
            const labelFontSize = 9;
            const valueFontSize = 9;
            const tableHeaderFontSize = 8;
            const tableBodyFontSize = 9;

            const textColor = '#333333';
            const headingColor = '#000000';
            const tableHeaderBg = '#EAEAEA';
            const tableBorderColor = '#AAAAAA';
            const separatorLineColor = '#CCCCCC';
            const sectionBgColor = '#F5F5F5'; // Light background for specific sections
            const outlineColor = '#BBBBBB'; // Color for the main outline

            // Helper to format date
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                   const date = new Date(dateString);
                   if (isNaN(date.getTime())) return 'Invalid Date';
                   return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
                } catch (e) {
                   return 'Invalid Date';
                }
            };

            // Helper to draw section heading (without line now)
            const drawSectionHeader = (text, yPos) => {
                doc.fontSize(sectionHeadingFontSize).font(boldFont).fillColor(headingColor)
                   .text(text, pageMargin, yPos, { width: contentWidth });
                return doc.heightOfString(text) + 5; // Return height used + padding
            };
            
             // Helper for drawing label-value pairs in columns
            const drawLabelValue = (label, value, xPos, yPos, labelWidth = 60) => {
                const valueX = xPos + labelWidth;
                doc.font(boldFont).text(label, xPos, yPos, { width: labelWidth - 5, lineBreak: false });
                // Calculate height needed for the value text
                const valueHeight = doc.font(regularFont).heightOfString(value || 'N/A', { width: columnWidth - labelWidth });
                doc.font(regularFont).text(value || 'N/A', valueX, yPos, { width: columnWidth - labelWidth });
                return valueHeight + 2; // Return height used + spacing
            };
            
            // Helper to draw a filled background box for a section
            const drawSectionBackground = (startY, contentHeight) => {
                const padding = 10;
                doc.rect(pageMargin - padding, startY - padding, contentWidth + padding * 2, contentHeight + padding * 2)
                   .fill(sectionBgColor);
            };

            // --- PDF Content ---

            // ----- Main Title ----- 
            doc.fontSize(titleFontSize).font(boldFont).fillColor(headingColor)
               .text('Medical Report', { align: 'center' });
            doc.moveDown(1.5);

            // ----- Header Info ----- 
            doc.fontSize(labelFontSize).font(regularFont).fillColor(textColor);
            const headerY = doc.y;
            doc.text(`Date Issued: ${formatDate(prescription.createdAt)}`, leftColX, headerY, { align: 'left' });
            doc.text(`Appointment ID: ${prescription.appointmentId}`, leftColX, headerY, { align: 'right' });
            doc.moveDown(2);
            const contentStartY = doc.y; // Mark Y position where main content starts

            // ----- Patient & Doctor Information (2 Columns) -----
            const infoStartY = doc.y;
            let leftY = infoStartY;
            let rightY = infoStartY;

            // Left Column (Patient)
            doc.fontSize(sectionHeadingFontSize).font(boldFont).fillColor(headingColor)
               .text('Patient Information', leftColX, leftY, { width: columnWidth });
            leftY += 20; // Space after heading
            doc.fontSize(labelFontSize).fillColor(textColor);
            leftY += drawLabelValue('Name:', prescription.patient_name, leftColX, leftY);
            leftY += drawLabelValue('Gender:', prescription.patient_gender, leftColX, leftY);
            leftY += drawLabelValue('Email:', prescription.patient_email, leftColX, leftY);
            leftY += drawLabelValue('Address:', prescription.patient_address, leftColX, leftY); // Add Address if available
            leftY += drawLabelValue('DOB:', formatDate(prescription.patient_dob), leftColX, leftY);
            leftY += drawLabelValue('Phone:', prescription.patient_phone, leftColX, leftY);

            // Right Column (Doctor)
            doc.fontSize(sectionHeadingFontSize).font(boldFont).fillColor(headingColor)
               .text('Doctor Information', rightColX, infoStartY, { width: columnWidth }); // Start at same Y
            rightY = infoStartY + 20; // Space after heading
            doc.fontSize(labelFontSize).fillColor(textColor);
            rightY += drawLabelValue('DoctorName:', `Dr. ${prescription.doctor_name}`, rightColX, rightY);
            rightY += drawLabelValue('Specialization:', prescription.doctor_specialization, rightColX, rightY);
            rightY += drawLabelValue('Doctor Phone:', prescription.doctor_phone, rightColX, rightY);
            rightY += drawLabelValue('Doctor Email:', prescription.doctor_email, rightColX, rightY);

            // Move below the longer column before drawing the separator
            doc.y = Math.max(leftY, rightY) + 10;
            doc.strokeColor(separatorLineColor).lineWidth(0.5)
               .moveTo(pageMargin, doc.y).lineTo(doc.page.width - pageMargin, doc.y).stroke();
            doc.moveDown(1.5);

            // ----- Diagnosis ----- 
            let sectionStartY = doc.y;
            let headerHeight = drawSectionHeader('Diagnosis', sectionStartY);
            let contentY = sectionStartY + headerHeight;
            doc.fontSize(valueFontSize).font(regularFont).fillColor(textColor);
            let diagnosisText = 'N/A';
            if (prescription.diagnosis && typeof prescription.diagnosis === 'string') {
                diagnosisText = prescription.diagnosis;
            }
            const diagnosisHeight = doc.heightOfString(diagnosisText, { width: contentWidth });
            // Draw background first
            drawSectionBackground(sectionStartY, headerHeight + diagnosisHeight);
            // Redraw header on top of background
            drawSectionHeader('Diagnosis', sectionStartY);
            // Draw text
            doc.text(diagnosisText, pageMargin, contentY, { width: contentWidth, align: 'justify' });
            doc.y = contentY + diagnosisHeight + 15; // Move down after content + padding
            doc.moveDown(1.5);

            // ----- Medications ----- 
            sectionStartY = doc.y;
            headerHeight = drawSectionHeader('Medications', sectionStartY);
            doc.y = sectionStartY + headerHeight; // Position cursor after header for table

            const tableTop = doc.y;
            const tableStartX = pageMargin;
            const tableEndX = doc.page.width - pageMargin;
            const colWidths = {
                num: 30,
                name: 220,
                dosage: 100,
                duration: 100,
                timing: contentWidth - 30 - 220 - 100 - 100 // Remaining width
            };
            const tableRowHeight = 20; 
            const cellPadding = 5;

            // Function to draw table row (modified slightly)
            const drawTableRow = (y, items, isHeader = false) => {
                 const font = isHeader ? boldFont : regularFont;
                 const fontSize = isHeader ? tableHeaderFontSize : tableBodyFontSize;
                 doc.fontSize(fontSize).font(font);
                 const textY = y + (tableRowHeight - fontSize) / 2; // Approx vertical center

                 if (isHeader) {
                     doc.rect(tableStartX, y, contentWidth, tableRowHeight).fill(tableHeaderBg);
                 }

                 let currentX = tableStartX;
                 // Draw cells and text
                 doc.fillColor(textColor).text(items[0], currentX + cellPadding, textY, { width: colWidths.num - cellPadding * 2 });
                 currentX += colWidths.num;
                 doc.rect(currentX, y, 0, tableRowHeight).stroke(tableBorderColor);
                 doc.text(items[1], currentX + cellPadding, textY, { width: colWidths.name - cellPadding * 2 });
                 currentX += colWidths.name;
                 doc.rect(currentX, y, 0, tableRowHeight).stroke(tableBorderColor);
                 doc.text(items[2], currentX + cellPadding, textY, { width: colWidths.dosage - cellPadding * 2 });
                 currentX += colWidths.dosage;
                 doc.rect(currentX, y, 0, tableRowHeight).stroke(tableBorderColor);
                 doc.text(items[3], currentX + cellPadding, textY, { width: colWidths.duration - cellPadding * 2 });
                 currentX += colWidths.duration;
                 doc.rect(currentX, y, 0, tableRowHeight).stroke(tableBorderColor);
                 doc.text(items[4], currentX + cellPadding, textY, { width: colWidths.timing - cellPadding * 2 });
                 
                 // Draw horizontal bottom border for row
                 doc.moveTo(tableStartX, y + tableRowHeight).lineTo(tableEndX, y + tableRowHeight).stroke(tableBorderColor);
            };

            // Draw Table Header
            drawTableRow(tableTop, ['#', 'Medicine Name', 'Dosage', 'Duration', 'Timing'], true);
            doc.y = tableTop + tableRowHeight;

            // Draw Table Body
            prescription.medications.forEach((med, index) => {
                 if (doc.y + tableRowHeight > doc.page.height - pageMargin) { 
                    doc.addPage();
                    doc.y = pageMargin;
                    // Redraw header on new page if needed
                    drawTableRow(doc.y, ['#', 'Medicine Name', 'Dosage', 'Duration', 'Timing'], true);
                    doc.y += tableRowHeight;
                 }
                drawTableRow(doc.y, [
                    index + 1,
                    med.name || '',
                    med.dosage || '',
                    med.duration || '',
                    med.timing || ''
                ]);
                doc.y += tableRowHeight;
            });
             // Draw outer table borders
             doc.rect(tableStartX, tableTop, contentWidth, doc.y - tableTop).stroke(tableBorderColor);

            doc.moveDown(1.5);

            // ----- Instructions ----- 
            sectionStartY = doc.y;
            headerHeight = drawSectionHeader('Instructions', sectionStartY);
            contentY = sectionStartY + headerHeight;
            doc.fontSize(valueFontSize).font(regularFont).fillColor(textColor);
            let instructionsText = 'N/A';
            if (prescription.instructions && typeof prescription.instructions === 'string') {
                instructionsText = prescription.instructions;
            }
            const instructionsHeight = doc.heightOfString(instructionsText, { width: contentWidth });
            // Draw background first
            drawSectionBackground(sectionStartY, headerHeight + instructionsHeight);
             // Redraw header on top of background
            drawSectionHeader('Instructions', sectionStartY);
            // Draw text
            doc.text(instructionsText, pageMargin, contentY, { width: contentWidth, align: 'justify' });
            doc.y = contentY + instructionsHeight + 15;
            doc.moveDown(1.5);

            // ----- Follow-up Date ----- 
            sectionStartY = doc.y;
            headerHeight = drawSectionHeader('Follow-up Date', sectionStartY);
            contentY = sectionStartY + headerHeight;
            doc.fontSize(valueFontSize).font(regularFont).fillColor(textColor);
            let followupText = formatDate(prescription.followUp) || 'N/A';
            const followupHeight = doc.heightOfString(followupText, { width: contentWidth });
             // Draw background first
            drawSectionBackground(sectionStartY, headerHeight + followupHeight);
            // Redraw header on top of background
            drawSectionHeader('Follow-up Date', sectionStartY);
            // Draw text
            doc.text(followupText, pageMargin, contentY, { width: contentWidth });
            doc.y = contentY + followupHeight + 15;
            doc.moveDown(2);

            // ----- Draw Outline Box ----- 
            const contentEndY = doc.y;
            doc.rect(pageMargin - 15, contentStartY - 15, contentWidth + 30, contentEndY - contentStartY + 30)
               .stroke(outlineColor);

            // Finalize PDF
            doc.end();

        } catch (error) {
            console.error("PDF Generation Error:", error);
            reject(error);
        }
    });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Storage Setup for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

router.post('/adddoctor', upload.single('file'), async (req, res) => {
  try {
    // Destructure request body
    const { doct_name, doct_email, doct_phone, doct_specialization, doct_degree,
      doct_experience, doct_consultationFees, doct_address, doct_about } = req.body;

    // Validate input fields
    if (!doct_name || !doct_email || !doct_phone ||
      !doct_specialization || !doct_degree || !doct_experience || !doct_consultationFees ||
      !doct_address || !doct_about) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get the uploaded file's filename
    const file = req.file ? req.file.filename : null;

    // Create new doctor entry
    const newDoctor = new Doctor({
      doct_name,
      doct_email,
      doct_phone,
      doct_specialization,
      doct_degree,
      doct_experience,
      doct_consultationFees,
      doct_address,
      doct_about,
      file
    });

    // Save doctor to DB
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/alldoctors', async (req, res) => {
  try {
    const doctorData = await Doctor.find({});
    return res.json({ alldata: doctorData }); // Send 'alldata' to match frontend
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get Doctor by ID
router.get('/getdoctor/:id', async (req, res) => {
  const doctorId = req.params.id;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Doctor by ID
router.delete("/deletedoctor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }
    res.status(200).json({ message: "Doctor deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
});

router.put("/editdoctor/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (req.file) {
      updatedData.file = req.file.path; // Save file path
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Error updating doctor", error });
  }
});

// Appointments 
router.get("/adminAppoint", async (req, res) => {
  try {
    // Fetch all appointments
    const appointments = await Appointment.find({});
    
    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    // Fetch doctor and patient details for each appointment
    const formattedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        // Fetch patient details
        const patientUser = await Patient.findOne({patient_userId:appointment.patient_userId});

        
        // Fetch doctor details
        const doctor = await Doctor.findById(appointment.doctor_id);
        
                // Calculate patient age from date of birth

                let formattedDob = "Unknown";
                if (patientUser && patientUser.patient_dob) {
                  const birthDate = new Date(patientUser.patient_dob);
                  if (!isNaN(birthDate.getTime())) {  // Check if it's a valid date
                    formattedDob = birthDate.toISOString().split("T")[0];  // Extract only YYYY-MM-DD
                  }
                }
        return {
          doctor_name: doctor ? doctor.doct_name : "Unknown Doctor",
          doctor_img: doctor ? doctor.file : "No image",
          doct_consultationFees: doctor ? doctor.doct_consultationFees : "N/A",
          patient_name: patientUser ? patientUser.patient_name : "Unknown Patient",
          patient_img: patientUser ? patientUser.file : "No image",
          patient_dob:  formattedDob,
          appointment_id: appointment._id,
          appointment_date: appointment.appoinment_date,
          appointment_time: appointment.appoinment_time,
          appointment_status: appointment.appoinment_status
        };
      })
    );

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/acceptAppointment/:id", async (req, res) => {
  try {
    const appointment_id = req.params.id;
    const { appointment_status } = req.body; // Extract status correctly

    if (!appointment_status) {
      return res.status(400).json({ message: "Appointment status is required" });
    }

    // Find the appointment by ID and update the status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment_id,
      { appointment_status }, // Update only the status
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: `Appointment status updated to '${appointment_status}' successfully`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getpatientreport/:id", async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const report = await PatientProblem.findOne({ appointmentId });
    const appointment = await Appointment.findOne({ _id: appointmentId });
    const doctor = await Doctor.findOne({ _id: appointment.doctor_id });
    if (!report) {
      return res.status(404).json({ message: 'Patient report not found' });
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const patient = await Patient.findOne({ patient_userId: appointment.patient_userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientWithImageURL = {
      ...patient.toObject(),
      file: patient.file ? `http://localhost:8000/uploads/${patient.file}` : null,
    };

    res.status(200).json({
      message: 'Patient report retrieved successfully',
      appointment,
      report,
      doctor,
      patient: patientWithImageURL
    });

  } catch (error) {
    console.error('Error retrieving patient report:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post("/doctorPrescription/:id", async (req, res) => {
  const appointmentId = req.params.id;

  try {
    // 1. Fetch related data
    const appointment = await Appointment.findOne({ _id: appointmentId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const doctor = await Doctor.findOne({ _id: appointment.doctor_id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const patient = await Patient.findOne({ patient_userId: appointment.patient_userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 2. Create prescription data object matching schema
    const newPrescriptionData = {
      appointmentId: appointment._id,
      patient_name: patient.patient_name,
      patient_email: patient.patient_email,
      patient_phone: patient.patient_phone,
      patient_gender: patient.patient_gender,
      patient_dob: patient.patient_dob,
      doctor_name: doctor.doct_name,
      doctor_email: doctor.doct_email,
      doctor_phone: doctor.doct_phone,
      doctor_specialization: doctor.doct_specialization,
      diagnosis: req.body.diagnosis,
      medications: req.body.medications, // Assuming this matches the schema structure
      instructions: req.body.instructions,
      followUp: req.body.followUp,
    };

    // 3. Save the new prescription
    const newPrescription = new DoctorPrescription(newPrescriptionData);
    await newPrescription.save();

    // --- PDF Generation --- 
    let pdfBuffer;
    try {
      // Pass the saved document (or its data) to the generator
      pdfBuffer = await generatePrescriptionPDF(newPrescription.toObject()); 
      console.log("Prescription PDF generated successfully.");
    } catch (pdfError) {
      console.error('Error generating prescription PDF:', pdfError);
      // Log the error but still respond successfully about prescription creation
      return res.status(201).json({ 
        message: 'Doctor prescription created successfully, but failed to generate PDF for emailing.',
        prescription: newPrescription
      });
    }

    // --- Email Sending --- 
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_email@gmail.com', // Use configured email
      to: patient.patient_email, 
      subject: `Your Medical Prescription from Dr. ${doctor.doct_name}`,
      text: 
`Dear ${patient.patient_name},

Please find your medical prescription attached, issued on ${new Date(newPrescription.createdAt).toLocaleDateString()}.

Prescribed by: Dr. ${doctor.doct_name} (${doctor.doct_specialization})

If you have any questions, please contact the clinic.

Regards,
[Docubook]`,
      // HTML version (optional, improves formatting)
      // html: `<p>Dear ${patient.patient_name},</p><p>Please find your medical prescription attached...</p>`, 
      attachments: [
        {
          filename: `prescription-${new Date(newPrescription.createdAt).toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error('Error sending prescription email:', emailErr);
        // Still respond successfully about creation, but mention email failure
        res.status(201).json({ 
          message: 'Doctor prescription created successfully, but failed to send email confirmation.',
          prescription: newPrescription 
        });
      } else {
        console.log('Prescription email sent: ' + info.response);
        res.status(201).json({ 
          message: 'Doctor prescription created successfully and email sent.',
          prescription: newPrescription 
        });
      }
    });

  } catch (error) {
    // Catch errors from finding data or saving prescription
    console.error('Error in /doctorPrescription route:', error);
    res.status(500).json({ message: 'Internal Server Error during prescription creation.' });
  }
});

router.get("/doctorPrescription/:id", async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const prescription = await DoctorPrescription.findOne({ appointmentId });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found for this appointment" });
    }

    res.status(200).json({
      message: "Doctor prescription retrieved successfully",
      prescription,
    });

  } catch (error) {
    console.error("Error retrieving prescription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/doctorPrescriptions", async (req, res) => {
  try {
    const prescriptions = await DoctorPrescription.find();
    res.status(200).json({ prescriptions });
  } catch (error) {
    console.error("Error retrieving all prescriptions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
