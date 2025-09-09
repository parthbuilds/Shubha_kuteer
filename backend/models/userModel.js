// models/userModel.js
const db = require("../db");

const createUser = (name, email, password_hash, callback) => {
    const sql = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password_hash], callback);
};

const findByEmail = (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
};

module.exports = { createUser, findByEmail };
