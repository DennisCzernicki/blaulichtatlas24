import express from "express"; // falls du ES Modules nutzt
// const express = require("express"); // falls CommonJS

const app = express();
const PORT = 3000;

// Middleware, um JSON zu parsen
app.use(express.json());

// Beispiel-Route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
