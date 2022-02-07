const fs = require('fs');
const dbUrl = './database/db.json';

const read = () => {
    const jsonDb = fs.readFileSync(dbUrl);
    return JSON.parse(jsonDb);
}

const write = (data) => {
    fs.writeFileSync(dbUrl, JSON.stringify(data));
}

module.exports = {read, write};