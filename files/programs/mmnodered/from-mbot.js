module.exports = function(RED) {
    
    const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

    console.log('##### mind-makers nodered-from-mbot instalado');
    
    ipc.config.id = 'nodered-from-mbot';
    ipc.config.retry= 1500;
    ipc.config.maxRetries=10;
    ipc.config.silent=true;
    ipc.config.delay=3000;
    
    const ACAO_BOTAO="BOTAO";
    const ACAO_ULTRASSOM="ULTRASSOM";    
    const ACAO_LUMINOSIDADE="LUMINOSIDADE";   
    const ACAO_SEG_LINHA="SEG_LINHA";   
    const ACAO_INFRA_VERMELHO="INFRA_VERMELHO";   
    const ACAO_PINO="PINO";   
    const ACAO_PIN="PIN";   
    
    // Mantém último valor recebido
    let valor;
    
    function MBotBLEInput(config) {
        
        // Códigos padrões Node-red
        RED.nodes.createNode(this,config);
        
        this.acao = config.acao;
        this.pinId = config.pinId;
        this.pinSinal = config.pinSinal;     
        
        var node = this;
        
        node.status({fill:"red",shape:"ring",text:"desconectado"});
        
        ipc.log('##### mind-makers nodered-from-mbot configurado');
              
            ipc.connectToNet(
                'mbot',
                function(){
                    
                    ipc.of.mbot.on(
                        'connect',
                        function(){
                            
                            console.log('## Conectado a mbot ##', ipc.config.delay);
                            node.status({fill:"green",shape:"dot",text:"conectado"});
                            
                            // Inscreve nos sensores específicos
                            let mensagem = {acao:node.acao};
                                
                            var msg = {payload:mensagem};
                            
                             ipc.of.mbot.emit(
                                    'from.mbot.message.connection',
                                    {
                                        id:ipc.config.id,
                                        topic: node.acao,
                                        message : mensagem
                                    }
                                );
                            
                        }
                     );
                    
                    ipc.of.mbot.on(
                        'disconnect',
                        function(){
                            node.status({fill:"red",shape:"ring",text:"desconectado"});
                            ipc.log('## Desconectado de mbot');
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
                            'mbot.conectado',
                            function(){
                                ipc.log('## mbot conectado');
                                node.status({fill:"green",shape:"dot",text:"conectado"});
                            }
                        );
                    
                    ipc.of.mbot.on(
                        'from.mbot.message.'+node.acao,
                        function(data){
                           // console.log('Recebeu uma mensagem de mbot : ', data);
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
                    
                    ipc.of.mbot.on(
                        'kill.connection',
                        function(data){
                            ipc.log('mbot requisitou kill.connection');
                            ipc.disconnect('mbot');
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
            ipc.disconnect('mbot');

         });
    
    }
    
    RED.nodes.registerType("from-mbot",MBotBLEInput);

}
