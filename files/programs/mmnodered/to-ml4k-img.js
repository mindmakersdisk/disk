module.exports = function(RED) {

  const URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";

  console.log('##### mind-makers nodered-to-ml4k-img instalado');

  function ML4KOutput(config) {

    RED.nodes.createNode(this,config);

    this.key = config.key;
    this.locationOfImg = config.locationOfImg;
    this.key = config.key;
    this.acao = config.acao;
    this.label = config.label;

    
    let node = this;

    const request = require('request');
    var fs = require('fs');

    node.on('input', function(msg) {
      
      //TODO, validar que msg.payload começa com / e termina com .jpg ou .png

      if (isNaN(msg.payload+'')) {
        msg.payload = msg.payload.replace(/[\n\t\r]/g,"");
        //retirar \n no final da mensagem camera.sh

        if(lastMsg !=''){
           //verifica se exite uma ultima msg e substitui pela atual.
           node.locationOfImg = msg.payload;

           //console.log('lastMsg exite',msg.payload);
           
        }else if (node.locationOfImg=='') {
          
          node.locationOfImg = msg.payload;
          
          var lastMsg = msg.payload;
          //armazena a ultima mensagem para comparação.
        }

      }
      
      var bitmap = fs.readFileSync(node.locationOfImg);
      //console.log('bitmap',bitmap);
      // convert binary data to base64 encoded string
      var img = new Buffer(bitmap).toString('base64');
      
      //TODO, parar se (node.acao == 'treinar' && node.locationOfImg == '')
      
      
      node.acao = node.acao.replace(/[\n\t\r]/g,"");
      //precisa retirar para funcionar.
              

      
      if(node.acao == 'T' ){
        var jsonMsg = {"data" : img,
                       "label": node.label };
        var URL_FINAL = '/train';
      }else{
        var jsonMsg = {"data" : img};
        var URL_FINAL = '/classify';
      }
        //console.log('entrou classificar', node.label);
        //console.log('URL_FINAL ', URL_FINAL)

      //console.log('entrou para enviar msg',jsonMsg);

      request({url: URL_BASE+node.key+URL_FINAL,
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
          
          if(node.acao == 'T' ){
             var msg = {payload: 'stored: '+body.isstored+' & label: '+body.label, 
                        stored: body.isstored, 
                        label: body.label};
             
           }else{
             var msg = {payload: 'result: '+body[0].class_name+' & confidence: '+body[0].confidence+'%', 
                        result: body[0].class_name, 
                        confidence: body[0].confidence+'%'};
           }
          
          console.log('msg ',msg);
          node.send(msg);
          

        }
      }
    );

  });

}

RED.nodes.registerType("to-ml4k-img",ML4KOutput);

}
