require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');

// Initialize Express
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://guru707378_db_user:Dn5WoAnlVBy8l4Rk@cluster0.ttqax7d.mongodb.net/?appName=Cluster0';
const seedSuperAdmin = async () => {
  const User = require('./models/User');
  const bcrypt = require('bcrypt');
  const superAdminEmail = 'superadmin@gmail.com';
  const existing = await User.findOne({ email: superAdminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('superadmin@123', 10);
    await User.create({ email: superAdminEmail, password: hashed, role: 'superadmin' });
    console.log('SuperAdmin seeded: superadmin@gmail.com / superadmin@123');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voter', voterRoutes);

// Error handling middleware
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow frontend ports
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to our router
app.set('socketio', io);

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedSuperAdmin();

    // Start server only after DB connection is successful
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // process.exit(1); // Optional: exit if DB fails
  });
