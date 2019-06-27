#!/usr/bin/env node
/*
  Interaçao com BLE Bit

  Paulo Alvim 04/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/
// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var pi_registrado='';
var sd_registrado='';
var sala_registrado = '1';
var estacao_registrado = '';
var sphero_registrado='';
var littlebits_registrado='';
var mbot_registrado='';
var microbit_registrado='';

var macaddressArg;

const request = require('request')  
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');

/******************************************************************
 *  Perguntas, configuração do macaddress e registro na plataforma
 ******************************************************************/
var modoRegistro = false;

              
fs.readFile('/home/mindmakers/school.info', function(err,data)
    {
      if (err) {
          console.log("Essa estação ainda não está ativada. Ative antes de usar o BLE Bit");
          process.exit(1);
      } else {

      
              escolainfo = data.toString();
              escolaidIni =escolainfo.indexOf('Cód.:')+5;
              escolaid= escolainfo.substring(escolaidIni,escolainfo.indexOf('||'),escolaidIni).trim();
              //console.log(escolaid);
              escolanomeIni =escolainfo.indexOf('Nome:')+5;
              escolanome= escolainfo.substring(escolanomeIni,escolainfo.indexOf('||',escolanomeIni)).trim();
              //console.log(escolanome);
              piIni = escolainfo.indexOf('Pi:')+3;
              pi_registrado= escolainfo.substring(piIni,escolainfo.indexOf('||',piIni)).trim();
              //console.log(pi_registrado);
              sdIni = escolainfo.indexOf('SD:')+3;
              sd_registrado= escolainfo.substring(sdIni,escolainfo.indexOf('||',sdIni)).trim();
              //console.log(sd_registrado);
              salaIni = escolainfo.indexOf('Sala:')+5
              sala_registrado= escolainfo.substring(salaIni,escolainfo.indexOf('||',salaIni)).trim();
              //console.log(sala_registrado);
              estacaoIni = escolainfo.indexOf('Estação:')+8
              estacao_registrado= escolainfo.substring(estacaoIni,escolainfo.indexOf('||',estacaoIni)).trim();
              //console.log(estacao_registrado);
              spheroIni = escolainfo.indexOf('Sphero:')+7
              sphero_registrado= escolainfo.substring(spheroIni,escolainfo.indexOf('||',spheroIni)).trim();
              littlebitsIni = escolainfo.indexOf('littlebits:')+11
              littlebits_registrado= escolainfo.substring(littlebitsIni,escolainfo.indexOf('||',littlebitsIni)).trim();
              mbotIni = escolainfo.indexOf('mbot:')+5
              mbot_registrado= escolainfo.substring(mbotIni,escolainfo.indexOf('||',mbotIni)).trim();
              microbitIni = escolainfo.indexOf('microbit:')+9
              microbit_registrado= escolainfo.substring(microbitIni,escolainfo.indexOf('||',microbitIni)).trim();
          
              macaddressArg = littlebits_registrado;
              console.log('Identificou BLE Bit configurado: '+macaddressArg);
              
              if (macaddressArg != undefined && macaddressArg != null && macaddressArg !='' && macaddressArg !='XX:XX:XX:XX:XX:XX') {
                  
                  // Tem um littleBits configurado

                  var acaoDefaultTemporal=setTimeout(acionaRegistradoTemporal,7000);
                  
                  inquirer.prompt(questionsConfigurado).then(answers => {

                        if (acaoDefaultTemporal) 
                            clearTimeout(acaoDefaultTemporal);

                        if (answers.usarOuConfigurar==USAR_REGISTRADO) {
                          // Conexão normal
                          console.log('Vai conectar com BLE Bit pré-configurado');
                          controlaBLEBit();
                          
                        } else {
                          // Registrar um novo
                          console.log('Vai configurar um novo BLE Bit');
                          procurarNovoBLEBit();
                          
                        }


                    });


              } else {

                 // Não tem um BLE Bit configurado
                 procurarNovoBLEBit();

              }
              
      }
      
    });

 const USAR_REGISTRADO="Usar Registrado";
 const REGISTRAR_NOVO="Registrar Novo";
 const REGISTRAR="Registrar";
 
 var questionsConfigurado = [
  {
    type: 'list',
    name: 'usarOuConfigurar',
    message: "Usar BLE Bit registrado ou registrar um novo?",
    default: USAR_REGISTRADO,
    choices: [USAR_REGISTRADO,REGISTRAR_NOVO]
  }
];

 var questionsNaoConfigurado = [
  {
    type: 'list',
    name: 'configurar',
    message: "Aproxime um BLE Bit energizado e aperte enter para configurá-lo nesta estação",
    default: REGISTRAR,
    choices: [REGISTRAR]
  }
];

