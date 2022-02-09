const db = require('./db.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/backend', (req, res) => {
    res.send('Backend connected to React');
});

app.get('/line-items', (req, res) => {
    const data = Object.entries(db.read());
    res.json(db.read());
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});