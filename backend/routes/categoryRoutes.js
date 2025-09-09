const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../utils/db"); // MySQL pool
const router = express.Router();

// Ensure upload directory exists
const uploadPath = path.join(__dirname, "../../public/categories");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// 🔹 Admin: Add new category
router.post("/", upload.single("icon"), async (req, res) => {
    try {
        let { name, sale, data_item } = req.body;

        if (!name || !req.file) {
            return res.status(400).json({ message: "Name and icon are required!" });
        }

        // Default data_item if not provided
        if (!data_item || data_item.trim() === "") {
            data_item = name.toLowerCase().replace(/\s+/g, "-");
        }

        const icon = req.file.filename;

        await pool.query(
            "INSERT INTO categories (name, data_item, icon, sale) VALUES (?, ?, ?, ?)",
            [name, data_item, icon, sale || 0]
        );

        res.json({
            message: "Category added successfully!",
            data: { name, data_item, icon, sale: sale || 0 },
        });
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ message: "Failed to add category", error: err.message });
    }
});

// 🔹 Admin: Get all categories (for admin dashboard)
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch categories", error: err.message });
    }
});

// 🔹 Public: Get categories with product count
router.get("/public", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id, c.name, c.data_item, c.icon, c.sale, c.created_at, COUNT(p.id) AS count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        const formatted = rows.map(cat => ({
            id: cat.id,
            name: cat.name,
            dataItem: cat.data_item,
            icon: cat.icon ? `/uploads/categories/${cat.icon}` : null,
            sale: cat.sale || 0,
            count: cat.count || 0,
            createdAt: cat.created_at,
            slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch categories", error: err.message });
    }
});

// 🔹 Admin: Delete category
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete category", error: err.message });
    }
});

module.exports = router;
