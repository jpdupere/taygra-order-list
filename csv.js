const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let csvWriter;

const resetCSVFile = () => {
    csvWriter = createCsvWriter({
        path: './csv/brazil-orders.csv',
        header: [
            {id: 'number', title: '#Order'},
            {id: 'sku', title: 'SKU'},
            {id: 'qty', title: 'Qty'},
            {id: 'firstName', title: 'First Name'},
            {id: 'lastName', title: 'Last Name'},
            {id: 'email', title: 'Email'},
            {id: 'phone', title: 'Phone'},
        ]
    });
}

const addRecord = async ({ number, sku, qty, firstName, lastName, email, phone }) => {     
    await csvWriter.writeRecords([{ number, sku, qty, firstName, lastName, email, phone }]);
}

module.exports = { addRecord, resetCSVFile }