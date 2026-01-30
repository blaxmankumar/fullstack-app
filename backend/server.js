require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "admin",
  host: "db",
  database: "portfolio",
  password: "password",
  port: 5432,
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users(username,password) VALUES($1,$2)", [username, hashed]);
  res.json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
  if (result.rows.length === 0) return res.status(401).json({ message: "Invalid" });

  const valid = await bcrypt.compare(password, result.rows[0].password);
  if (!valid) return res.status(401).json({ message: "Invalid" });

  const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

app.get("/portfolio", (req, res) => {
  res.json({ message: "Welcome to my Portfolio Dashboard 🚀" });
});

app.listen(5000, () => console.log("Server running"));
