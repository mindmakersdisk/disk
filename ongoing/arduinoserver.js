"use strict";

var five = require("johnny-five"),
  board = new five.Board(),
  led = null,
  servos = null,
  button = null,
  servoPins = [9],
  express = require('express'),
  app = express(),
  port = 8000;

board.on("ready", function() {
  console.log("### Board ready!");
  led = new five.Led(13);
  servos = new five.Servos(servoPins);

  servos.center();

  // button = new five.Button(2);
  //
  // board.repl.inject({
  //   button: button
  // });
  //
  // // Button Event API
  //
  // // "down" the button is pressed
  // button.on("down", function() {
  //   console.log("down");
  // });
  //
  // // "hold" the button is pressed for specified time.
  // //        defaults to 500ms (1/2 second)
  // //        set
  // button.on("hold", function() {
  //   console.log("hold");
  // });
  //
  // // "up" the button is released
  // button.on("up", function() {
  //   console.log("up");
  // });

});

app.get('/led/:mode', function(req, res) {
  if (led) {
    var status = "OK";
    switch (req.params.mode) {
      case "on":
        led.on();
        break;
      case "off":
        led.off();
        break;
      case "blink":
        led.blink();
        break;
      case "stop":
        led.stop();
        break;
      default:
        status = "Unknown: " + req.params.mode;
        break;
    }
    console.log(status);
    res.send(status);
  } else {
    res.send('Board NOT ready!')
  }
});

app.get('/servos/:mode/:value?', function(req, res) {
  if (servos) {
    var status = "OK";
    var value = req.params.value; // optional, may be null
    switch (req.params.mode) {
      case "min": // 0 degrees
        servos.min();
        break;
      case "max":
        servos.max();
        break;
      case "stop": // use after sweep
        servos.stop();
        break;
      case "sweep":
        servos.sweep();
        break;
      case "to":
        if (value !== null) {
          servos.to(value);
        }
        break;
      default:
        status = "Unknown: " + req.params.mode;
        break;
    }
    console.log('status' + status);
    res.send(status);
  } else {
    res.send('Board NOT ready!')
  }
});

app.listen(port, function() {
  console.log('Listening on port ' + port);
});


function escreveParaCircuito(componente, valor) {

  if (componente == 'led') {
    var status = "OK";
    switch (valor) {
      case "on":
        led.on();
        break;
      case "off":
        led.off();
        break;
      case "blink":
        led.blink();
        break;
      case "stop":
        led.stop();
        break;
      default:
        status = "Unknown: " + componente;
        break;
    }
    console.log('status' + status);
    // res.send(status);
  } else if (componente == 'servo') {

    var status = "OK";
    switch (valor) {
      case "min": // 0 degrees
        servos.min();
        break;
      case "max":
        servos.max();
        break;
      case "stop": // use after sweep
        servos.stop();
        break;
      case "sweep":
        servos.sweep();
        break;
      default:
        if (!isNaN(valor)) {
          servos.to(valor);
        } else {
          status = "Unknown: " + componente;
        }
        break;
    }
    console.log('status' + status);

  } else {
    // res.send('Board NOT ready!')
    //alert('não era led')
    console.log('Componente ' + componente + 'não encontrado');
  }

}



/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');

var server = http.createServer(function(request, response) {
  // console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(403);
  response.end();
});

server.listen(8085, function() {
  //  console.log('---------------------------------------------------------------');
  //  console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta 8085');
  //  console.log('---------------------------------------------------------------');
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


    escreveParaCircuito(message.comando, message.valor);


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
