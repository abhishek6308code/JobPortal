// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const http = require('http');

// routes
const masterRoutes = require('./routes/admin');
const employerRoutes = require('./routes/employer');
const jobsRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const adminRouter = require('./routes/admin');

const app = express();

// Connect DB
connectDB();

// Middleware
// Allow frontend origin if provided, otherwise allow all (you can tighten this in production)
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// create HTTP server and socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// attach io to express app so routes can emit events: req.app.get('io')
app.set('io', io);

// basic socket handlers
io.on('connection', (socket) => {
 

  socket.on('joinEmployerRoom', (employerId) => {
    if (!employerId) return;
    const room = String(employerId);
    socket.join(room);
   
  });

  socket.on('disconnect', () => {
   
  });
});

// Routes (keep them after app.set('io') so route handlers can access io immediately)
app.use('/api/admin', adminRouter);
// app.use('/api/master', masterRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api', jobsRoutes); // jobs public endpoints at /api/jobs
app.use('/api', applicationRoutes); // application endpoints: /api/jobs/:id/apply etc

const PORT = process.env.PORT || 5000;

// start server using server.listen so socket.io works
server.listen(PORT, () => {
  // console.log(`Server running on http://localhost:${PORT}`);
});

// Export both app and server (useful for tests or further customization)
module.exports = { app, server, io };


