// parse.js
var fs = require('fs');
var assert = require('assert');
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
      //i++; //skip to next token
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
      ruleAst.push(parseOneRule(oneRule));
      oneRule = [];
    }
  }
  return ruleAst;
}

function parseOneRule(oneRule) {
  var ast = {
    condition:null,
    thenStatements: [],
    name: null
  };
  if(oneRule.indexOf('RULE',1) !== -1) {
    throw new Error('Invalid rule defition - no ENDRULE found:' + oneRule[1]);
  }

  var ruleName = oneRule[1].replace(/"/g, '');
  ast.name = ruleName;
  // console.log(oneRule.slice(0,4))
  if(oneRule[2] !== 'IF') {
    throw new Error('No IF statement found');
  }
  var indexOfThen = oneRule.indexOf('THEN');
  var ifExpressionTokens = oneRule.slice(3, indexOfThen);
  if(ifExpressionTokens.length > 3) {
    ast.condition = parseCompoundExpression(ifExpressionTokens);
  }
  else if(ifExpressionTokens.length === 3) {
    ast.condition = parseUnitBinaryExpression(ifExpressionTokens);
  }
  else {
    ast.condition = parseUnitExpression(ifExpressionTokens[0]);
  }
  var statementCount = oneRule.slice(indexOfThen).reduce(function(a, tkn){
    return a + tkn == ';'? 1 : 0;
  });

  if (statementCount > 1) {
    //TODO: parse multiple statements
  }
  else {
    //parse only the one statement
    var indexOfSemiColon = oneRule.indexOf(';');
    var statementTokens = oneRule.slice(indexOfThen +1, indexOfSemiColon);
    assert(statementTokens.indexOf(';') === -1, 'should not contain semicolon');
    ast.thenStatements.push(parseStatement(statementTokens));
  }
  return ast;
}

function parseUnitExpression(token) {
  // console.log('ue:', token);
  var ast = null;
  var rgx_number = /^(\d+|(\d+\.\d+))$/g;
  if(token[0] === '"') {
    if(token[token.length - 1] !== '"') {
      throw new Error('Invalid string termination')
    }
    //String
    ast = {
      type: 'PrimitiveReferenceExpression',
      value: token.replace(/"/g, ''),
      valueType: 'TEXT'
    }
  }
  else if(rgx_number.test(token)){
    ast = {
      type: 'PrimitiveReferenceExpression',
      value: token+'',
      valueType: token.indexOf('.') > -1 ? 'FLOAT' : 'INT'
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
      // console.log('SimplePropRef:', token);
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
    type: 'BinaryExpression',
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
  // console.log('input:',tokens);
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
    // console.log('tokens:', tokens);
    // console.log('idx:', idx);
    // console.log('left:', leftTokens);
    var rightTokens = tokens.slice(idx+1);
    // console.log('right:', rightTokens);
    if(leftTokens.length > 3){
      ast.left = parseCompoundExpression(leftTokens);
    }
    else if(leftTokens.length === 3){
      ast.left = parseUnitBinaryExpression(leftTokens);
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
    idx = tokens.indexOf('==');
    ast.op = '==';
    var leftTokens = tokens.slice(0, idx);
    var rightTokens = tokens.slice(idx + 1);
    if(leftTokens.length > 3) {
      ast.left = parseCompoundExpression(leftTokens);
    }
    else if (leftTokens.length === 3) {
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

function parseStatement(tokens) {
    var idxOfEquals = tokens.indexOf('=');
    var leftTokens = tokens.slice(0, idxOfEquals)
    //console.log('statements:',tokens)
    // assert(leftTokens.length === 1, 'left should always be one token');
    leftTokens
    var ast =
      {
        type: 'AssignmentStatement',
        left: null,
        right: null,
      };

    ast.left = parseUnitExpression(leftTokens[0]);
    var rightTokens = tokens.slice(idxOfEquals + 1);
    // console.log(rightTokens);
    if(rightTokens.length > 3) {
      ast.right = parseCompoundExpression(rightTokens);
    }
    else if (rightTokens.length === 3) {
      ast.right = parseUnitBinaryExpression(rightTokens);
    }
    else {
      // assert(rightTokens.length !== 1, 'invalid length for unit expression');
      // console.log('rt:',rightTokens);
      ast.right = parseUnitExpression(rightTokens[0]);
    }
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
function generateCode(astArray){
    var code = '';
    astArray.forEach(function(ast){
      code += codeFromAst(ast) + '\r\n\r\n';
    });
    return code;
}

function codeFromAst(ast) {
  var recurse = function(node){
    var result = null;
    switch(node.type) {
      case 'BinaryExpression':
        var op = node.op == '_AND_' ? '&&' : '||';
        var left = recurse(node.left);
        var right = recurse(node.right);
        result = '(' + left + ' ' + op + ' ' + right + ')'
        break;
      case 'PrimitiveReferenceExpression':
        result = node.valueType == 'TEXT' ? ('"' + node.value + '"'): node.value;
        break;
      case 'PropertyReferenceExpression':
        result = node.target.name + '.' + node.propertyName;
        break;
      case 'AssignmentStatement':
        var left = recurse(node.left);
        var right = recurse(node.right);
        result = left + ' = ' + right;
        break;
    }
    return result;
  };

  var condition = recurse(ast.condition);
  var statements = ast.thenStatements.map(recurse);
  return 'if(' + condition + '){\r\n'
    + statements.map(function(st) { return '\t' + st; }).join(';\r\n')
    + ';\r\n}';
}

function makeEngine(schema, code) {
  var participantEntities = schema.filter(function(entity){
    return entity.fields.filter(function(field){
      return field.type.indexOf('ARRAY') === 0;
    }).length == 1;
  });

  var ast = {
    type: 'MethodInvokeExpression',
    target: 'data',
    method: 'forEach',
    args:[]
  };

  var heirarchy = ['Customer', 'Order', 'OrderDetail'];
  var funcObj = null;

  for(var i = heirarchy.length - 1; i > -1; i--) {
    var entity = heirarchy[i];
    if(i === heirarchy.length - 1) {
      funcObj = {
        type: 'FunctionExpression',
        args:[
        {type: 'VariableReference',
        name: entity}
        ],
        statements: [
          {
            type: 'MethodInvokeExpression',
            target: 'rules',
            methodName: 'execute',
            args: heirarchy.map(function(h){return {type:'VariableReference', name: h}})
          }
        ]
      }
    }
    funcObj = {
      type: 'FunctionExpression',
      args:[
        {type: 'VariableReference',
        name: entity}
      ],
      statements: [
        {
          type: 'MethodInvokeExpression',
          target: {
            type: 'PropertyReferenceExpression',
            name: entity + 's'
          },
          methodName: 'forEach',
          args: [funcObj]
        }
      ]
    };
  }

  ast.args = [funcObj];

  heirarchy.push(code);
  var rules = {};
  rules.execute = Function.apply({}, heirarchy);

  //generate code

  return [function (data, rules) {
    data.forEach(function(Customer){
      Customer.Orders.forEach(function(Order){
        Order.OrderDetails.forEach(function(OrderDetail){
          rules.execute(Customer, Order, OrderDetail);
        });
      });
    });
  }, rules];
}

module.exports = {
  _ : {
    normalizeRuleText: normalizeRuleText,
    readRuleFile: readRuleFile,
    parseUnitExpression: parseUnitExpression,
    parseCompoundExpression: parseCompoundExpression,
    parseStatement: parseStatement,
    parseOneRule: parseOneRule,
    parseRuleText: parseRuleText
  },
  makeRulesAst: function(rulesFile, schema) {
    var a1 = readRuleFile(rulesFile);
    var a2 = normalizeRuleText(a1);
    return parseRuleText(a2);
  },
  generateCode: generateCode,
  makeEngine: makeEngine
};
