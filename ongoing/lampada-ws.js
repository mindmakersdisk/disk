#!/usr/bin/env node

/*
  Interaçao com lampada flydea blueooth gabriel
*/
const PORTA_LampBLE = 8090;

var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
const readline = require('readline');
var fs = require('fs');

fs.readFile('/home/mindmakers/school.info', function(err, data) {
  if (err) {
    console.log("Essa estação ainda não está ativada. Ative antes de usar este serviço");
    process.exit(1);
  } else {
    escolainfo = data.toString();
    escolaidIni = escolainfo.indexOf('Cód.:') + 5;
    escolaid = escolainfo.substring(escolaidIni, escolainfo.indexOf('||'), escolaidIni).trim();
    salaIni = escolainfo.indexOf('Sala:') + 5
    sala_registrado = escolainfo.substring(salaIni, escolainfo.indexOf('||', salaIni)).trim();
    estacaoIni = escolainfo.indexOf('Estação:') + 8
    estacao_registrado = escolainfo.substring(estacaoIni, escolainfo.indexOf('||', estacaoIni)).trim();

    console.log('Pegou os valores do school.info');

    procuraLampada();
  }

});


// var ks = require('node-key-sender');
// var inquirer = require('inquirer');

const maclampada1 = 'ff:ff:f0:02:d1:14';
const maclampada2 = 'ff:ff:80:05:5d:90';

/*************************************************************
 * Comandos
 ************************************************************/
const LAMPADA_RGB = 'lampadargb';
const LAMPADA_BRANCA = 'lampadabranca';

//56 RR GG BB 00 f0 aa     ------
//   RR GG BB são valores de 00 a ff de cores mensagem a mandar

var ledColorRed = new Buffer([0x56, 0xff, 0x00, 0x00, 0x00, 0xf0, 0xaa]);
var ledColorGreen = new Buffer([0x56, 0x00, 0xff, 0x00, 0x00, 0xf0, 0xaa]);
var ledColorBlue = new Buffer([0x56, 0x00, 0x00, 0xff, 0x00, 0xf0, 0xaa]);


// 56 00 00 00 WW 0f aa
//             WW é o valor de intensidade de branco a mandar

var ledColorWhite100 = new Buffer([0x56, 0x00, 0x00, 0x00, 0xff, 0x0f, 0xaa]);
var ledColorWhite50 = new Buffer([0x56, 0x00, 0x00, 0x00, 0x7d, 0x0f, 0xaa]);
var ledColorWhite10 = new Buffer([0x56, 0x00, 0x00, 0x00, 0x0a, 0x0f, 0xaa]);
var ledColorWhite0 = new Buffer([0x56, 0x00, 0x00, 0x00, 0x00, 0x0f, 0xaa]);


/*************************************************************
 * Conexão
 ************************************************************/
const serviceUuid = 'ffd5';
const signalCharacteristicUuid = 'ffd9';
const devName = "Triones";

var numeroScans = 0;

