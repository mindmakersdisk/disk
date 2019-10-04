module.exports = function(RED) {

  const URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";

  console.log('##### mind-makers nodered-to-ml4k-txt instalado');

  function ML4KOutput(config) {

    RED.nodes.createNode(this, config);

    this.key = config.key;
    this.phrase = config.phrase;
    this.acao = config.acao;
    this.label = config.label;

    //console.log('entrou configurar '+this.acao+' estacao '+this.estacao);

    var node = this;

    const request = require('request');

    node.on('input', function(msg) {

      if (isNaN(msg.payload + '')) {

        if (lastMsg != '') {
          //verifica se exite uma última msg e substitui pela atual.

          node.phrase = msg.payload;
          //console.log('lastMsg exite',msg.payload);
        } else if (node.phrase == '') {
          node.phrase = msg.payload;

          //armazena a última mensagem para comparação.
          var lastMsg = msg.payload;
        }

      }

      node.acao = node.acao.replace(/[\n\t\r]/g, "");

      if (node.acao == 'T') {
        var jsonMsg = {
          "data": node.phrase,
          "label": node.label
        };
        var URL_FINAL = '/train';
      } else {
        var jsonMsg = {
          "data": node.phrase
        };
        var URL_FINAL = '/classify';
      }


      //console.log('entrou para enviar msg',jsonMsg);

      request({
          url: URL_BASE + node.key + URL_FINAL,
          method: 'POST',
          json: jsonMsg
        },
        function(error, response, body) {
          //             console.log(body);
          if (error) {
            console.log('Erro ao enviar comando - erro: ', error);
            var msg = {
              payload: error
            };
            node.send(msg);
          } else if (body.error) {
            console.log('Erro ao enviar comando - corpo do erro: ', body.error);
            var msg = {
              payload: body.error
            };
            node.send(msg);
          } else {
            //console.log('body ',body);

            if (node.acao == 'T') {
              var msg = {
                payload: 'textdata: ' + body.textdata + ' & label: ' + body.label,
                textdata: body.textdata,
                label: body.label
              };
            } else {
              var msg = {
                payload: 'result: ' + body[0].class_name + ' & confidence: ' + body[0].confidence + '%',
                result: body[0].class_name,
                confidence: body[0].confidence + '%'
              };
            }

            console.log('msg ', msg);
            node.send(msg);


          }
        }
      );

    });

  }

  RED.nodes.registerType("to-ml4k-txt", ML4KOutput);

}
