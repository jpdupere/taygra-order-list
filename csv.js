const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './output/brazil-orders.csv',
    header: [
        {id: 'title', title: 'Title'},
        {id: 'number', title: '#Order'},
        {id: 'sku', title: 'SKU'},
        {id: 'qty', title: 'Qty'},
        {id: 'firstName', title: 'First Name'},
        {id: 'lastName', title: 'Last Name'},
        {id: 'email', title: 'Email'},
        {id: 'phone', title: 'Phone'},
    ]
});

const addRecord = async ({ title, number, sku, qty, firstName, lastName, email, phone }) => {     
    console.log('writing:', title);
    await csvWriter.writeRecords([{ title, number, sku, qty, firstName, lastName, email, phone }]);
}

module.exports = { addRecord }