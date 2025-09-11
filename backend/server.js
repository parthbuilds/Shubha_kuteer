require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// --- Middleware ---
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static File Serving ---
app.use("/", express.static(path.join(__dirname, "..")));
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));
app.use("/admin", express.static(path.join(__dirname, "..", "admin")));

// --- Route Imports ---
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const ordersRoutes = require("./routes/orders");
const memberRoutes = require("./routes/routes");
const adminAuth = require("./middlewares/adminAuth");

// --- API Routes (Public & Protected) ---
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/orders", ordersRoutes);

// Admin APIs (protected by the adminAuth middleware)
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/users", adminAuth, adminUserRoutes);
app.use("/api/admin/products", adminAuth, productRoutes);
app.use("/api/admin/categories", adminAuth, categoryRoutes);
app.use("/api/admin/attributes", adminAuth, attributeRoutes);

// --- Admin Protected Page ---
app.get("/admin/index.html", adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "admin", "index.html"));
});

// --- 404 Not Found Handler ---
app.use((req, res) => {
    console.log(`404 → ${req.originalUrl}`);
    res.status(404).json({
        message: "❌ API route not found",
        path: req.originalUrl
    });
});

module.exports = app;
