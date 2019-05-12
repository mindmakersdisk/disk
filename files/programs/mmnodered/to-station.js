module.exports = function(RED) {
  
    const URL_BASE = "https://mindmakers.cc";
    
    console.log('##### mind-makers nodered-to-station instalado');
    
    function EstacaoIoTOutput(config) {

        RED.nodes.createNode(this,config);
        
        this.acao = config.acao;
        this.estacao = config.estacao;
        this.numero = config.numero;
        
        //console.log('entrou configurar '+this.acao+' estacao '+this.estacao);
        
        var node = this;
        
        const request = require('request');  
        var fs = require('fs');
        
        var id1;
        var id2;
        
        fs.readFile('/home/mindmakers/school.info', function(err,data) 
        {
          if (err) {
              console.log(err);
          } else {
          
              einfo = data.toString();

              id1Ini =einfo.indexOf('Cód.:')+5;
              id1 = einfo.substring(id1Ini,einfo.indexOf('||'),id1Ini).trim();

              id2Ini = einfo.indexOf('Sala:')+5
              id2 = einfo.substring(id2Ini,einfo.indexOf('||',id2Ini)).trim();
              
          }
        });
        
        node.on('input', function(msg) {
            
            if (msg.payload) {
                
                if (isNaN(msg.payload+'')) {
                    node.numero = msg.payload;
                }
            
            }
            
            var jsonMsg = {'id1':id1,'id2':id2, 
                              'acao':node.acao,'estacao':node.estacao,'numero':node.numero};
                              
            console.log('entrou para enviar msg',jsonMsg);
            
            request({url: URL_BASE+'/iot/sala/code',
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
                              console.log('Comando enviado com sucesso! ');
                        }
                    }
                );
        
        
        });

    }

    RED.nodes.registerType("to-station",EstacaoIoTOutput);

}
