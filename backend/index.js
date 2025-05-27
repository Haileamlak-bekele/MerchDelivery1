const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http"); // <-- Add this
const { Server } = require("socket.io"); // <-- Add this

const dbConnect = require("./src/config/dbConnect.js");
const userRoutes = require("./routes/user.routes.js");
const AdminRoutes = require("./routes/admin.routes.js");
const merchantRoutes = require("./routes/merchant.routes.js");
const dspRoutes = require("./routes/dsp.routes.js");
const customersRoutes = require("./routes/customer.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const FeedbackRoutes = require("./routes/FeedBackRoute.js")
const paymentAccountRoutes = require("./routes/paymentAccount.routes.js");
const complaintRoutes = require('./routes/complaints');

dotenv.config();
dbConnect();

const app = express();
const port = process.env.PORT;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

//middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  next();
});
app.use(express.urlencoded({ extended: false }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//routes
app.use("/users", userRoutes);
app.use("/admin", AdminRoutes);
app.use("/merchant", merchantRoutes);
app.use("/dsp", dspRoutes);
app.use("/customers", customersRoutes);
app.use("/orders", orderRoutes);
app.use("/feedback",FeedbackRoutes)
app.use("/payment-accounts", paymentAccountRoutes);
app.use('/complaints', complaintRoutes);

// --- SOCKET.IO LOGIC HERE ---
app.set('io', io); // Make io available in the app
io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  // Example: Customer subscribes to order location updates
  socket.on('trackOrder', (orderId) => {
    socket.join(orderId);
  });

  // Example: DSP location update (emit to customers)
  socket.on('dspLocationUpdate', ({ orderId, lat, lng }) => {
    io.to(orderId).emit('order-location-update', { lat, lng });
  });

  io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
});

  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });
});

// Start server (use server.listen, not app.listen)
server.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});