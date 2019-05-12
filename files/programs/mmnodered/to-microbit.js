module.exports = function(RED) {

    const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

    console.log('##### mind-makers nodered-to-microbit instalado');
    
    ipc.config.id = 'nodered-to-microbit';
    ipc.config.retry= 1500;
    ipc.config.maxRetries=10;
    ipc.config.silent=true;
    
    function MicrobitBLEOutput(config) {
        
        RED.nodes.createNode(this,config);
        
        this.acao = config.acao;
        this.indiceFiguraLED = config.indiceFiguraLED;
        this.textoLED = config.textoLED;
        this.pinId = config.pinId;
        this.pinValor = config.pinValor;        
        
        var node = this;
        
        node.status({fill:"red",shape:"ring",text:"desconectado"});

        ipc.log('##### mind-makers nodered-to-microbit configurado');
        
         ipc.connectToNet(
                    'microbit',
                    function(){
                        ipc.of.microbit.on(
                            'connect',
                            function(){
                                ipc.log('## microbit conectado##', ipc.config.delay);
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                        ipc.of.microbit.on(
                            'disconnect',
                            function(){
                                ipc.log('## microbit desconectado');
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        
                                                
                          ipc.of.microbit.on(
                            'microbit.conectado',
                            function(){
                                ipc.log('## microbit conectado');
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                        
                          ipc.of.microbit.on(
                            'microbit.desconectado',
                            function(){
                                ipc.log('## microbit desconectado');
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        
                        ipc.of.microbit.on(
                            'error.message',
                            function(data){
                                console.log('Erro: ', data.message);
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        ipc.of.microbit.on(
                            'kill.connection',
                            function(data){
                                ipc.log('microbit requested kill.connection');
                                ipc.disconnect('microbit');
                            }
                        );
                    }
                );
        
        
        const ACAO_PIN="PIN";
        const ACAO_TEXTO="TEXTO";
        const ACAO_FIGURA="FIGURA"; 
        
        /*
         * Recebe valores dinamicamente ou estático no form, priorizando o dinamico 
         */
        node.on('input', function(msg) {
            
              console.log('nodered-to-microbit entrou input',msg);
          
              node.status({fill:"green",shape:"dot",text:"conectado"});
              
              let mensagem;
              
              if (node.acao==ACAO_PIN) {
                  
                  let valorPino = node.pinValor;
                  
                   // se recebe parametro string que é um numero valido, sempre converte para numerico
                  if (msg != null && msg.payload != undefined ) {
                      
                      if ((typeof msg.payload === 'string' || msg.payload instanceof String)
                           && parseInt(msg.payload)!= NaN)
                          valorPino=parseInt(msg.payload);
                      else if (parseInt(msg.payload)!= NaN && parseInt(msg.payload)>=0 && parseInt(msg.payload)<=1)
                          valorPino=msg.payload; 
                    
                   }
                  
                  mensagem = {acao:node.acao, pinId:node.pinId, pinValor:valorPino}
              
              } else if (node.acao==ACAO_TEXTO) {
                           
                  let textoArg = node.textoLED;
                  
                   // se recebe parametro string valido ele é prioridade
                  if (msg != null && msg.payload != undefined &&
                     (typeof msg.payload === 'string' || msg.payload instanceof String))
                          textoArg=msg.payload; 
                  
                  mensagem = {acao:node.acao, textoLED: textoArg}
              
              } else if  (node.acao==ACAO_FIGURA) {
                                    
                  let figuraIndiceArg=9;
                  
                   if (node.indiceFiguraLED != undefined && node.indiceFiguraLED != null && parseInt(node.indiceFiguraLED)!= NaN) {
                        figuraIndiceArg=parseInt(node.indiceFiguraLED);
                   }
                  
                   // se recebe parametro string que é um numero valido, sempre converte para numerico
                  if (msg != null && msg.payload != undefined ) {
                      
                      if ((typeof msg.payload === 'string' || msg.payload instanceof String)
                           && parseInt(msg.payload)!= NaN)
                          figuraIndiceArg=parseInt(msg.payload);
                      else if (parseInt(msg.payload)!= NaN && parseInt(msg.payload)>=0 && parseInt(msg.payload)<=8)
                          figuraIndiceArg=msg.payload; 
                    
                   }
                  
                  mensagem = {acao:node.acao, indiceFiguraLED:figuraIndiceArg};
                  
                   console.log('mensagem: ',mensagem);
              
              } 
          
              ipc.of.microbit.emit(
                                    'to.microbit.message',
                                    {
                                        id      : ipc.config.id,
                                        message : mensagem
                                    }
                                );

         });
        
    }
    
    RED.nodes.registerType("to-microbit",MicrobitBLEOutput);

}
