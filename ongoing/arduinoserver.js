"use strict";

const five = require("johnny-five")
const board = new five.Board()
var led = new Array(14),
  servo = new Array(14),
  button = new Array(14),
  buttonStatus = new Array(14),
  pins = new Array(19)

var boardReady = false;

const PORTA_Arduino = 8085;


board.on("ready", function() {
  boardReady = true;
  notificaCliente('boardStatus', null, boardReady); //TODO -- fazer função apra validar status da board?
  console.log('');
  console.log(new Date().toLocaleString() + " ### Board ready!");
  //Ver se vai ficar somente assim como indicador que a placa está pronta (ex piscar o led onboard(pin 13));

});

var pintypeMap = new Map(); //validar alteração de função do pin
var ultimoValorPinMap = new Map(); //validar execução de comando, só deiar fazer se for diferente.
var lastvaluepinread = -1;

//TODO -- validar utilizacão de pin também no netsblox?
function escreveParaCircuito(componente, pin, valor) {
  if (boardReady == true) {
    if (!isNaN(pin)) {} else { //Acomodar pins Analógicos chamando eles de 14 pra frente i.e. A0 vira pin 14, mais facil trabalhar com numeros e fazer uma array
      if (pin != undefined)
        pin = parseInt(pin.slice(1)) + 14;
    }
    console.log('escrevepin ' + pin)

    if (pintypeMap.get(pin) != undefined && pintypeMap.get(pin) != componente && pintypeMap.get(pin) != 'pinSetUp' && pintypeMap.get(pin) != 'pinWrite' && pintypeMap.get(pin) != 'pinRead') {
      console.log('Pin: ' + pin + ' tem estado de ' + pintypeMap.get(pin) + ' e o comando foi de ' + componente + '. Comando não vai ser executado.');
      return //bloqueando a priori, mas pode ver se tem um jeito de liberar o pin para trocar o tipo.
    }
    if (valor != undefined && ultimoValorPinMap.get(pin) == valor) { //tem algum caso que enviar o mesmo valor seria válido?
      console.log('Bloqueando valor duplicado para o mesmo pin.');
      return
    }
    pintypeMap.set(pin, componente);
    ultimoValorPinMap.set(pin, valor);


    if (componente == 'led') {
      if (!led[pin]) {
        console.log((new Date().toLocaleString()) + ' atribuiu novo LED. Pin ' + pin)
        led[pin] = new five.Led(pin);
      }
      var status = "OK";
      switch (valor) {
        case "on":
          led[pin].on();
          break;
        case "off":
          led[pin].off();
          break;
        case "blink":
          led[pin].blink();
          break;
        case "stop":
          led[pin].stop();
          break;
        default:
          status = "Unknown: " + valor;
          break;
      }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } else if (componente == 'servo') {
      if (!servo[pin]) {
        console.log((new Date().toLocaleString()) + ' atribuiu novo Servo. Pin ' + pin)
        servo[pin] = new five.Servos([pin]);
      }
      var status = "OK";
      switch (valor) {
        case "min": // 0 degrees
          servo[pin].min();
          //servo[pin].to('10'); //possívelmente alterar para ter um mínimo que não força o motor
          break;
        case "max":
          servo[pin].max();
          //servo[pin].to('170');
          break;
        case "stop": // use after sweep
          servo[pin].stop();
          break;
        case "sweep":
          servo[pin].sweep();
          break;
        default:
          if (!isNaN(valor)) {
            servo[pin].to(valor);
          } else {
            status = "Unknown: " + valor;
          }
          break;
      }
      console.log('status ' + status);
    } else if (componente == 'button') {
      if (button[pin]) {
        console.log('ja existe botão nesse pin num ' + pin)
        notificaCliente('botaostatus', pin, buttonStatus[pin]);
      } else {
        button[pin] = new five.Button({
          pin: pin,
          isPullup: true,
          holdtime: 1000
        });
        button[pin].on("down", function() {
          buttonStatus[pin] = "down";
          notificaCliente('botaostatus', pin, buttonStatus[pin]);
          console.log("down");
        });
        button[pin].on("up", function() {
          buttonStatus[pin] = "up";
          console.log("up");
          notificaCliente('botaostatus', pin, buttonStatus[pin]);
        });
      }
      console.log((new Date().toLocaleString()) + ' status ' + status);
    } else if (componente == 'pinSetUp') {
      var status = "OK";
      if (!pins[pin]) {
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
          pins[pin] = new five.Pin({
            pin: pin,
            mode: valor
          });
        } else {
          //console.log(' caiu no isNaN e tem valor ' + valor) // aindai não ta funcionando
          pins[pin] = new five.Pin({
            pin: '"' + pin + '"',
            mode: valor
          });
        }
      }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } else if (componente == 'pinWrite') {
      if (pins[pin]) {
        var status = "OK";
        pins[pin].write(parseInt(valor));
      } else {
        console.log(componente + ' já exite no pin ' + pin);
        var status = "KO";
      }
      console.log('status ' + status);
      // notificaCliente('status', pin, status); //pode enviar confirmação de status de execução pro netsblox.
    } else if (componente == 'pinRead') {
      if (pins[pin] && lastvaluepinread == -1) {
        pins[pin].read((error, value) => {
          var status = "OK";
          if (lastvaluepinread != value) {
            lastvaluepinread = value;
            notificaCliente('pinRead', pin, value);
          }

        });
      } else {
        console.log(componente + ' já exite no pin ' + pin);
        var status = "KO";
      }
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


/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');

var server = http.createServer(function(request, response) {
  console.log((new Date().toLocaleString()) + ' Received request for ' + request.url);
  response.writeHead(403);
  response.end();
});

server.listen(PORTA_Arduino, function() {
  console.log('---------------------------------------------------------------');
  console.log('       ' + (new Date().toLocaleString()) + ' Servidor ouvindo na porta ' + PORTA_Arduino);
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
  enviaMsgParaTodosClientes(componente + "," + pin + "," + valor);

}

function enviaMsgParaTodosClientes(evento) {
  for (var i = 0; i < wsServer.connections.length; i++) {
    wsServer.connections[i].send(evento);
  }

}
