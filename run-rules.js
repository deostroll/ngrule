var fs = require('fs');
var parser = require('./parse');
var dataFile ='mydata.json'; //process.argv[process.argv.indexOf('-d') + 1]
var schemaFile = 'schema.json'; //process.argv[process.argv.indexOf('-s') + 1]
var rulesFile = 'test/rule2.txt'; //process.argv[process.argv.indexOf('-r') + 1]

function readJSON(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

var schema = readJSON(schemaFile);
var data = readJSON(dataFile);
var rules = parser.makeRulesAst(rulesFile, schema);
var ruleCode = parser.generateCode(rules);
var result = parser.makeEngine(schema, ruleCode);

var engine = result[0], rulesObj = result[1];

//run the bloody engine...
console.log('before')
console.log(JSON.stringify(data, null, 2))
engine(data, rulesObj);
console.log('after')
console.log(JSON.stringify(data, null, 2))
// node run-engine.js -d data.json -s schema.json -r rules.txt
