const fs = require('fs');
// Initially load the db from the JSON file only once and keep it in memory
const dbFileUrl = './database/db.json';
const lineItems = require(dbFileUrl);

const getLineItems = () => {
    return {...lineItems};
}

const saveFile = () => {
    fs.writeFileSync(dbFileUrl, JSON.stringify(lineItems, null, 2));
}

// Adds a Line Item
const addOrReplaceLineItem = (uid, data) => {
    lineItems[uid] = data;
    saveFile();
}

// Removes a Line Item
const removeLineItem = (uid) => {
    delete lineItems[uid];
    saveFile();
}

// Edit a Line Item
const updateLineItem = (uid, data) => {
    if (!lineItems[uid]) throw new Error(`Can't update LineItem with UID ${uid}: UID doesn't exist.`);
    lineItems[uid] = {...lineItems[uid], ...data};
    saveFile();
}

// Adjusts the quantity of the reservedQty or the sentQty (can be negative)
const adjustQty = (uid, data) => {
    if (!lineItems[uid]) throw new Error(`Can't adjustQty of LineItem with UID ${uid}: UID doesn't exist.`);
    for (const property in data) {
        if (['reservedQty', 'sentQty'].includes(property)) {
            lineItems[uid][property] = lineItems[uid][property] + data[property];
        }
    }
    saveFile();
}

module.exports = {getLineItems, addOrReplaceLineItem, removeLineItem, updateLineItem, adjustQty};