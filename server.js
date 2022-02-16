const { getLineItems, adjustQty, updateLineItem } = require('./db.js');
require('./update-data');
const express = require('express');
const app = express();
const port = process.env.PORT || 80;

app.use(express.static("client/build"));

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
            imgSrc: order.imgSrc,
            note: order.note
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
    if (!data) {
        return res.status(400).send();
    }
    if (data.reservedQty || data.sentQty) {
        adjustQty(uid, data);
    } else if (Object.keys(data).includes('note')) {
        updateLineItem(uid, {note: data.note});
    } else {
        return res.status(400).send();
    }
    
    res.status(200).send();
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});