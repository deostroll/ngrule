var fs = require('fs');
var csv2json = require('csv2json');

// var handle = fs.createReadStream('Data/customers.csv').pipe(csv2json()).pipe(fs.createWriteStream('Data/customers.json'));
//fs.createReadStream('Data/order-details.csv').pipe(csv2json()).pipe(fs.createWriteStream('Data/order-details.json'));
fs.createReadStream('Data/products.csv').pipe(csv2json()).pipe(fs.createWriteStream('Data/products.json'));
fs.createReadStream('Data/categories.csv').pipe(csv2json()).pipe(fs.createWriteStream('Data/categories.json'));
/*var customers = JSON.parse(fs.readFileSync('Data/customers.json'))
var details = JSON.parse(fs.readFileSync('Data/order-details.json'))
var orders = JSON.parse(fs.readFileSync('Data/orders.json'))

//console.log(customers[0].CustomerID);

for(var i = 0; i < customers.length; i++){

	cust = customers[i]

	cust.invoice = details.filter(0)



}*/
