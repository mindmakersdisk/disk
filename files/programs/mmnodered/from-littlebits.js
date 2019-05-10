module.exports = function(RED) {
    
    const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

    console.log('##### mind-makers nodered-from-littlebits instalado');
    
    ipc.config.id = 'nodered-from-littlebits';
    ipc.config.retry= 1500;
    ipc.config.maxRetries=10;
    ipc.config.silent=true;
    
    
    // Mantém último valor recebido
    let valor;
    
    
    function LittleBitsBLEInput(config) {
        
        // Códigos padrões Node-red
        RED.nodes.createNode(this,config);
        var node = this;
        node.status({fill:"red",shape:"ring",text:"desconectado"});
        
        ipc.log('##### mind-makers nodered-from-littlebits configurado');
              
            ipc.connectToNet(
                'littlebits',
                function(){
                    
                    ipc.of.littlebits.on(
                        'connect',
                        function(){
                            ipc.log('## Conectado a littlebits ##', ipc.config.delay);
                            node.status({fill:"green",shape:"dot",text:"conectado"});
                        }
                    );
                    
                    ipc.of.littlebits.on(
                        'disconnect',
                        function(){
                            node.status({fill:"red",shape:"ring",text:"desconectado"});
                            ipc.log('## Desconectado de littlebits');
                        }
                    );
                    
                   ipc.of.littlebits.on(
                        'littlebits.desconectado',
                        function(){
                            ipc.log('## littlebits desconectado');
                            node.status({fill:"red",shape:"ring",text:"desconectado"});
                        }
                    );
                    
                     ipc.of.littlebits.on(
                            'littlebits.conectado',
                            function(){
                                ipc.log('## littlebits conectado');
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                    
                    ipc.of.littlebits.on(
                        'littlebits.message',
                        function(data){
                            ipc.log('Recebeu uma mensagem de littlebits : ', data.message);
                            node.status({fill:"green",shape:"dot",text:"conectado"});
                            // Apenas repassa
                            if (data.message != valor) {
                                valor = parseInt(data.message);
                                var msg = {payload:valor};
                                node.send(msg);
                            }
                        }
                    );
                    
                    ipc.of.littlebits.on(
                        'kill.connection',
                        function(data){
                            ipc.log('littlebits requisitou kill.connection');
                            ipc.disconnect('littlebits');
                        }
                    );
          
          });

        
        

        // Códigos utilizam IoC a partir desses eventos
        node.on("output", function(value) {
            
           //console.log('nodered-from-littlebits entrou output');
             //node.send(data.message);
              
         });
         
        // Ver se precisa de algo no fechamento
        node.on("close", function(value) {

            // fecha conexão com outro node.js

         });
    
    }
    
    RED.nodes.registerType("from-littlebits",LittleBitsBLEInput);

}
