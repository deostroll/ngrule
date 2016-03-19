// parse.js
var fs = require('fs');

// get rule file contents
function readRuleFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function parseRuleText(ruleText) {
  var rule = normalizeRuleText(ruleText);
  var ruleAst = [];
  for(var i = 0; tokens = rule.split(' '); i < tokens.length; i++){
    var token = tokens[i];
    if(token == 'RULE') {
      var oneRule = [];
      var hasEnded = false;
      i++; //skip to next token
      do {
        token = tokens[i];
        // hasEnd = (token === 'ENDRULE');
        // if (!hasEnd) { oneRule.push(token); } //we skip the last token
        oneRule.push(token);
        i++;
      }
      while(i < tokens.length && token !== 'ENDRULE');
      if(token !== 'ENDRULE'){
        throw new Error('Invalid rule defition - no ENDRULE found:' + oneRule[1]);
      }
    }
  }
}

function parseOneRule(oneRule) {
  if(oneRule.indexOf('RULE') !== -1) {
    throw new Error('Invalid rule defition - no ENDRULE found:' + oneRule[1]);
  }
}

function parseUnitExpression(tokens) {

  var ast = {
    left: null,
    right: null,
    op: null
  };

  var operand = tokens[1];
  ast.op = operand;
  ast.left = tokens[0];
  ast.right = tokens[2];

  return ast;
}


function normalizeRuleText(ruleText) {
  return ruleText
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/;/g, ' ; ')
    .replace(/\t+/g, '')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s$/, '')
    .replace(/^\s/, '')
}

module.exports = {
  _ : {
    normalizeRuleText: normalizeRuleText,
    readRuleFile: readRuleFile
  }
}
