module.exports = function(RED) {

  const URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";

  console.log('##### mind-makers nodered-to-ml4k-img instalado');

  function ML4KOutput(config) {

    RED.nodes.createNode(this,config);

    this.key = config.key;
    this.locationOfImg = config.locationOfImg;

    //console.log('entrou configurar '+this.acao+' estacao '+this.estacao);
    
    var node = this;

    const request = require('request');
    var fs = require('fs');

    var bitmap = fs.readFileSync(node.locationOfImg);
    //console.log('bitmap',bitmap);
    // convert binary data to base64 encoded string
    var img = new Buffer(bitmap).toString('base64');

    node.on('input', function(msg) {

      if (msg.payload) {

        if (isNaN(msg.payload+'')) {
          node.locationOfImg = msg.payload;
        }

      }


      var jsonMsg = {"data" : img};

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

RED.nodes.registerType("to-ml4k-img",ML4KOutput);

}
