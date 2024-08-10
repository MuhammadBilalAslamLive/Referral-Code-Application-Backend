const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const dotenv = require('dotenv');
require("./config/connection");

const authMiddleware = require('./middlewares/authMiddleware');
const encryptMiddleware = require('./middlewares/encryptMiddleware');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config(); // Load environment variables from .env file

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,ORIGIN,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors()); // Handle preflight requests

// Parse requests of content-type - application/json and application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// app.use(encryptMiddleware);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Wildcard route for handling undefined routes
app.use("*", (req, res, next) => {
  return res.status(404).send("No Page Found with that URL");
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
