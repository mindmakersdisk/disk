module.exports = function(RED) {
    
    const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

    console.log('##### mind-makers nodered-from-microbit instalado');
    
    ipc.config.id = 'nodered-from-microbit';
    ipc.config.retry= 1500;
    ipc.config.maxRetries=10;
    ipc.config.silent=true;
    ipc.config.delay=3000;
    
    const ACAO_BOTAOA="A";
    const ACAO_BOTAOB="B";    
    const ACAO_ACELER="ACELER";   
    const ACAO_MAG="MAG";   
    const ACAO_MAGBEAR="MAGBEAR";   
    const ACAO_TEMP="TEMP";   
    const ACAO_PIN="PIN";   
    
    // Mantém último valor recebido
    let valor;
    
    function MicrobitBLEInput(config) {
        
        // Códigos padrões Node-red
        RED.nodes.createNode(this,config);
        
        this.acao = config.acao;
        this.pinId = config.pinId;
        this.pinSinal = config.pinSinal;     
        
        var node = this;
        
        node.status({fill:"red",shape:"ring",text:"desconectado"});
        
        ipc.log('##### mind-makers nodered-from-microbit configurado');
              
            ipc.connectToNet(
                'microbit',
                function(){
                    
                    ipc.of.microbit.on(
                        'connect',
                        function(){
                            
                            console.log('## Conectado a microbit ##', ipc.config.delay);
                            node.status({fill:"green",shape:"dot",text:"conectado"});
                            
                            // Inscreve nos sensores específicos
                            let mensagem = {acao:node.acao};
                                
                            var msg = {payload:mensagem};
                            
                             ipc.of.microbit.emit(
                                    'from.microbit.message.connection',
                                    {
                                        id:ipc.config.id,
                                        topic: node.acao,
                                        message : mensagem
                                    }
                                );
                            
                        }
                     );
                    
                    ipc.of.microbit.on(
                        'disconnect',
                        function(){
                            node.status({fill:"red",shape:"ring",text:"desconectado"});
                            ipc.log('## Desconectado de microbit');
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
                            'microbit.conectado',
                            function(){
                                ipc.log('## microbit conectado');
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                    
                    ipc.of.microbit.on(
                        'from.microbit.message.'+node.acao,
                        function(data){
                           // console.log('Recebeu uma mensagem de microbit : ', data);
                            node.status({fill:"green",shape:"dot",text:"conectado"});
                            // Repassa apenas se sinal é de sensor configurado
                            // Outros sinais podem ficar configurados depois de redeploy
                            if (data.topic == node.acao) {
                             //   console.log('vai repassar');
                                var msg = {payload:data.message};
                                node.send(msg);
                            }
                          

                            
                        }
                    );
                    
                    ipc.of.microbit.on(
                        'kill.connection',
                        function(data){
                            ipc.log('microbit requisitou kill.connection');
                            ipc.disconnect('microbit');
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
            ipc.disconnect('microbit');

         });
    
    }
    
    RED.nodes.registerType("from-microbit",MicrobitBLEInput);

}
