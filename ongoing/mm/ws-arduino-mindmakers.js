///////////// Codigo Arduino

var clienteConectadoArduino = false;
var sala = "1";
let portaArduino = -1;



function ArduinoRecebeValor(componente, valor) {

  alert('ArduinoRecebeValor' + componente +','+valor );

}

function registraConexaoArduino(dado) {


  clienteConectadoArduino = true;
}

function registraDesconexaoArduino(dado) {

  console.log('entrou para deregistrar');
  clienteConectadoArduino = false;
  window.socket.close();

}



//----Inicia websocket----//


function statusConnectionArduino(portaArduino) {


  if (clienteConectadoArduino) {

    alert('WS client already connected ' + JSON.stringify(window.socket));

  } else {


    window.socket = new WebSocket("ws://127.0.0.1:" + portaArduino, 'echo-protocol');
    console.log('WebSocket Client Trying to Connect on Port: ' + portaArduino);

    window.socket.onopen = function() {
      let msg = JSON.stringify({
        "command": "ready"
      });

      if (portaArduino == 8085) {
        clienteConectadoArduino = true;
      }

      window.socket.send(msg);
      console.log('WebSocket Client Connected on Port: ' + portaArduino);

    };

    window.socket.onmessage = function(message) {
      if (portaArduino == 8085) {
        clienteConectadoArduino = true;

        if (message.data.toLowerCase().indexOf('desconectado') > -1) {

          registraDesconexaoArduino(message.data);

        } else if (message.data.indexOf('conectado') > -1) {

          setTimeout(function() {
            registraConexaoArduino(message.data);
          }, 1000);

        } else if (message.data.indexOf('COMANDO_FINAL') > -1) {
          // Indica finais de execução
          registraDesconexaoArduino();

        } else {

          let componenteValor = message.data.split(',');
          //alert('componentevalor'+componente)
          sendMessageArduino(componenteValor[0], componenteValor[1]);

        }

      }

    };

    window.socket.onerror = function() {
      if (portaArduino == 8085) {
        alert('Erro de conexão na porta: ', +portaArduino);
        registraDesconexaoArduino();
      }
    };

    window.socket.onclose = function(e) {
      if (portaArduino == 8085) {
        console.log("Connection closed." + e);
        console.log('echo-protocol Client Closed');
        clienteConectadoArduino = false;
        registraDesconexaoArduino();
      }
    };

    if (clienteConectadoArduino == 'false' && portaArduino == 8085) {
      setTimeout(statusConnectionmArduino, 3000);
    }

  }

};


function sendMessageArduino(comando, valor) {
  //alert(comando + ',' + valor)
  waitForSocketConnection(window.socket, function() {
    window.socket.send(JSON.stringify({
      comando: comando,
      valor: valor
    }));

    waitForSocketConnection(window.socket, function() {
      console.log('Arduino comando: ' + comando + ' valor: ' + valor);
    });

  });
};

function waitForSocketConnection(socket, callback) { //Valida que ws está aberta antes de mandar msg
  setTimeout(
    function() {
      if (socket.readyState === 1) {
        if (callback !== undefined) {
          callback();
        }
        return;
      } else {
        waitForSocketConnection(socket, callback);
      }
    }, 5);
};
