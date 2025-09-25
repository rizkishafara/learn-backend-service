const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
// gunakan env atau ubah sesuai kredensial
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "8080";
const DB_NAME = process.env.DB_NAME || "backend_lab";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
let pool;
(async () => {
  pool = await mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    connectionLimit: 5,
  });
})();
app.get("/", (req, res) => {
  res.json({ message: "Halo dari Node.js + MySQL" });
});
app.post("/products", express.json(), async (req, res) => {
  try {
    const { nama, harga } = req.body;
    const [result] = await pool.query(
      "INSERT INTO products (nama, harga) VALUES (?, ?)",
      [nama, harga]
    );
    res.status(201).json({ id: result.insertId, nama, harga });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nama, harga FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, harga FROM products WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/products/:id", express.json(), async (req, res) => {
  try {
    const { nama, harga } = req.body;
    const [result] = await pool.query(
      "UPDATE products SET nama = ?, harga = ? WHERE id = ?",
      [nama, harga, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ id: parseInt(req.params.id), nama, harga });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/products/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.listen(3000, () => console.log("Server Node.js di http://localhost:3000"));
