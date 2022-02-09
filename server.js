const db = require('./db.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/backend', (req, res) => {
    res.send('Backend connected to React');
});

app.get('/line-items', (req, res) => {
    const data = Object.entries(db.read()).map(([uid, order]) => {
        return {
            uid, 
            number: order.number,
            sku: order.sku,
            title: order.title,
            qty: order.qty,
            reservedQty: order.reservedQty,
            sentQty: order.sentQty,
            imgSrc: order.imgSrc
        };
    });
    res.json(data);
});

app.use(express.json());

app.post('/line-items/:uid', (req, res) => {
    const uid = req.params.uid;
    if (!uid) {
        res.status(400).send();
    }
    const qty = req.body;
    if (qty !== 1) {
        res.status(400).send();
    }
    // Update the db file
    

    res.status(500).send();
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});