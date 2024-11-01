import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { Groq } from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for image upload
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600,
}));

app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health check endpoint with detailed status
app.get('/api/health', (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      groq: !!process.env.GROQ_API_KEY,
    }
  };
  res.json(status);
});

// Image analysis endpoint with enhanced error handling
app.post('/api/analyze-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        details: 'Please provide an image file'
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: 'Please provide a valid image file'
      });
    }

    const base64Image = req.file.buffer.toString('base64');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this receipt image and extract all food items with their quantities. Format the response as a JSON array with objects containing 'name' (normalized product name), 'quantity', and 'unit'. Only include food items. If the image is not a food receipt, return an empty array."
            },
            {
              type: "image",
              image: base64Image
            }
          ]
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 4000,
      timeout: 30000,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return res.status(500).json({
        error: 'Processing error',
        details: 'Failed to analyze the image content'
      });
    }

    try {
      // Validate JSON response
      const parsedResult = JSON.parse(result);
      if (!Array.isArray(parsedResult)) {
        throw new Error('Invalid response format');
      }
      
      res.json({ result });
    } catch (error) {
      res.status(500).json({
        error: 'Invalid response',
        details: 'The image analysis produced invalid data'
      });
    }
  } catch (error) {
    if (error.name === 'GroqError') {
      return res.status(500).json({
        error: 'AI processing error',
        details: 'Failed to analyze the image. Please try again.'
      });
    }
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        details: 'The image file size exceeds the maximum limit of 10MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      details: err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    details: 'An unexpected error occurred'
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown handling
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);