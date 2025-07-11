const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const DATA_FILE = "./disks.json";

app.use(express.json());

// 静态文件服务，添加这一行
app.use(express.static(path.join(__dirname)));

app.get("/api/disks", (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) return res.json([]);
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

app.post("/api/disks", (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send("保存失败");
    res.send("保存成功");
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
