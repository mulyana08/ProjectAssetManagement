import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./config/Database.js";
import registerRoutes from "./routes/index.js";
import { syncDatabase } from "./models/index.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS Configuration - Allow all origins in development
app.use(cors({
    origin: true, // Allow all origins
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ==========================================
// DATABASE CONNECTION
// ==========================================

const connectDatabase = async () => {
    try {
        await db.authenticate();
        console.log("✅ Database connection established successfully.");
        
        // Sync database (create tables if not exist)
        // In production, use migrations instead
        if (process.env.NODE_ENV === "development") {
            await syncDatabase({ alter: true });
            console.log("✅ Database synchronized.");
        }
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error.message);
        process.exit(1);
    }
};

// ==========================================
// ROUTES
// ==========================================

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "IT Asset Management API is running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// API Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Register all API routes
registerRoutes(app);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.originalUrl
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

// ==========================================
// START SERVER (only when not testing)
// ==========================================

const startServer = async () => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}\n`);
    });
};

// Avoid starting the server when running tests — tests should import the app directly.
if (process.env.NODE_ENV !== "test") {
    startServer();
}

export default app;

