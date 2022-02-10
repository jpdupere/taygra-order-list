const { getLineItems, adjustQty } = require('./db.js');
require('./update-data');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/backend', (req, res) => {
    res.send('Backend connected to React');
});

app.get('/line-items', (req, res) => {
    const data = Object.entries(getLineItems()).map(([uid, order]) => {
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
        return res.status(400).send();
    }
    const data = req.body;
    if (!data.reservedQty && !data.sentQty) {
        return res.status(400).send();
    }
    adjustQty(uid, data);
    res.status(200).send();
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});