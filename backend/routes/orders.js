// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const pool = require("../utils/db");
require("dotenv").config();

// Razorpay Instance (Test Mode)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================
// 🔹 Create Razorpay Order
// =====================
router.post("/create-order", async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        region,
        city,
        apartment,
        country,
        postal_code,
        note,
        amount, // rupees
    } = req.body;

    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, error: "Invalid amount" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
            payment_capture: 1,
        });

        // Insert pending order into DB
        const [result] = await pool.query(
            `INSERT INTO orders 
       (first_name, last_name, email, phone_number, region, city, apartment, country, postal_code, note, payment_method, payment_status, razorpay_order_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Razorpay', 'pending', ?)`,
            [
                first_name,
                last_name,
                email,
                phone_number,
                region,
                city,
                apartment,
                country,
                postal_code,
                note,
                razorpayOrder.id,
            ]
        );

        res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            razorpay_order: razorpayOrder,
            order_id: result.insertId,
        });
    } catch (err) {
        console.error("❌ Error creating Razorpay order:", err);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});

// =====================
// 🔹 Capture Payment
// =====================
router.post("/capture-order", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, payment_status } = req.body;

    try {
        await pool.query(
            `UPDATE orders 
       SET payment_status = ?, razorpay_payment_id = ? 
       WHERE razorpay_order_id = ?`,
            [payment_status, razorpay_payment_id, razorpay_order_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error capturing Razorpay order:", err);
        res.status(500).json({ success: false, error: "Failed to capture order" });
    }
});

module.exports = router;
