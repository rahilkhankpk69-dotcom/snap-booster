const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/save", (req, res) => {
  const { username, password } = req.body;

  let users = [];

  if (fs.existsSync("users.json")) {
    users = JSON.parse(fs.readFileSync("users.json"));
  }

  users.push({ username, password });

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.send("Data saved successfully!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
