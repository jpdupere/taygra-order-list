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
});

app.get('/emails', (req, res) => {
    const data = Object.entries(getLineItems()).map(([uid, order]) => {
        return {
            number: order.number,
            sentQty: order.sentQty,
            firstName: order.firstName,
            lastName: order.lastName,
            email: order.email,
            phone: order.phone
        };
    }).reduce((acc, curr) => {
        if (curr.sentQty > 0) {
            const index = acc.findIndex(elem => elem.email === curr.email);
            if (index >= 0) {
                // element email is already in the list
                acc[index].sentQty += curr.sentQty;
            } else {
                // element email is not yet in the list
                return [...acc, curr];
            }
        }
        return acc;
    }, []);

    const replacer = (key, value) => value === null ? null : value // specify how you want to handle null values here
    const header = Object.keys(data[0])
    const csv = [
    header.join(','), // header row first
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    res.send(csv);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});