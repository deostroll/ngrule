// parse.js
var fs = require('fs');

// get rule file contents
function readRuleFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function parseRuleText(ruleText) {
  var rule = normalizeRuleText(ruleText);
  var ruleAst = [];
  for(var i = 0, tokens = rule.split(' '); i < tokens.length; i++){
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

function parseUnitExpression(token) {
  // console.log(token)

  var ast = null;
  if(token[0] === '"') {
    if(token[token.length - 1] !== '"') {
      throw new Error('Invalid string termination')
    }

  }
  else {
    if([].slice.call(token).reduce(function(a, ch){
      return a + ch === '.'? 1 : 0;
    }) > 1) {
      //Nest property reference
    }
    else {
      //simple property reference
      ast = {
        type: 'PropertyReferenceExpression',
        target: {
          type: 'Entity',
          name: token.split('.')[0]
        },
        propertyName: token.split('.')[1]
      }
    }
  }

  return ast;
}

function parseUnitBinaryExpression(tokens){
  var ast = {
    type: 'BinaryExpression'
    op: null,
    left: null,
    right: null
  };

  ast.op = tokens[1];
  ast.left = parseUnitExpression(tokens[0]);
  ast.right = parseUnitExpression(tokens[2]);
  return ast;
}

function parseCompoundExpression(tokens) {
  var ast = {
    type: 'BinaryExpression',
    op: null,
    left: null,
    right: null
  };

  //TODO: handle other BOOLEAN operands
  var idx = tokens.indexOf('_AND_');
  if(idx > -1) {
    ast.op = '_AND_';
    var leftTokens = tokens.slice(0, idx);
    var rightTokens = tokens.slice(idx + 1);
    if(leftTokens.length > 3){
      ast.left = parseCompoundExpression(leftTokens);
    }
    else if(leftTokens.length == 3){
      ast.left = parseUnitBinaryExpression(leftTokens[0]);
    }
    else {
      ast.left = parseUnitExpression(leftTokens[0]);
    }

    if (rightTokens.length > 3) {
      ast.right = parseCompoundExpression(rightTokens)
    }
    else if (rightTokens.length == 3) {
      ast.right = parseUnitBinaryExpression(rightTokens);
    }
    else {
      ast.right = parseUnitExpression(rightTokens[0]);
    }
  }
  else {
    //TODO: handle other arithemetic operators
    idx = tokens.indexOf('+');
    ast.op = '+';
    var leftTokens = tokens.slice(0, idx);
    var rightTokens = tokens.slice(idx + 1);
    if(leftTokens.length > 3) {
      ast.left = parseCompoundExpression(leftTokens);
    }
    else if (leftTokens.length === 3){
      ast.left = parseUnitBinaryExpression(leftTokens);
    }
    else {
      ast.left = parseUnitExpression(leftTokens[0]);
    }

    if(rightTokens.length > 3) {
      ast.right = parseCompoundExpression(rightTokens);
    }
    else if (rightTokens.length === 3){
      ast.right = parseUnitBinaryExpression(rightTokens);
    }
    else {
      ast.right = parseUnitExpression(rightTokens[0]);
    }
  }

  return ast;
}

function

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
    readRuleFile: readRuleFile,
    parseUnitExpression: parseUnitExpression
  }
}