var questionsInformar = [
  {
    type: 'input',
    name: 'macaddress',
    message: "Informe o macaddress com 12 digitos sem ':' (ex.: cd09654dbd23) para configurar manualmente."
    +" Ou aproxime o BLE Bit e aperte enter para tentar mais uma vez..."
  }
];

/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoBLEBit() {

  if (macaddressArg==null || macaddressArg=='') {
     console.log('Não registrou o BLE Bit porque não recebeu um macaddress válido');
       return;
  }

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
                         "Cód.: "+escolaid+"||\n"+
                         "Nome: "+escolanome+"||\n"+
                         "Pi: "+pi_registrado+"||\n"+
                         "SD: "+sd_registrado+"||\n"+
                         "Sala: "+sala_registrado+"||\n"+
                         "Estação: "+estacao_registrado+"||\n"+
                         "Sphero: "+sphero_registrado+"||\n"+
                         "littlebits: "+macaddressArg+"||\n"+
                         "mbot: "+mbot_registrado+"||\n"+
                         "microbit: "+microbit_registrado+"||\n"+
                         "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err,data)
        {
          if (err) {
              console.log(err);
              // Encerra com falha
              process.exit(1);
          } else {
            
            console.error('\x1b[32m',       '---------------------------------------------------');
            console.error('\x1b[0m\x1b[32m','-- Alterou a configuração para usar o BLE Bit  ----');
            console.error('\x1b[0m\x1b[1m', '            '+macaddressArg);
            console.error('\x1b[0m\x1b[1m', '-- Chame novamente para começar a usar         ----');
            console.error('\x1b[0m\x1b[32m','-- Esta janela fecha em 7 segundos...          ----');
            console.log('');   

          }

        
        });

}

function encerraAposLeitura() {
  
  process.exit(1)
  
}

var autenticacao = [
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:"
  },
  {
    type: 'password',
    name: 'senha',
    message: "Informe sua senha:"
  }
];



function registraBLEBitPlataforma() {

    console.log('Entrou para registrar na plataforma...');

    if (macaddressArg==null || macaddressArg=='')
       return;

    inquirer.prompt(autenticacao).then(autenticacao => {

       registraAposConferirAtivacao(autenticacao.login,autenticacao.senha);  
    
    });

}

function registraAposConferirAtivacao(login,senha) {
  
         // Registra BLE Bit
        // console.log('Registrando o Sphero "'+macaddressArg+'" na plataforma.');

         if (escolaid == undefined || escolaid==null || escolaid=='') {
            console.error('\x1b[31m','----------------------------------------------------------------');
            console.error('\x1b[31m','Não registrou na plataforma porque esta estação não está ativada');
            console.error('\x1b[31m','----------------------------------------------------------------');
            
         } else {


             request({url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
                    method: 'POST',
                    json: {
                      'username':login,
                      'password':senha,
                      'tipo':'littleBits-Kit1',
                      'alocadoescola':escolaid,
                      'chaveNatural':macaddressArg,
                      'acao': 'registrar',
                      'observacao': 'ativação automática'}
                    },
                    function(error, response, body){
                       // console.log('ERROR ---------------------------');
                       // console.log(error);
                     //   console.log('RESPONSE---------------------------');
                     //   console.log(response);
                      //  console.log('BODY---------------------------');
                      //  console.log(body);
                        if (!body.success || error) {
                            if (!body.success){
                              console.error('\x1b[31m','Erro ao registrar BLE Bit: '+JSON.stringify(body.err));
                            }else{
                              console.error('\x1b[31m','Erro ao registrar BLE Bit: '+error);
                            }
                             setTimeout(encerraAposLeitura,15000);  
                        } else {
                            console.log('\x1b[32m','BLE Bit registrado na plataforma com sucesso! ');
                             // Modifica o atalho e variável
                             atualizaAtalhoBLEBit();
                             setTimeout(encerraAposLeitura,10000);  
                        }
                    }
                );
              
              }
  
  
}


