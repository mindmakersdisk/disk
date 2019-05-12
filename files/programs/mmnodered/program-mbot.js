module.exports = function(RED) {
    
    const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

    console.log('##### mind-makers nodered-prog-mbot instalado');
    
    ipc.config.id = 'nodered-progr-mbot';
    ipc.config.retry= 1500;
    ipc.config.maxRetries=10;
    ipc.config.silent=false;
    
    function MbotProgramOutput(config) {
        
        RED.nodes.createNode(this,config);
        var node = this;
    
        node.status({fill:"red",shape:"ring",text:"desconectado"});
        
        console.log(config);
          
        node.on('editsave', function() {
        
              //  console.log('entrou aqui com '+ config.func);
            
            }    
        );
        

        ipc.log('##### mind-makers nodered-program-mbot configurado');
        
         ipc.connectToNet(
                    'mbot',
                    function(){
                        ipc.of.mbot.on(
                            'connect',
                            function(){
                                ipc.log('## mbot conectado##', ipc.config.delay);
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                        ipc.of.mbot.on(
                            'disconnect',
                            function(){
                                ipc.log('## mbot desconectado');
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        
                                                
                          ipc.of.mbot.on(
                            'mbot.conectado',
                            function(){
                                ipc.log('## mbot conectado');
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                        
                          ipc.of.mbot.on(
                            'mbot.desconectado',
                            function(){
                                ipc.log('## mbot desconectado');
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        
                        ipc.of.mbot.on(
                            'error.message',
                            function(data){
                                console.log('Erro: ', data.message);
                                node.status({fill:"red",shape:"ring",text:"desconectado"});
                            }
                        );
                        ipc.of.mbot.on(
                            'kill.connection',
                            function(data){
                                ipc.log('mbot  requested kill.connection');
                                ipc.disconnect('mbot');
                            }
                        );
                    }
                );
        
        
        
        node.on('input', function(msg) {
            
              console.log('nodered-prog-mbot entrou input',msg);
              console.log(config.func);
          
              node.status({fill:"green",shape:"dot",text:"conectado"});
          
              ipc.of.mbot.emit(
                                    'program.mbot.message',
                                    {
                                        id      : ipc.config.id,
                                        message : config.func
                                    }
                                );

         });
         
        node.on('start', function() {
            
              console.log('nodered-prog-mbot entrou start');

         });
    
    }
    
    
    RED.nodes.registerType("prog-mbot",MbotProgramOutput);
    
  
    
}
