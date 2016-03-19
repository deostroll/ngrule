var fs = require('fs');
var csv2json = require('csv2json');

// var handle = fs.createReadStream('Data/customers.csv').pipe(csv2json()).pipe(fs.createWriteStream('Data/customers.json'));

var customers = JSON.parse(fs.readFileSync('Data/customers.json'))

console.log(customers[0].CustomerID);
