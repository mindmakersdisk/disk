///////////// Codigo mBot

var clienteConectadoMBOT = false;
var sala = "1";
let porta = -1;
let comando = '';
let valor = '';
let motor = '';

const LINESENSOR = 'linesensor';
const ULTRASOUNDSENSOR = 'ultrasoundsensor';
const LIGHTSENSOR = 'lightsensor';
const BUTTON = 'button';
const BUTTON_PRESSED = 'pressed';
const BUTTON_RELEASED = 'released';
const IRSENSOR = 'irsensor';
const BUZZER = 'buzzer';
const DCMOTORM1 = 'dcmotorm1';
const DCMOTORM2 = 'dcmotorm2';
const DCMOTOR_FORWARD = 'forward';
const DCMOTOR_BACK = 'back';
const DCMOTORS = 'dcmotors';
const DCMOTORS_BACK = 'dcmotorsBack';
const DCMOTORS_RIGHT = 'dcmotorsRight';
const DCMOTORS_LEFT = 'dcmotorsLeft';
const SERVOMOTOR = 'servomotor';
const LEDLEFT = 'ledleft';
const LEDRIGHT = 'ledright';
const LEDBOTH = 'ledboth';
const PLAYNOTE = 'playnote';


// 0,1,2 ou 3
let line = 0;
// 0 a 1000
let light = 0;
// 0 a 400 cm
let ultrasound = 0;


let lastmsg = +new Date();;

function mBotRecebeValor(componente, valor) {
  if (componente == LINESENSOR) {
    line = parseInt(valor);

  } else if (componente == ULTRASOUNDSENSOR) {
    ultrasound = Math.trunc(parseFloat(valor));

  } else if (componente == LIGHTSENSOR) {
    light = Math.trunc(parseFloat(valor));

  } else if (componente == BUTTON) {
    button = valor;
    if (lastbutton != button) {
      lastbutton = button;
      console.log('button:', +button);
      console.log('e tem tipo:', typeof(button));
    }

  } else if (componente == IRSENSOR) {
    ir = valor;
    if (lastir != ir) {
      lastir = ir;
      console.log('ir:', +ir);
      console.log('e tem tipo:', typeof(ir));
    }

  }
}

function registraConexaoMBOT(dado) {
  //Recebe macaddress da unidade e sala correntemente registrada
  //console.log(dado);

  let msg = dado.split(',');
  let mac = msg[0].substring(10).toUpperCase();

  if (mac.indexOf(':') == -1)
    mac = mac.substring(0, 2) + ':' + mac.substring(2, 4) + ':' + mac.substring(4, 6) + ':' + mac.substring(6, 8) + ':' + mac.substring(8, 10) + ':' + mac.substring(10, 12);

  if (msg[1]) {
    sala = msg[1].substring(5);
    if (parseInt(msg[2].substring(8)) < 10 && msg[2].substring(8).indexOf('0') != 0)
      estacaoMBOT = '0' + msg[2].substring(8);
    else
      estacaoMBOT = msg[2].substring(8);
  }

  clienteConectadoMBOT = true;
}

function registraDesconexaoMBOT(dado) {

  console.log('entrou para deregistrar');
  clienteConectadoMBOT = false;
  window.socket.close();

}



//----Inicia websocket----//


function statusConnectionmBot(porta) {


  if (clienteConectadoMBOT) {
    alert('WS client already connected ' + JSON.stringify(window.socket));

  } else {


    window.socket = new WebSocket("ws://127.0.0.1:" + porta, 'echo-protocol');
    console.log('WebSocket Client Trying to Connect on Port: ' + porta);

    window.socket.onopen = function() {
      let msg = JSON.stringify({
        "command": "ready"
      });


      if (porta == 8081) {
        clienteConectadoMBOT = true;
      }

      window.socket.send(msg);
      console.log('WebSocket Client Connected on Port: ' + porta);

    };

    window.socket.onmessage = function(message) {
      if (porta == 8081) {
        clienteConectadoMBOT = true;

        if (message.data.toLowerCase().indexOf('desconectado') > -1) {

          registraDesconexaoMBOT(message.data);

        } else if (message.data.indexOf('conectado') > -1) {

          setTimeout(function() {
            registraConexaoMBOT(message.data);
          }, 1000);

        } else if (message.data.indexOf('COMANDO_FINAL') > -1) {
          // Indica finais de execução
          endReturn();
        } else {

          let componenteValor = message.data.split(',');
          //console.log('caiu no else, recebeu: '+componenteValor);
          mBotRecebeValor(componenteValor[0], componenteValor[1]);

        }

      }

    };

    window.socket.onerror = function() {
      if (porta == 8081) {
        alert('Erro de conexão na porta: ', +porta);
        registraDesconexaoMBOT();
      }
    };

    window.socket.onclose = function(e) {
      if (porta == 8081) {
        console.log("Connection closed." + e);
        console.log('echo-protocol Client Closed');
        clienteConectadoMBOT = false;
        registraDesconexaoMBOT();
      }
    };

    if (clienteConectadoMBOT == 'false' && porta == 8081) {
      setTimeout(statusConnectionmBot, 3000);
    }

  }

};



function sendMessagemBot(comando, valor) {
  //alert(comando + ',' + valor)
  waitForSocketConnection(window.socket, function() {
    window.socket.send(JSON.stringify({
      comando: comando,
      valor: valor
    }));

    waitForSocketConnection(window.socket, function() {
      console.log('mBot comando: ' + comando + ' valor: ' + valor);
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