function procuraLampada() {
  noble.on('stateChange', (state) => {
    if (state === "poweredOn") {
      console.log('---------------------------------------------------------------');
      console.log('                    Serviço Bluetooth Ativo                    ');
      console.log('---------------------------------------------------------------');
      console.log('Procurando por uma LampadaBLE a menos de 2m para configurar...');
      noble.startScanning();

    } else {
      console.log('');
      console.error('\x1b[31m', 'O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
      console.error('\x1b[0m', '');
      noble.stopScanning();

    }
  });

  noble.on('discover', (peripheral) => {

    console.log('Investigando dispositivos Bluetooth Low Energy (BLE)...');
    numeroScans++;

    if (peripheral.advertisement.localName &&
      peripheral.advertisement.localName.includes(devName)
      //&& peripheral.rssi > -85
      //&& peripheral.address == maclampada2
    ) {

      console.log('\x1b[32m', 'Encontrou Lampada: ' + peripheral.address + ' [Nome: ' + peripheral.advertisement.localName +
        ', Conectável: ' + peripheral.connectable + ', RSSI: ' + peripheral.rssi + ']');
      console.log('');

      noble.stopScanning();

      conectaLampada(peripheral);
    }

    if (numeroScans >= 15) {
      console.error('\x1b[31m', 'Não foi possível encontrar um LampadaBLE ligado para Conectar.');
      console.error('\x1b[31m', 'Confira se ela está ligada.');
      console.error('\x1b[31m', 'Se tudo estiver ok, tente desligar e religá-la');
      console.error('\x1b[31m', 'e chame o serviço novamente.');
      console.error('\x1b[0m', '----------------------------------------------------------------------------');
      // Encerra com falha
      noble.stopScanning();
      setTimeout(encerraAposLeitura, 10000);
    }

  });
}

function encerraAposLeitura() {

  process.exit(1)

}

function erroConexao(error) {

  if (!error)
    error = "Dispositivo parece desligado";

  console.log('Erro de conexão: ' + error);

  notificaClienteDesconexao(error);

  notificouClienteConexao = false;

  macaddressConectado = null;
  // noble.stopScanning();
  //
  // noble.startScanning();
  // procuraLampada();

}

function notificaClienteDesconexao(error) {

  if (error = null) error = '';

  console.log('');
  console.error('\x1b[31m', 'Perdeu a conexão com o circuito eletrônico digital...');
  console.error('\x1b[0m', '');

  if (temClienteConectado()) {
    enviaMsgParaTodosClientes('desconectado:' + error);
  }
  notificouClienteConexao = false;
}

//Não tem pq é componente só de saida
// function notificaCliente(componente, valor) {
//   if (temClienteConectado()) {
//     enviaMsgParaTodosClientes(componente + "," + valor);
//   }
//
// }

function conectaLampada(peripheral) {

  peripheral.connect((error) => {
    console.log('connected to peripheral: ' + peripheral.uuid);
    var macaddressConectado = peripheral.uuid;

    peripheral.discoverServices(serviceUuid, (error, services) => {
      if (services.length > 0) {
        console.log('discovered device information service');

        var deviceInformationService = services[0];

        deviceInformationService.discoverCharacteristics(signalCharacteristicUuid, (error, characteristics) => {
          if (characteristics.length > 0) {
            console.log('discovered characteristic');

            var manufacturerNameCharacteristic = characteristics[0];

            servicoWritesData(deviceInformationService, manufacturerNameCharacteristic, ledColorRed, (comando) => {
              console.log('Executou o comando: ' + comando);
              console.log('aguardando novos comandos...')
            });

          } else {
            console.log('No characteristics found');

          }
        });

      } else {
        console.log('No services found');

      }

    });

  });


  peripheral.once('disconnect', (error) => {

    if (!error)
      error = " ";

    console.log('Desconectou. ', error);
    //erroConexao(error)

  });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

}


process.stdin.on('keypress', (str, key) => {

  if (key.ctrl && key.name === 'c') {

    process.exit();

  } else { //if (!modoRegistro) {
    //  console.log(`You pressed the "${str}" key`);
    if (key.name == '0') {
      lampComms.write(ledColorWhite0, true, function(error) {

      });
    }
    if (key.name == '1') {
      lampComms.write(ledColorWhite100, true, function(error) {

      });
    }
    if (key.name == '2') {
      lampComms.write(ledColorWhite50, true, function(error) {

      });
    }
    if (key.name == '3') {
      lampComms.write(ledColorWhite10, true, function(error) {

      });
    }
    if (key.name == 'r') {
      lampComms.write(ledColorRed, true, function(error) {

      });
    }
    if (key.name == 'g') {
      lampComms.write(ledColorGreen, true, function(error) {

      });
    }
    if (key.name == 'b') {
      lampComms.write(ledColorBlue, true, function(error) {

      });
    }

  }
});

// Recebe valor entre 0 e 255 para cada cor e escreve para circuito se conectado.
function escreveParaCircuito(comando, valor) {
  //console.log('comando: '+comando+',valor: '+valor)

  if (comando == LAMPADA_RGB) {
    var ledColorRGB = new Buffer([0x56, 0x01, 0x01, 0x01, 0x00, 0xf0, 0xaa]);

    var valorRGB = valor.split(',');
    var red = valorRGB[0];
    var green = valorRGB[1];
    var blue = valorRGB[2];

      if (red > 255)
        red = 255;
      else if (red < 0)
        red = 0;

      if (green > 255)
        green = 255;
      else if (green < 0)
        green = 0;

      if (blue > 255)
        blue = 255;
      else if (blue < 0)
        blue = 0;

      ledColorRGB.writeUInt8(parseInt(red), 1); //RED
      ledColorRGB.writeUInt8(parseInt(green), 2); //GREEN
      ledColorRGB.writeUInt8(parseInt(blue), 3); //BLUE

      lampComms.write(ledColorRGB, true, function(error) {

      });

  } else if (comando == LAMPADA_BRANCA) {
    var ledWhite = new Buffer([0x56, 0x00, 0x00, 0x00, 0x7d, 0x0f, 0xaa]);

    if (valor > 255)
      valor = 255;
    else if (valor < 0){
      valor = 0;
    }

    ledWhite.writeUInt8(parseInt(valor), 4)

    lampComms.write(ledWhite, true, function(error) {

    });

  } else {
    console.log('comando não encontrado: ' + comando)

  }

}

function servicoWritesData(services, characteristics, comando, cb) {
  lampComms = characteristics;
  if (comando != '') {
    lampComms.write(comando, true, (error) => {
      if (error) {
        console.log('erro: ' + error)
      }

      if (cb !== undefined)
        cb(comando);

    });

  } else {
    console.log('Comando vazio: ' + comando);

  }
}

function temClienteConectado() {
  return wsServer != null && wsServer.connections != null && wsServer.connections[0] != null

}

/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');

var server = http.createServer(function(request, response) {
  // console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(403);
  response.end();

});

server.listen(PORTA_LampBLE, function() {
   console.log('---------------------------------------------------------------');
   console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta ' +PORTA_LampBLE);
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

  if (temClienteConectado()) {
    //enviaMsgParaTodosClientes('conectado:' + macaddressConectado + ',sala:' + sala_registrado + ',estacao:' + estacao_registrado + ',escola:' + escolaid);
    notificouClienteConexao = true;
    contadorIntervalo = 0;
  }

  connection.on('message', function(message) {
    //console.log('RECEBEU MENSAGEM ' + JSON.stringify(message));
    let comandoValor = JSON.parse(message.utf8Data);
    escreveParaCircuito(comandoValor.comando, comandoValor.valor);

  });

  connection.on('close', function(reasonCode, description) {
    console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
  });

});

function enviaMsgParaTodosClientes(evento) {
  for (let i = 0; i < wsServer.connections.length; i++) {
    wsServer.connections[i].send(evento);
  }
}