var ks = require('node-key-sender');

function acionaRegistradoTemporal() {
 
  ks.sendKey('enter');
 
}

var numeroScans=0;
var numeroTentativas=0;

function procurarNovoBLEBit() {
  
  modoRegistro=true;
  
  console.log('Procurando por um BLE Bit próximo para configurar...');  
  
  // Procura por bluetooth

    noble.on('stateChange', function(state) {

      //console.log('Estado = '+state);
      if (state === 'poweredOff') {
        console.log('');
        console.error('\x1b[31m','O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
        console.error('\x1b[0m','');
        process.exit(1);
      } else if (state === 'poweredOn') {
        console.log('---------------------------------------------------------------');
        console.log('                    Serviço Bluetooth Ativo                    ');
        console.log('---------------------------------------------------------------');  

        console.log('Procurando por um BLE Bit a menos de 2m...');
        noble.startScanning();
      } else {
       console.log('Encerrando procura por dispositivos Bluetooth');
       noble.stopScanning();
     }
    });
    
    
    noble.on('discover', function(peripheral) {
      
      console.log('Investigando dispositivos Bluetooth Low Energy (BLE)...');

      numeroScans++;
      
      if ((''+peripheral.advertisement.localName).indexOf('w30') == 0 &&
              peripheral.rssi>-90) {
         
          console.log('\x1b[32m','Encontrou BLE Bit:'+peripheral.address + ' [Nome:'+peripheral.advertisement.localName +
                ', Conectável:' + peripheral.connectable + ', RSSI:' + peripheral.rssi+']');
          console.log('');
         
         noble.stopScanning();
          
         macaddressArg=peripheral.address;   
         
         configurarNovoBLEBit();  

       //console.log(peripheral);    
       // console.log(peripheral);
       // console.log(peripheral.advertisement.serviceData); 

      }
      
      if (numeroScans>=8) {
        
           console.error('\x1b[31m','Não foi possível encontrar um BLE Bit ligado para registrar.');
           console.error('\x1b[31m','Confira se ele está ligado e com luz branca piscando.');
           console.error('\x1b[31m','Se tudo estiver ok, tente novamente após desligar e ligar a antena Bluetooth');
           console.error('\x1b[31m','do computador, usando o atalho no canto superior direito.');
           console.error('\x1b[0m', '------------------------------------------');
           // Encerra com falha
           setTimeout(encerraAposLeitura,10000);   
        
      }
      

    });
  
}

function configurarNovoBLEBit() {
  
  // Registra na plataforma (opcional)
  registraBLEBitPlataforma();
  
  modoRegistro=false;


}

/*************************************************************
 * Serviços BLE para BLEBit daqui por diante
 ************************************************************/

var blebitServiceUuid = '0705d0c0c8d841c9ae1552fad5358b8a';
var blebitSignalCharacteristicUuid = '0705d0c0c8d841c9ae1552fad5358b8a';  
var blebitService=null;
var blebitSignalCharacteristic=null;
          
var contadorIntervalo = 0;
var macaddressConectado = null;
var notificouClienteConexao=false;

var characteristic;
var monitoriaTask=null;

let blebit;         
          
function controlaBLEBit() {
  
    // Conecta somente com o configurado
    
    noble.on('stateChange', function(state) {

      //console.log('Estado = '+state);
      if (state === 'poweredOff') {
        console.log('');
        console.error('\x1b[31m','O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
        console.error('\x1b[0m','');
        process.exit(1);
      } else if (state === 'poweredOn') {
        console.log('---------------------------------------------------------------');
        console.log('                    Serviço Bluetooth Ativo                    ');
        console.log('---------------------------------------------------------------');  

        console.log('Procurando pelo BLE Bit '+macaddressArg);
        noble.startScanning();
      } else {
       console.log('Encerrando procura por dispositivos Bluetooth');
       noble.stopScanning();
     }
    });
    
    noble.on('discover', function(peripheral) {
      
      console.log('Encontrou '+peripheral.address);
      
      if (peripheral.address==macaddressArg) {
                
          noble.stopScanning();
                
          blebit = peripheral;      

          peripheral.connect(function(error) {
              
                  if (error) {
                      console.log('Erro ao tentar conectar: '+error);
                     notificaClienteDesconexao(error);
                     return;
                  }
                  
                  console.log('Conectando ao BLE Bit com macaddress: ' + peripheral.uuid);
             //console.log(peripheral); 
             
                   macaddressConectado = peripheral.uuid;
                   
                   if (temClienteConectado()) {
                     
                     // Envia macaddress para indicar conexão ok
                     
                      enviaMsgParaTodosClientes('conectado:'+peripheral.uuid);
                      notificouClienteConexao=true;
                     
                   }
                   
                    if (temNodeRedConectado()) {
                     
                       ipc.server.broadcast(
                          'littlebits.conectado',
                          {
                              id:ipc.config.id
                          }
                        );
                     
                   }
                
                   var obj = peripheral.advertisement.serviceData[0];
                   //console.log(obj.data[0]);
              
               
                  peripheral.discoverServices([blebitServiceUuid], function(err, services) {
              
                  services[0].discoverCharacteristics([], function(error, characteristics) {
                 
                    characteristic = characteristics[0];

                    characteristic.on('data', function(data, isNotification) {
                      //console.log(data);
                      //console.log(data[2]);
                    
                        contadorIntervalo++;
                        
                        // Se não notificou cliente da conexão notifica agora
                        if (temClienteConectado() &&  (contadorIntervalo==300 || !notificouClienteConexao)) {
                               console.log('Entrou para notificar conexao');
                               enviaMsgParaTodosClientes('conectado:'+peripheral.uuid);
                               notificouClienteConexao=true;
                               contadorIntervalo=0;
                        }
                    
                      
                      
                        if (data[2] != null) {
                            
                            //console.log('vai tentar enviar'+data[2]);
                            
          //                  console.log(wsServer);
                            
                            // Envia para MMBlockly se ativo
                            if (temClienteConectado())
                               enviaMsgParaTodosClientes(data[2]+'');
                                
                            // Envia para Node-Red se ativo
                            if (temNodeRedConectado()) {
                               
                               ipc.server.broadcast(
                                  'littlebits.message',
                                  {
                                      id:ipc.config.id,
                                      message : data[2]+''
                                  }
                                );
                              
                            }
                           
                          
                          }

                    });

                    characteristic.subscribe(function(error) {
                      //console.log('entrou para subscrever');
                      if (error)
                         notificaClienteDesconexao(error);
                      else {
                        console.log('\x1b[0m\x1b[32m','Comunicação com circuito digital via bluetooth ativada: '+blebit.address);
                        console.log('\x1b[0m',        '-------------------------------------------------');
                        monitoriaTask = setInterval(monitoraDispositivoConectado,3000);

                      }
                    });
                    
                  })

               })

             });
       
         peripheral.once('disconnect', (error) => {
                
           //console.log('Desconectou ',error);
            erroConexao(error)
            
         });
        
      }

    });
 
    
  }

var ultimoContador=-1;

function monitoraDispositivoConectado() {
  
  if (contadorIntervalo==ultimoContador) {
      ultimoContador=contadorIntervalo;
      
      // Assume que conexão está congelada
      notificaClienteDesconexao();
      
      clearInterval(monitoriaTask);
      
      noble.startScanning();
      
  } else {
      ultimoContador=-1;    
  }
  
}

// Recebe valor entre 0 e 255 e escreve para circuito se conectado.
function escreveParaCircuito(valor) {
  
  
      if (characteristic==null) {
          console.log('Não pode enviar mensagem para circuito porque não está conectado.');
          return "Erro ao tentar enviar";
      }
      
   
      const bufWrite = Buffer.allocUnsafe(3);
      
      bufWrite.writeUInt8(0x00, 0);
      bufWrite.writeUInt8(0x02, 1);
     // Quando escrevemos para o BLE Bit, a mensagem varia apenas neste segmento abaixo, de 0x00 a 0xff.
    //    bufWrite.writeUInt8(0xff, 2);  ou bufWrite.writeUInt8(255, 2);    => maximo 
    //    bufWrite.writeUInt8(0x00, 2);  ou bufWrite.writeUInt8(0, 2);    => minimo 
    
      //console.log(valor + ' utf8'+valor.utf8Data+'');
    
      if (valor.utf8Data != null && valor.utf8Data !== 'undefined') {
        // console.log('entrou');
         bufWrite.writeUInt8(parseInt(valor.utf8Data), 2);
      } else { 
         var valorUnsigned = parseInt(valor) >>>0;
        // console.log('entro ascii = ' + valorUnsigned);
         bufWrite.writeUInt8(valorUnsigned, 2);         
      }
                
      characteristic.write(bufWrite, true, function (error) {
                        if (!error) {
                          // console.log(bufWrite);
                        } else {
                          console.log('Erro ao tentar escrever valor via bluetooth para circuito digital:'+error);
                          notificaClienteDesconexao(error);

                        }
                    });

  
  
}


noble.on('disconnect', function(data) {

   console.log('BLE Bit desconectado: '+data);
   
   notificaClienteDesconexao('');
   
   notificouClienteConexao=false;
   macaddressConectado=null;

});

process.on('SIGINT',function() {
    
    console.log('Obrigado, até a próxima!');
    
    
    blebit.disconnect(function() {
      console.log('Desconectando BLE Bit. Obrigado...');
    });

    
    process.exit();
  
  });

function erroConexao(error) {
  
  if (!error)
      error = "Dispositivo parece desligado";
  
   console.log('Erro de conexão: '+error);
 
   notificaClienteDesconexao(error);  

   notificouClienteConexao=false;
   
   macaddressConectado=null;
   
   noble.startScanning();
  
}

function notificaClienteDesconexao(error) {
  
  if (error=null) error='';
  
  console.log('');
  console.error('\x1b[31m','Perdeu a conexão com o circuito eletrônico digital...');
  console.error('\x1b[0m','');
 
  if (temClienteConectado()) {
      enviaMsgParaTodosClientes('desconectado:'+error);
  }
  
   if (temNodeRedConectado()) {
                     
       ipc.server.broadcast(
          'littlebits.desconectado',
          {
              id:ipc.config.id,
              message : error
          }
        );
                                      
   }
}

function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}

function temNodeRedConectado() {

  return ipc!= null && ipc.server != null 
  
}

function decimalParaHexa(numeroDecimal) {

  var hexString = numeroDecimal.toString(16);
  return parseInt(hexString, 16);
  
}

/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');
 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(403);
    response.end();
});
server.listen(8080, function() {
  //  console.log('---------------------------------------------------------------');
  //  console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta 8080');
  //  console.log('---------------------------------------------------------------');    
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
   // console.log('entrou para permitir origin');
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
 
wsServer.on('request', function(request) {
  
    //console.log('UM CLIENTE ENTROU EM REQUEST');
  
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date().toLocaleString()) + ' Conexão com origem ' + request.origin + ' rejeitada.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date().toLocaleString()) + ' Conexão aceita.');
   
    if (temClienteConectado()) {
             enviaMsgParaTodosClientes('conectado:'+macaddressConectado+',sala:'+sala_registrado+',estacao:'+estacao_registrado+',escola:'+escolaid);
             notificouClienteConexao=true;
             contadorIntervalo=0;
      }
   
   
    connection.on('message', function(message) {

      //console.log('RECEBEU MENSAGEM '+message);
            
      escreveParaCircuito(message);
      
      /*
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
        */
    });
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
    });
});


function enviaMsgParaTodosClientes(evento) {
  
    var i;
    for (i = 0; i < wsServer.connections.length; i++) { 
	
        wsServer.connections[i].send(evento);
      
    }
  
}

/******************** COMUNICAÇÃO INTER NODE.JS PARA USO COM NODE-RED ****************************/

const ipc = require('node-ipc');

ipc.config.id = 'littlebits';
ipc.config.retry= 1500;
ipc.config.silent=true;

ipc.serveNet(
    function(){
        ipc.server.on(
            'to.message',
            function(data,socket){
                ipc.log('Recebeu mensagem de', (data.id), (data.message));
//                console.log('vai enviar para circuito littlebits '+data.message);
                var erro = escreveParaCircuito(data.message);
                
                if (erro) {
                  
                    ipc.server.emit(
                        socket,
                        'error.message',
                        {
                            id      : ipc.config.id,
                            message : erro
                        }
                    );
                  
                }
                
/*
                if(messages.hello && messages.goodbye){
                    ipc.log('got all required events, telling clients to kill connection');
                    ipc.server.broadcast(
                        'kill.connection',
                        {
                            id:ipc.config.id
                        }
                    );
                }
                 */
            }
        );
    }
);




ipc.server.start();
