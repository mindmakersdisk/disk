"use strict";

// const five = require("johnny-five")
// const board = new five.Board()
const Gpio = require('onoff').Gpio;
var io = new Array(27),
  buttonStatus = new Array(27)

var boardReady = false;

const PORTA_GPIO = 8086;

if (Gpio.accessible) {
  boardReady = true;
 // if(wsServer != undefined)
 //   notificaCliente('boardStatus', null, boardReady); //TODO -- fazer função apra validar status da board?
  console.log('');
  console.log(new Date().toLocaleString() + " ### Board ready!");
}

//board.on("ready", function() {
  //boardReady = true;
  //notificaCliente('boardStatus', null, boardReady); //TODO -- fazer função apra validar status da board?
  //console.log('');
  //console.log(new Date().toLocaleString() + " ### Board ready!");
  ////Ver se vai ficar somente assim como indicador que a placa está pronta (ex piscar o led onboard(pin 13));

//});

var pintypeMap = new Map(); //validar alteração de função do pin
// var ultimoValorPinMap = new Map(); //validar execução de comando, só deiar fazer se for diferente.
var lastvaluepinread = -1;

//TODO -- validar utilizacão de pin no netsblox ou aqui?
function escreveParaCircuito(componente, pin, valor) {
  if (Gpio.accessible) { //valida que a placa esta pronta para receber comandos
    if (!isNaN(pin)) {} else { //valida que pin é um número para ser convertido em gpio
      console.log('não chegou numero, deve validar');
      return

    }

    console.log('componente: ' + componente + ', pin: ' + pin + ', valor: ' + valor);
    if (pintypeMap.get(pin) == undefined) {
      pintypeMap.set(pin, componente);

    } else {
      if (pintypeMap.get(pin) != componente && pintypeMap.get(pin) != 'pinRead') {
        //console.log('fazer unexport? ja existe componente neste pin(' + pin + '), componente: ' + componente);
        //io[pin].unexport();
      }
      //ver se valida ou fazer unexport de acordo com o tipo?
    }


    //TODO - Validar se pin já esta sendo utilizado e liberar se já estiver sendo usado como outra função
    if (componente == 'led' || componente == 'pinWrite') {
      if (!io[pin]) {
        console.log((new Date().toLocaleString()) + ' atribuiu novo LED. Pin ' + pin)
        //io[pin] = new five.Led(pin);
        io[pin] = new Gpio(pin, 'out');
      }
      var status = "OK";
      switch (valor) {
        case "on":
          io[pin].writeSync(1);
          break;
        case "off":
          io[pin].writeSync(0);
          break;
          // case "blink":
          //   io[pin].blink();
          //   break;
          // case "stop":
          //   io[pin].stop();
          //   break;
        default:
          if (!isNaN(valor)) {
            io[pin].writeSync(parseInt(valor)); //tem que fazer parseInt do valor?
          } else {
            status = "Unknown: " + valor;
          }
          break;
      }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } else if (componente == 'servo') {
      if (!io[pin]) {
        console.log((new Date().toLocaleString()) + ' atribuiu novo Servo. Pin ' + pin)
        io[pin] = new five.Servos([pin]);
      }
      var status = "OK";
      switch (valor) {
        case "min": // 0 degrees
          io[pin].min();
          //io[pin].to('10'); //possívelmente alterar para ter um mínimo que não força o motor
          break;
        case "max":
          io[pin].max();
          //io[pin].to('170');
          break;
        case "stop": // use after sweep
          io[pin].stop();
          break;
        case "sweep":
          io[pin].sweep();
          break;
        default:
          if (!isNaN(valor)) {
            io[pin].to(valor);
          } else {
            status = "Unknown: " + valor;
          }
          break;
      }
      console.log('status ' + status);
    } else if (componente == 'button') {
      if (io[pin]) {
        console.log('ja existe botão nesse pin num ' + pin)
        notificaCliente('buttonstatus', pin, buttonStatus[pin]);
      } else {
        io[pin] = new Gpio(pin, 'in', 'both');

        io[pin].watch((err, value) => {
          if (err) {
            throw err;
          }
          if (value == 0) {
            console.log("down");
            buttonStatus[pin] = "down";
            notificaCliente('buttonstatus', pin, buttonStatus[pin]);
          } else if (value == 1) {
            buttonStatus[pin] = "up";
            console.log("up");
            notificaCliente('buttonstatus', pin, buttonStatus[pin]);
          } else {
            console.log("nem zero nem um");
            //notificaCliente('buttonstatus', pin, buttonStatus[pin]);
          }
        })
      }
      console.log((new Date().toLocaleString()) + ' status ' + status);
    }
    /*else if (componente == 'pinSetUp') {
         var status = "OK";
         if (!io[pin]) {
           console.log((new Date().toLocaleString()) + ' atribuiu novo LED. Pin ' + pin)
           // let resultado123 = isNAN(pin);
           // console.log('pin.isNAN() ' + resultado123);
           if (valor == 'INPUT')
             valor = 0;
           else if (valor == 'ANALOG')
             valor = 2;
           else if (valor == 'PWM')
             valor = 3;
           else if (valor == 'SERVO')
             valor = 4;
           else
             valor = 1;

           if (!isNaN(pin)) {
             console.log(' else do isNaN')
             io[pin] = new five.Pin({
               pin: pin,
               mode: valor
             });
           } else {
             //console.log(' caiu no isNaN e tem valor ' + valor) // aindai não ta funcionando
             io[pin] = new five.Pin({
               pin: '"' + pin + '"',
               mode: valor
             });
           }
         }
         console.log('status ' + status);
         // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
       }
    else if (componente == 'pinWrite') {
      if (io[pin]) {
        var status = "OK";
        io[pin].write(parseInt(valor));
      } else {
        console.log(componente + ' já exite no pin ' + pin);
        var status = "KO";
      }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } */
    else if (componente == 'pinRead') {
      //if (io[pin] && lastvaluepinread == -1) {
        var lastvaluepinread = io[pin].readSync();
        console.log('#####################pinRead é ' + lastvaluepinread)
        if(lastvaluepinread)
          notificaCliente('pinRead', pin, lastvaluepinread);

        // io[pin].read((error, value) => {
        //   var status = "OK";
        //   if (lastvaluepinread != value) {
        //     lastvaluepinread = value;
        //     notificaCliente('pinRead', pin, value);
        //   }
        //
        // });
      // } else {
      //   console.log(componente + ' já exite no pin ' + pin);
      //   var status = "KO";
      // }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } else {
      // res.send('Board NOT ready!')
      if (componente != undefined)
        console.log((new Date().toLocaleString()) + ' Componente ' + componente + ' não encontrado');
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    }
  } else {
    console.log((new Date().toLocaleString()) + ' board not ready');
  }
}

