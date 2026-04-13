const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://velvetnocturne.shop', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

connectDB();

// =====================
// SCHEMAS
// =====================

const InquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
    createdAt: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: { type: String, required: true },
    service: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Models
const Inquiry = mongoose.model('Inquiry', InquirySchema);
const Contact = mongoose.model('Contact', ContactSchema);

// =====================
// MIDDLEWARE
// =====================

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// =====================
// ROUTES - AUTH
// =====================

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded credentials for admin
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                message: 'Login successful'
            });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// =====================
// ROUTES - INQUIRIES
// =====================

app.post('/api/submit-inquiry', async (req, res) => {
    try {
        const { name, email, phone, company, message } = req.body;

        // Validation
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const inquiry = new Inquiry({
            name,
            email,
            phone,
            company: company || '',
            message
        });

        await inquiry.save();

        // Send notification email (optional)
        // await sendAdminNotification(inquiry);

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/inquiries', verifyToken, async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/inquiries/:id', verifyToken, async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.patch('/api/inquiries/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json({
            success: true,
            inquiry,
            message: 'Status updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.delete('/api/inquiries/:id', verifyToken, async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// =====================
// ROUTES - CONTACT
// =====================

app.post('/api/contact', async (req, res) => {
    try {
        const { fullname, email, phone, subject, service, message } = req.body;

        // Validation
        if (!fullname || !email || !subject || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const contact = new Contact({
            fullname,
            email,
            phone: phone || '',
            subject,
            service: service || '',
            message
        });

        await contact.save();

        res.status(201).json({
            success: true,
            message: 'Message received. We will contact you soon.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/contact', verifyToken, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// =====================
// HEALTH CHECK
// =====================

app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// =====================
// ERROR HANDLING
// =====================

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

// =====================
// SERVER
// =====================

const PORT = process.env.PORT || 3001;

// For Vercel serverless
if (process.env.VERCEL) {
    module.exports = app;
} else {
    // For local development
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
