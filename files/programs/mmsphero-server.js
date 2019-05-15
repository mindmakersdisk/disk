/*
  Serviço Node para controle do robô Sphero  - usar somente para o Sphero Cinza SPRK, bluetooth 2.x
  Paulo Alvim 20/12/2016
 
  1. Certificar-se que o bluetooth do PI está ligado
  2. Rodar com "sudo node app.js [macaddress]", onde macaddress é de um sphero visível pelo bluetooth. Ex.: sudo node mmsphero-server.js E8:8A:B4:69:69:99 
  3. Testar abrindo o navegador e chamando http://localhost?code=[codigo-sphero.js]
  4. Para desconectar, fechar o serviço do Node

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

// Alvim 20/12/2016
// Este servidor foi concebido para rodar local, por isso o uso de estado em variáveis globais
// captura macaddress como argumento
var args = process.argv.slice(2)
var macaddressArg=args[0]
var code = ""
var macaddress = ""
var currentAngle=0;  // para frente
var eConfig=true;

if (macaddressArg) {
	macaddress=macaddressArg
}

var sphero = require("sphero"),
    bb8 = sphero(args[0]);
    
var WebSocketServer = require('websocket').server;

var http = require('http');    

// submete comandos dinamicamente, para o SPRK+
bb8.connect(function() {

  bb8.ping();  // Importante: evita travamentos inesperados
  

    // Notifica NODE-RED
    if (temNodeRedConectado()) {
       ipc.server.broadcast(
          'sphero.conectado',
          {
              id:ipc.config.id
          }
        );
     }

      
 
  bb8.version(function(err, data) {   
     if (err) { console.error("err:", err); } 
     else 
      { console.log("Versão:" + data.msaVer+ '.'+ data.msaRev); }
     });
	 
  console.log('Conectou com sucesso!! Aguardando comandos em http://localhost?code=')
 
  count=0;

  setInterval(function() {

     if (count % 60 == 0) {     console.log('Verificando comandos ...') }

     count++;

     if (code!='') {

	try {
         
	 console.log('Vai executar: '+code)
	 	 
	 eval(code)
	 	 
	 if (!eConfig) {}		
	
  } catch(e) {
	 
      console.log('Erro ao tentar executar comando. Erro: '+e)

       if (temNodeRedConectado()) {
      
          ipc.server.emit(
              socket,
              'error.message',
              {
                  id      : ipc.config.id,
                  message : e
              }
          );
      
      }
   
   
	}
	code=''
  
   }
 
  }, 1000);
  
  
bb8.detectCollisions({device: "bb8"});

bb8.on("collision", function(data) {
    console.log("Colisão detectada!");
    //console.log("  data:", data);
    
     if (temClienteConectado())
        wsServer.connections[0].send('colisao={x:'+data.x+',y:'+data.y+',xMagnitude:'+data.xMagnitude+
	                                ',yMagnitude:'+data.xMagnitude+',speed:'+data.speed+'}');
                                  
     if (temNodeRedConectado()) {
           
         //  console.log('teste colisao');

           ipc.server.broadcast(
              'sphero.hitted',
              {
                  id:ipc.config.id,
                  message:{x:data.x,y:data.y,xMagnitude:data.xMagnitude,
                         yMagnitude:data.xMagnitude,speed:data.speed} 
              }
            );
        
        }
                                  
  });

});


const express = require('express')  
const app = express()
 
// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    next();
});

app.get('/', (request, response) => {  
 

//  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code!=null) {
    eConfig=request.query.config!=null;
     currentAngle=0; 
     code=request.query.code

  }

  response.json({
    status: 'ok',codigo:code
  })
})

app.get('/dispositivocorrente', (request, response) => {  
  
 // response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code!=null) {
     code=request.query.code
  }

  response.json({
    dispositivo: macaddress
  })
})


function wait(seconds) {
    var iMilliSeconds = seconds * 1000
    var counter= 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}

app.listen(80) 

/* daqui em diante websocket */
var notificouClienteConexao=false;


function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}

 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8081, function() {
   // console.log('---------------------------------------------------------------');
    console.log('            '+(new Date().toLocaleString()) + ' Websocket ouvindo na porta 8081');
   // console.log('---------------------------------------------------------------');    
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
  
    console.log('Cliente conectado');
  
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date().toLocaleString()) + ' Conexão com origem ' + request.origin + ' rejeitada.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date().toLocaleString()) + ' Conexão aceita.');
   
    connection.on('message', function(message) {

      // Implementa envios para Sphero por aqui.
      
     
    });
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
    });
});

/******************** COMUNICAÇÃO INTER NODE.JS PARA USO COM NODE-RED ****************************/

const ipc = require('node-ipc');

ipc.config.id = 'sphero';
ipc.config.retry= 1500;
ipc.config.silent=true;

// Envia código para Sphero
ipc.serveNet(
    function(){
        ipc.server.on(
            'program.sphero.message',
            function(data,socket){
                ipc.log('Recebeu mensagem de', (data.id), (data.message));
                console.log('vai enviar para sphero '+data.message);
                //code = data.message.replaceAll('sprk.','bb8.');
                code = data.message;
                setTimeout(limitaMovimento,2000);
            }
        );
    }
);

function limitaMovimento() {
  
  code="wait(1);bb8.roll(0)";
}

function temNodeRedConectado() {

  return ipc!= null && ipc.server != null 
  
}



ipc.server.start();
