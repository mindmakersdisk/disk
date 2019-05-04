#!/usr/bin/env node
/*
  Interaçao com BLE Bit

  Paulo Alvim 04/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')  
//const si = require('systeminformation')
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');

var blebitServiceUuid = '0705d0c0c8d841c9ae1552fad5358b8a';
var blebitSignalCharacteristicUuid = '0705d0c0c8d841c9ae1552fad5358b8a';  
var blebitService=null;
var blebitSignalCharacteristic=null;
          
                     
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

var contadorIntervalo = 0;
var macaddressConectado = null;
var notificouClienteConexao=false;

var characteristic;
var monitoriaTask=null;


noble.on('discover', function(peripheral) {
  
  if ((''+peripheral.advertisement.localName).indexOf('w30') == 0 &&
          peripheral.rssi>-60) {

   //console.log(peripheral);    
   // console.log(peripheral.advertisement);
   // console.log(peripheral.advertisement.serviceData); 
   
   peripheral.once('disconnect', (error) => {
          
     //console.log('Desconectou ',error);
      erroConexao(error)
      
   });
     
    peripheral.connect(function(error) {
    
        if (error) {
            console.log('Erro ao tentar conectar: '+error);
           notificaClienteDesconexao(error);
           return;
        }
        
        console.log('    Conectado ao BLE Bit com macaddress:' + peripheral.uuid);
   //console.log(peripheral); 
   
         macaddressConectado = peripheral.uuid;
         
         if (temClienteConectado()) {
           
           // Envia macaddress para indicar conexão ok
           
            wsServer.connections[0].send('conectado:'+peripheral.uuid);
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
                     wsServer.connections[0].send('conectado:'+peripheral.uuid);
                     notificouClienteConexao=true;
                     contadorIntervalo=0;
              }
          
            
            
              if (data[2] != null) {
                  
                  //console.log('vai tentar enviar'+data[2]);
                  
//                  console.log(wsServer);
                  
                  // Envia para MMBlockly se ativo
                  if (temClienteConectado())
                     wsServer.connections[0].send(data[2]+'');
                      
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
              console.log('\x1b[0m\x1b[32m','Leitura de circuito digital via bluetooth ativada');
              console.log('\x1b[0m','-------------------------------------------------');
              monitoriaTask = setInterval(monitoraDispositivoConectado,3000);

            }
          });
          
        })

     })

   });
    
  }

});

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
      wsServer.connections[0].send('desconectado:'+error);
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

var WebSocketServer = require('websocket').server;

var http = require('http');
 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log('---------------------------------------------------------------');
    console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta 8080');
    console.log('---------------------------------------------------------------');    
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
