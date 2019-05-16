module.exports = function(RED) {

  const URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";

  console.log('##### mind-makers nodered-to-ml4k-txt instalado');

  function ML4KOutput(config) {

    RED.nodes.createNode(this,config);

    this.key = config.key;
    this.phrase = config.phrase;

    //console.log('entrou configurar '+this.acao+' estacao '+this.estacao);

    var node = this;

    const request = require('request');

    node.on('input', function(msg) {

      if (msg.payload) {

        if (isNaN(msg.payload+'')) {
          node.phrase = msg.payload;
        }

      }

      //var URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";

      var jsonMsg = {"data" : node.phrase};

      //console.log('entrou para enviar msg',jsonMsg);

      request({url: URL_BASE+node.key+'/classify',
      method: 'POST',
      json: jsonMsg},
      function(error, response, body){
        //             console.log(body);
        if (error) {
          console.log('Erro ao enviar comando - erro: ',error);
          var msg = {payload:error};
          node.send(msg);
        } else if (body.error) {
          console.log('Erro ao enviar comando - corpo do erro: ',body.error);
          var msg = {payload:body.error};
          node.send(msg);
        } else {
          //console.log('body ',body);
          var msg = {payload: body[0].class_name, result: body[0].class_name, confidence: body[0].confidence+'%'};
          node.send(msg);
          console.log('Resposta: ',body[0].class_name);
          console.log('Confiança: ',+body[0].confidence,'%');

        }
      }
    );

  });

}

RED.nodes.registerType("to-ml4k-txt",ML4KOutput);

}
