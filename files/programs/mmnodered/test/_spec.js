var should = require("should");
var helper = require("node-red-test-helper");
var lowerNode = require("../mm-littlebits.js");

describe('mm-littlebits Node', function() {

  afterEach(function() {
    helper.unload();
  });

  it('deve ser carregado', function(done) {
    var flow = [{
      id: "n1",
      type: "mm-littlebits",
      name: "testa nome"
    }];
    helper.load(lowerNode, flow, function() {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'testa nome');
      done();
    });
  });

  it('deve receber uma mensagem', function(done) {
    var flow = [{
        id: "n1",
        type: "mm-littlebits",
        name: "testa nome",
        wires: [
          ["n2"]
        ]
      },
      {
        id: "n2",
        type: "helper"
      }
    ];
    helper.load(lowerNode, flow, function() {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function(msg) {
        msg.should.have.property('payload', 'uppercase');
        done();
      });
      n1.receive({
        payload: "UpperCase"
      });
    });
  });
});
