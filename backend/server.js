const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Changed from fs.promises to fs
const Handlebars = require('handlebars');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/email-builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Email Template Schema
const EmailTemplateSchema = new mongoose.Schema({
    title: String,
    content: String,
    footer: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const EmailTemplate = mongoose.model('EmailTemplate', EmailTemplateSchema);

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// API Routes
app.get('/api/getEmailLayout', (req, res) => {
    try {
        const template = fs.readFileSync(path.join(__dirname, 'templates/layout.html'), 'utf8');
        res.send(template);
    } catch (error) {
        console.error('Error reading template:', error);
        res.status(500).send('Error reading template file');
    }
});

app.post('/api/uploadImage', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

app.post('/api/uploadEmailConfig', async (req, res) => {
    try {
        const emailTemplate = new EmailTemplate(req.body);
        await emailTemplate.save();
        res.status(201).json(emailTemplate);
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).send('Error saving template configuration');
    }
});

app.post('/api/renderAndDownloadTemplate', (req, res) => {
    try {
        const templateFile = fs.readFileSync(path.join(__dirname, 'templates/layout.html'), 'utf8');
        const template = Handlebars.compile(templateFile);
        const html = template(req.body);
        res.send(html);
    } catch (error) {
        console.error('Error rendering template:', error);
        res.status(500).send('Error rendering template');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});