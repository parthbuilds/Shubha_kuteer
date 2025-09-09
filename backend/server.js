// backend/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// =========================
// 🔹 Middlewares
// =========================
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// 🔹 Serve Static Files
// =========================
app.use("/", express.static(path.join(__dirname, ".."))); 
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads"))); 
app.use("/admin", express.static(path.join(__dirname, "..", "admin"))); 

// =========================
// 🔹 Import Routes
// =========================
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminAuth = require("./middlewares/adminAuth");
const adminUserRoutes = require("./routes/adminUserRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");

// =========================
// 🔹 API Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/admin/users", adminAuth, adminUserRoutes);
app.use("/api/admin/products", adminAuth, productRoutes);
app.use("/api/admin/categories", adminAuth, categoryRoutes);
app.use("/api/admin/attributes", adminAuth, attributeRoutes);

// =========================
// 🔹 Admin protected routes
// =========================
app.get("/admin/index.html", adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "admin", "index.html"));
});

// =========================
// 🔹 404 Fallback
// =========================
app.use((req, res) => {
    console.log("404 hit:", req.originalUrl);
    res.status(404).json({ message: "❌ API route not found", path: req.originalUrl });
});

// =========================
// 🔹 Start Server
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 User site     → http://localhost:${PORT}`);
    console.log(`🛠️ Admin site   → http://localhost:${PORT}/admin`);
});
