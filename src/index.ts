import "dotenv/config";

import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(201).json({
        message: "Working",
    });
});

app.listen(PORT, () => {
    console.log(`Your app is listening in http://localhost:${PORT}`);
});