process.on('SIGINT', _ => {
  console.log('fechando terminal');
  for (let i = 0; i < io.length; i++) {
    if(io[i])
      io[i].unexport();
  }
})

/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');

var server = http.createServer(function(request, response) {
  console.log((new Date().toLocaleString()) + ' Received request for ' + request.url);
  response.writeHead(403);
  response.end();
});

server.listen(PORTA_GPIO, function() {
  console.log('---------------------------------------------------------------');
  console.log('       ' + (new Date().toLocaleString()) + ' Servidor ouvindo na porta ' + PORTA_GPIO);
  console.log('---------------------------------------------------------------');
});

let wsServer = new WebSocketServer({
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
  if (Gpio.accessible) {
    boardReady = true;
    notificaCliente('boardStatus', null, boardReady); //TODO -- fazer função apra validar status da board?
  }

  connection.on('message', function(message) {
    //console.log('RECEBEU MENSAGEM ' + JSON.stringify(message));

    var message = JSON.parse(message.utf8Data);

    escreveParaCircuito(message.comando, message.pin, message.valor);

  });

  connection.on('close', function(reasonCode, description) {
    console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
  });

});

function notificaCliente(componente, pin, valor) {
  //console.log('notificou cliente com:' + componente +','+ pin +','+ valor)
  enviaMsgParaTodosClientes(componente + "," + pin + "," + valor);

}

function enviaMsgParaTodosClientes(evento) {
  for (var i = 0; i < wsServer.connections.length; i++) {
    wsServer.connections[i].send(evento);
  }

}
