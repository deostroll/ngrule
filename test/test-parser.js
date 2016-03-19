var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var parser = require('../parse');

describe('parser internal logic', function(){
  it('should load rule file', function(){
    var fileActual = parser._.readRuleFile('test/rule1.txt');
    var fileExpected = fs.readFileSync('test/rule1.txt', 'utf8');
    expect(fileExpected).to.equal(fileActual);
  });

  it('should normalize rule file', function(){
    var expected = fs.readFileSync('test/rule1_normalized.txt', 'utf8');
    var fileActual = parser._.readRuleFile('test/rule1.txt');
    var actual = parser._.normalizeRuleText(fileActual);


    [].slice.call(actual).forEach(function(ch, i){

      expect(ch).to.equal(expected[i]);
    });
    // expect(actual).to.equal(expected);
  });

  describe('parsing expression', function(){
    //TODO: should test if ast is null
    it('should parse simple property reference expression (Unit expression)', function(){
      //var tokens = ['Order.Discount', '+', '100'];
      var token = 'Order.Discount';
      var expectedAst = {
        type: 'PropertyReferenceExpression',
        target: {
          type:'Entity',
          name: 'Order'
        },
        propertyName: 'Discount'
      };
      var actualAst = parser._.parseUnitExpression(token);
      expect(expectedAst).to.deep.equal(actualAst);
      // console.log(expectedAst);
    });

    it('should parse a Compound Binary Expression', function(){
      var exp = "OrderDetail.ProductName == \"Prod1\" _AND_ OrderDetail.ProductName == \"Prod2\"".split(' ');
      var actual = parser._.parseCompoundExpression(exp);
      var expected = {
        type: 'BinaryExpression',
      	op: '_AND_',
      	left: {
      		  type: 'BinaryExpression',
      			op: '==',
      			left: {
      				type: 'PropertyReferenceExpression',
      				// value: 'OrderDetail.ProductName'
              target: {
                type: 'Entity',
                name: 'OrderDetail'
              },
              propertyName: 'ProductName'
      			},
      			right: {
      				type: 'PrimitiveReferenceExpression',
      				value: 'Prod1',
      				valueType: 'TEXT'
      			}
      		}
      	,
      	right:{
          type: 'BinaryExpression',
          op: '==',
          left: {
            type: 'PropertyReferenceExpression',
            // value: 'OrderDetail.ProductName'
            target: {
              type: 'Entity',
              name: 'OrderDetail'
            },
            propertyName: 'ProductName'
          },
          right: {
            type: 'PrimitiveReferenceExpression',
            value: 'Prod2',
            valueType: 'TEXT'
          }
      	}
      };
      // console.log({
      //   expected: JSON.stringify(expected, null, 2),
      //   actual: JSON.stringify(actual, null, 2)
      // });
      // console.log('expected:', expected);
      // console.log('actual:', actual);

      expect(expected).to.deep.equal(actual);
    });
  })
});
