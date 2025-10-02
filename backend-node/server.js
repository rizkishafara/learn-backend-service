const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
app.use(express.json());
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
app.post("/products", async (req, res) => {
  const { nama, harga } = req.body;
  const [r] = await pool.execute(
    "INSERT INTO products(nama,harga) VALUES (?,?)",
    [nama, harga]
  );
  res.status(201).json({ id: r.insertId, nama, harga });
});

app.get("/products", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM products");
  res.json(rows);
});
app.get("/products/:id", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM products WHERE id=?", [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});
app.put("/products/:id", async (req, res) => {
  const { nama, harga } = req.body;
  await pool.execute("UPDATE products SET nama=?, harga=? WHERE id=?", [
    nama,
    harga,
    req.params.id,
  ]);
  const [rows] = await pool.execute("SELECT * FROM products WHERE id=?", [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

app.delete("/products/:id", async (req, res) => {
  await pool.execute("DELETE FROM products WHERE id=?", [req.params.id]);
  res.status(204).end();
});

app.listen(3000, () => console.log("Server Node.js di http://localhost:3000"));
