/*
 Mind Makers - mBot BLE Controller

 Paulo Alvim 04/2019
 Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/
// Registrados
const VERSAO = "2.9"
var escolainfo = ''
var escolaid = '';
var escolanome = '';
var pi_registrado = '';
var sd_registrado = '';
var sala_registrado = '1';
var estacao_registrado = '';
var sphero_registrado = '';
var littlebits_registrado = '';
var mbot_registrado = '';
var microbit_registrado = '';

var macaddressArg;

const request = require('request')
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');
//var KalmanFilter = require('kalmanjs');
//require('events').EventEmitter.defaultMaxListeners = 100;

/******************************************************************
 *  Perguntas, configuração do macaddress e registro na plataforma
 ******************************************************************/
var modoRegistro = true;


fs.readFile('/home/mindmakers/school.info', function(err, data) {
  if (err) {
    console.log("Essa estação ainda não está ativada. Ative antes de usar o mBot");
    process.exit(1);
  } else {


    escolainfo = data.toString();
    escolaidIni = escolainfo.indexOf('Cód.:') + 5;
    escolaid = escolainfo.substring(escolaidIni, escolainfo.indexOf('||'), escolaidIni).trim();
    //console.log(escolaid);
    escolanomeIni = escolainfo.indexOf('Nome:') + 5;
    escolanome = escolainfo.substring(escolanomeIni, escolainfo.indexOf('||', escolanomeIni)).trim();
    //console.log(escolanome);
    piIni = escolainfo.indexOf('Pi:') + 3;
    pi_registrado = escolainfo.substring(piIni, escolainfo.indexOf('||', piIni)).trim();
    //console.log(pi_registrado);
    sdIni = escolainfo.indexOf('SD:') + 3;
    sd_registrado = escolainfo.substring(sdIni, escolainfo.indexOf('||', sdIni)).trim();
    //console.log(sd_registrado);
    salaIni = escolainfo.indexOf('Sala:') + 5
    sala_registrado = escolainfo.substring(salaIni, escolainfo.indexOf('||', salaIni)).trim();
    //console.log(sala_registrado);
    estacaoIni = escolainfo.indexOf('Estação:') + 8
    estacao_registrado = escolainfo.substring(estacaoIni, escolainfo.indexOf('||', estacaoIni)).trim();
    //console.log(estacao_registrado);
    spheroIni = escolainfo.indexOf('Sphero:') + 7
    sphero_registrado = escolainfo.substring(spheroIni, escolainfo.indexOf('||', spheroIni)).trim();
    littlebitsIni = escolainfo.indexOf('littlebits:') + 11
    littlebits_registrado = escolainfo.substring(littlebitsIni, escolainfo.indexOf('||', littlebitsIni)).trim();
    mbotIni = escolainfo.indexOf('mbot:') + 5
    mbot_registrado = escolainfo.substring(mbotIni, escolainfo.indexOf('||', mbotIni)).trim();
    microbitIni = escolainfo.indexOf('microbit:') + 9
    microbit_registrado = escolainfo.substring(microbitIni, escolainfo.indexOf('||', microbitIni)).trim();

    macaddressArg = mbot_registrado;
    console.log('Identificou mBot configurado: ' + macaddressArg);

    if (macaddressArg != undefined && macaddressArg != null && macaddressArg != '' && macaddressArg != 'XX:XX:XX:XX:XX:XX') {

      // Tem um mBot configurado

      var acaoDefaultTemporal = setTimeout(acionaRegistradoTemporal, 7000);

      inquirer.prompt(questionsConfigurado).then(answers => {

        if (acaoDefaultTemporal)
          clearTimeout(acaoDefaultTemporal);

        if (answers.usarOuConfigurar == USAR_REGISTRADO) {
          // Conexão normal
          console.log('Vai conectar com mBot pré-configurado');
          controlaMbot();

        } else {
          // Registrar um novo
          console.log('Vai configurar um novo mBot');
          procurarNovoMbot();

        }


      });


    } else {

      // Não tem um mBot configurado
      procurarNovoMbot();

    }

  }

});

const USAR_REGISTRADO = "Usar Registrado";
const REGISTRAR_NOVO = "Registrar Novo";
const REGISTRAR = "Registrar";

var questionsConfigurado = [{
  type: 'list',
  name: 'usarOuConfigurar',
  message: "Usar mBot registrado ou registrar um novo?",
  default: USAR_REGISTRADO,
  choices: [USAR_REGISTRADO, REGISTRAR_NOVO]
}];

var questionsNaoConfigurado = [{
  type: 'list',
  name: 'configurar',
  message: "Aproxime um mBot energizado e com placa BLE, então aperte enter para configurá-lo nesta estação",
  default: REGISTRAR,
  choices: [REGISTRAR]
}];

var questionsInformar = [{
  type: 'input',
  name: 'macaddress',
  message: "Informe o macaddress com 12 digitos sem ':' (ex.: cd09654dbd23) para configurar manualmente." +
    " Ou aproxime o mBot e aperte enter para tentar mais uma vez..."
}];

/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoMbot() {

  if (macaddressArg == null || macaddressArg == '') {
    console.log('Não registrou o mBot porque não recebeu um macaddress válido');
    return;
  }

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
    "Cód.: " + escolaid + "||\n" +
    "Nome: " + escolanome + "||\n" +
    "Pi: " + pi_registrado + "||\n" +
    "SD: " + sd_registrado + "||\n" +
    "Sala: " + sala_registrado + "||\n" +
    "Estação: " + estacao_registrado + "||\n" +
    "Sphero: " + sphero_registrado + "||\n" +
    "littlebits: " + littlebits_registrado + "||\n" +
    "mbot: " + macaddressArg + "||\n" +
    "microbit: " + microbit_registrado + "||\n" +
    "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err, data) {
    if (err) {
      console.log(err);
      // Encerra com falha
      process.exit(1);
    } else {

      console.error('\x1b[32m', '---------------------------------------------------');
      console.error('\x1b[0m\x1b[32m', '----- Alterou a configuração para usar o mBot -----');
      console.error('\x1b[0m\x1b[1m', '            ' + macaddressArg);
      console.error('\x1b[0m\x1b[1m', '----- Chame novamente para começar a usar     -----');
      console.error('\x1b[0m\x1b[32m', '----- Esta janela fecha em 7 segundos...      -----');
      console.log('');

    }


  });

}

function encerraAposLeitura() {

  process.exit(1)

}

var autenticacao = [{
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



function registraMbotPlataforma() {

  console.log('Entrou para registrar na plataforma...');

  if (macaddressArg == null || macaddressArg == '')
    return;

  inquirer.prompt(autenticacao).then(autenticacao => {

    registraAposConferirAtivacao(autenticacao.login, autenticacao.senha);

  });

}

function registraAposConferirAtivacao(login, senha) {

  // Registra mBot
  // console.log('Registrando o Sphero "'+macaddressArg+'" na plataforma.');

  if (escolaid == undefined || escolaid == null || escolaid == '') {
    console.error('\x1b[31m', '----------------------------------------------------------------');
    console.error('\x1b[31m', 'Não registrou na plataforma porque esta estação não está ativada');
    console.error('\x1b[31m', '----------------------------------------------------------------');

  } else {


    request({
        url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
        method: 'POST',
        json: {
          'username': login,
          'password': senha,
          'tipo': 'mBot',
          'alocadoescola': escolaid,
          'chaveNatural': macaddressArg,
          'acao': 'registrar',
          'observacao': 'ativação automática'
        }
      },
      function(error, response, body) {
        // console.log('ERROR ---------------------------');
        // console.log(error);
        //   console.log('RESPONSE---------------------------');
        //   console.log(response);
        //  console.log('BODY---------------------------');
        //  console.log(body);
        if (!body.success || error) {
          if (!body.success) {
            console.error('\x1b[31m', 'Erro ao registrar mBot: ' + JSON.stringify(body.err));
          } else {
            console.error('\x1b[31m', 'Erro ao registrar mBot: ' + error);
          }
          noble.stopScanning();
          setTimeout(encerraAposLeitura, 15000);
        } else {
          console.log('\x1b[32m', 'mBot registrado na plataforma com sucesso! ');
          // Modifica o atalho e variável
          atualizaAtalhoMbot();
          noble.stopScanning();
          setTimeout(encerraAposLeitura, 10000);
        }
      }
    );

  }


}


var ks = require('node-key-sender');

function acionaRegistradoTemporal() {

  ks.sendKey('enter');

}

var numeroScans = 0;
var numeroTentativas = 0;

function procurarNovoMbot() {
  noble.removeAllListeners('stateChange');
  noble.removeAllListeners('discover');
  noble.removeAllListeners('disconnect');
  //console.log('Procurando por um mBot próximo para configurar...');

  // Procura por bluetooth

  noble.on('stateChange', function(state) {

    console.log('Estado = ' + state);
    if (state === 'poweredOn') {
      console.log('---------------------------------------------------------------');
      console.log('                    Serviço Bluetooth Ativo v' + VERSAO);
      console.log('---------------------------------------------------------------');

      console.log('Procurando pelo mBot com módulo BLE para conectar: ' + macaddressArg);
      noble.startScanning();
    } else {
      console.log('');
      console.error('\x1b[31m', 'O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
      console.error('\x1b[0m', '');
      noble.stopScanning();
      process.exit(1);
    }
  });


  noble.on('discover', function(peripheral) {

    console.log('Investigando dispositivos Bluetooth Low Energy (BLE)...');

    numeroScans++;

    //console.log(peripheral.advertisement);

    if (peripheral.advertisement.localName && peripheral.advertisement.localName.includes(devName) &&
      peripheral.rssi > -75) {

      console.log('\x1b[32m', 'Encontrou mBot:' + peripheral.address + ' [Nome:' + peripheral.advertisement.localName +
        ', Conectável:' + peripheral.connectable + ', RSSI:' + peripheral.rssi + ']');
      console.log('');

      noble.stopScanning();

      macaddressArg = peripheral.address;

      configurarNovoMbot();

      //console.log(peripheral);
      // console.log(peripheral);
      // console.log(peripheral.advertisement.serviceData);

    }

    if (numeroScans >= 50) {

      console.error('\x1b[31m', 'Não foi possível encontrar um mBot ligado para registrar.');
      console.error('\x1b[31m', 'Confira se ele está ligado com a placa BLE e luz branca piscando.');
      console.error('\x1b[31m', 'Se tudo estiver ok, tente novamente após desligar e ligar a antena Bluetooth');
      console.error('\x1b[31m', 'do computador, usando o atalho no canto superior direito.');
      console.error('\x1b[0m', '----------------------------------------------------------------------------');
      // Encerra com falha
      noble.stopScanning();
      setTimeout(encerraAposLeitura, 4000);

    }


  });

}

function configurarNovoMbot() {


  // Registra na plataforma (opcional)
  registraMbotPlataforma();


}


/*************************************************************
 * Serviços BLE para mbot daqui por diante
 ************************************************************/

//const noble   = require('noble');
const readline = require('readline');

const devName = "Makeblock_LE";
const mbotServiceUUID = "ffe1";
const mbotReadEndPointUUID = "ffe2";
const mbotWriteEndPointUUID = "ffe3";

/********************** VALORES HEXADECIMAIS DO FIRMWARE DO MBOT ******************************************
 *********************************************************************************************************/

const ir_A = 0x45;
const ir_B = 0x46;
const ir_C = 0x47;
const ir_D = 0x44;
const ir_E = 0x43;
const ir_F = 0x0D;
const ir_UP = 0x40;
const ir_DOWN = 0x19;
const ir_LEFT = 0x07;
const ir_RIGHT = 0x09;
const ir_SETTINGS = 0x15;
const ir_R0 = 0x16;
const ir_R1 = 0x0C;
const ir_R2 = 0x18;
const ir_R3 = 0x5E;
const ir_R4 = 0x08;
const ir_R5 = 0x1C;
const ir_R6 = 0x5A;
const ir_R7 = 0x42;
const ir_R8 = 0x52;
const ir_R9 = 0x4A;
///////////////////////////////
// var InfraRed = {
//     a: 0x45,
//     b: 0x46,
//     c: 0x47,
//     d: 0x44,
//     e: 0x43,
//     f: 0x0D,
//     up: 0x40,
//     down: 0x19,
//     left: 0x07,
//     right: 0x09,
//     settings: 0x15,
//     r0: 0x16,
//     r1: 0x0C,
//     r2: 0x18,
//     r3: 0x5E,
//     r4: 0x08,
//     r5: 0x1C,
//     r6: 0x5A,
//     r7: 0x42,
//     r8: 0x52,
//     r9: 0x4A
// };

/////////////////////////////
//teste mudar velocidade somente com um comando e um array de valores.
// var servo_value = [ 0x00, 0x2B, 0x5A, 0x87, 0xB4 ];
// var s = 0;
// var servo =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, servo_value[s]]);
//
// var motor_speed = [ 0x01, 0x64, 0x96, 0xC8, 0xFF];
// var m = 0;
// var motor_run =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, motor_speed[m], 0xFF, 0xFF - motor_speed[m], 0x00]);
// var motor_reverse =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF - motor_speed[m], 0x00, motor_speed[m], 0xFF]);
// var motor_turnright =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, motor_speed[m], 0xFF, motor_speed[m], 0xFF]);
// var motor_turnleft =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF - motor_speed[m], 0x00, 0xFF - motor_speed[m], 0x00]);

// //atualização servo
// servo[8] = servo_value[s];
//
// //atualização
// motor_run[6] = motor_speed[m];
// motor_run[8] = 0xFF - motor_speed[m];
//
// motor_reverse[6] =  0xFF - motor_speed[m];
// motor_reverse[8] =  0xFF - motor_speed[m];
//
// motor_turnright[6] = motor_speed[m];
// motor_turnright[8] = motor_speed[m];
//
// motor_turnleft[6] = 0xFF - motor_speed[m];
// motor_turnleft[6] = 0xFF - motor_speed[m];
////////////////////////

// For demo purposes
// Some commands:

// Onboard RGB WS2812 leds
var ledColor0 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x00, 0x00, 0x00, 0x00]);
var ledColor1 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x00, 0xff, 0xFF, 0x00]);
var ledColor2 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x00, 0x00, 0x00, 0xFF]);

var ledRight1 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x01, 0xff, 0xFF, 0x00]);
var ledRight2 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x01, 0xff, 0xFF, 0x00]);

var ledLeft1 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x02, 0xff, 0xFF, 0x00]);
var ledLeft2 = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x02, 0xff, 0xFF, 0x00]);


// Led Matrix connected to Port 0x04  -----------------------v
var face = new Buffer([0xff, 0x55, 0x17, 0x00, 0x02, 0x29, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00]);

// Read Ultrasensor data
var readUS = new Buffer([0x07, 0xff, 0x55, 0x04, 0x00, 0x01, 0x01, 0x03]);

// Altecacoes de valores dos buffers do readUS, readLightSensor e readLineFollower
// feitas a partir de padroes extraidos do app do scratchx e como o buffer se apresenta la.


//**************************************************
//     ff    55      len idx action device port slot data a
//      0     1       2   3   4      5      6    7    8
//      0xff  0x55   0x4 0x3 0x1    0x1    0x1  0xa
// ***************************************************/

//o valor de 0x03 é o device(sensor de luz), e o 0x06 é a port(onborard)
// Sensor de luz
var readLightSensor = new Buffer([0x07, 0xff, 0x55, 0x04, 0x18, 0x01, 0x03, 0x06]);

// Segue linha
var readLineFollower = new Buffer([0x07, 0xff, 0x55, 0x04, 0x08, 0x01, 0x11, 0x02]);

//Lê segue linha, botão A
var readIR = new Buffer([0xff, 0x55, 0x05, 0x00, 0x01, 0x1E, 0x00, 0x45]);

//Botão onboard pressionado?
var read_onboard_button_pressed = new Buffer([0xFF, 0X55, 0x05, 0x00, 0x01, 0x23, 0x07, 0x00]);

//Botão onboard não pressionado?
var read_onboard_button_released = new Buffer([0xFF, 0X55, 0x05, 0x00, 0x01, 0x23, 0x07, 0x01]);

// Motor m1 - horario - frente 255
var motor_m1 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x09, 0x01, 0xFF]);

// Motor m2 -  horario - frente 255
var motor_m2 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x0A, 0xFF, 0x00]);

//ambos motores param
var motor_stop = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x00]);

//ambos motores avançam a 255
var motor_run255 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0xFF, 0x00]);

var motor_run100 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xaa, 0xFF, 0x55, 0x00]);

//ambos motores dão ré a 255
var motor_reverse255 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF, 0x00, 0x01, 0xFF]);

var motor_reverse100 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x55, 0x00, 0xaa, 0xFF]);

//ambos motores viram a direita a 255
var motor_turnright255 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0x01, 0xFF]);

//ambos motores viram a direita a 100
var motor_turnright100 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xaa, 0xFF, 0xaa, 0xFF]);

//ambos motores viram a esquerda a 255
var motor_turnleft255 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF, 0x00, 0xFF, 0x00]);

//ambos motores viram a esquerda a 100
var motor_turnleft100 = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x55, 0x00, 0x55, 0x00]);

//servo na porta 1, slot 1, 0 graus
var servo_0 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x00]);

//servo na porta 1, slot 1, 45 graus
var servo_1 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x2B]);

//servo na porta 1, slot 1, 90 graus
var servo_2 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x5A]);

//servo na porta 1, slot 1, 135 graus
var servo_3 = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x87]);

//servo na porta 1, slot 1, 180 graus - exagerado
//var servo_4 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0xB4]);

// Buzzer
var buzz = new Buffer([0xff, 0x55, 0x07, 0x00, 0x02, 0x22, 0x06, 0x01, 0xf4, 0x01]);

//**************************************************
//     ff    55      len idx action device port slot data a
//      0     1       2   3   4      5      6    7    8
//      0xff  0x55   0x4 0x3 0x1    0x1    0x1  0xa
// ***************************************************/


/********************** VALORES HEXADECIMAIS DO FIRMWARE DO MBOT  - FIM **********************************
 *********************************************************************************************************/

// For cycling demo
var loop = 1;
var contadorIntervalo = 0;
var macaddressConectado = null;
var notificouClienteConexao = false;
var monitoriaTask = null;


function controlaMbot() {

  modoRegistro = false;
  noble.removeAllListeners('stateChange');
  noble.removeAllListeners('discover');
  noble.removeAllListeners('disconnect');

  noble.on('stateChange', function(state) {
    console.log('mudou estado para ' + state)
    if (state === 'poweredOn') {
      console.log('---------------------------------------------------------------');
      console.log('                    Serviço Bluetooth Ativo v' + VERSAO);
      console.log('---------------------------------------------------------------');

      console.log('Procurando pelo mBot com módulo BLE para conectar: ' + macaddressArg);
      noble.startScanning();
    } else {
      console.log('');
      console.error('\x1b[31m', 'O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
      console.error('\x1b[0m', '');
      noble.stopScanning();
      // process.exit(1);
    }
  });



  noble.on('discover', function(peripheral) {

    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;

    console.log('Encontrou ' + peripheral.address);
    numeroScans++;

    if (peripheral.address == macaddressArg) {

      //     console.log('! Found device with local name: ' + localName );
      //     console.log('- Connecting to ' + localName + ' ['+ peripheral.id + ']');

      connectTombot(peripheral);

    } else if (numeroScans >= 50) {

      console.error('\x1b[31m', 'Não foi possível encontrar o mBot registrado para conectar.');
      console.error('\x1b[31m', 'Confira se ele está ligado com a placa BLE e luz branca piscando.');
      console.error('\x1b[31m', 'Se tudo estiver ok, tente novamente após desligar e ligar a antena Bluetooth');
      console.error('\x1b[31m', 'do computador, usando o atalho no canto superior direito.');
      console.error('\x1b[0m', '----------------------------------------------------------------------------');
      // Encerra com falha
      noble.stopScanning();
      setTimeout(encerraAposLeitura, 4000);

    }

  });

  noble.on('disconnect', function(data) {

    console.log('mBot desconectado' + data);

    podeConectar = false;

    notificaClienteDesconexao('bluetooth desconectado');

    notificouClienteConexao = false;
    macaddressConectado = null;

  });


  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');


  console.log("Finalizou controle");

}


process.stdin.on('keypress', (str, key) => {

  //console.log(modoRegistro);

  if (macaddressConectado == null && podeConectar) {
    console.log('Não aceita comandos de tecla porque mBot está sem conexão bluetooth.');
    return;
  }


  if (key.ctrl && key.name === 'c') {

    process.exit();

  } else if (!modoRegistro) {
    //  console.log(`You pressed the "${str}" key`);



    if (key.name == 'space') {
      mbotWComms.write(motor_stop, true, function(error) {
        //console.log("motores param");
      });
    }

    if (key.name == 'up') {
      mbotWComms.write(motor_run100, true, function(error) {
        //console.log("ambos motores para frente");
      });
    }
    if (key.name == 'w') {
      mbotWComms.write(motor_run100, true, function(error) {
        //console.log("ambos motores para frente");
      });
    }

    if (key.name == 'down') {
      mbotWComms.write(motor_reverse100, true, function(error) {
        //console.log("ambos motores para trás");
      });
    }
    if (key.name == 's') {
      mbotWComms.write(motor_reverse100, true, function(error) {
        //console.log("ambos motores para trás");
      });
    }

    if (key.name == 'right') {
      mbotWComms.write(motor_turnright100, true, function(error) {
        //console.log("ambos motores viram para direita");
      });
    }
    if (key.name == 'd') {
      mbotWComms.write(motor_turnright100, true, function(error) {
        //console.log("ambos motores viram para direita");
      });
    }

    if (key.name == 'left') {
      mbotWComms.write(motor_turnleft100, true, function(error) {
        //console.log("ambos motores viram para esquerda");
      });
    }
    if (key.name == 'a') {
      mbotWComms.write(motor_turnleft100, true, function(error) {
        //console.log("ambos motores viram para esquerda");
      });
    }

    if (key.name == '0') {
      mbotWComms.write(ledColor0, true, function(error) {
        //console.log("Write Led Color1 OK");
      });
    }

    if (key.name == '1') {
      mbotWComms.write(ledColor1, true, function(error) {
        //   console.log("Write Led Color1 OK");
      });
    }
    if (key.name == '2') {
      mbotWComms.write(ledColor2, true, function(error) {
        // console.log("Write Led Color2 OK");
      });
    }
    if (key.name == '3') {
      mbotWComms.write(buzz, true, function(error) {
        //console.log("Barulho");
      });
    }
    if (key.name == '4') {
      mbotWComms.write(servo_0, true, function(error) {
        //console.log("servo a 0 graus");
      });
    }
    if (key.name == '5') {
      mbotWComms.write(servo_1, true, function(error) {
        //console.log("servo a 45 graus");
      });
    }
    if (key.name == '6') {
      mbotWComms.write(servo_2, true, function(error) {
        //console.log("servo a 90 graus");
      });
    }
    if (key.name == '7') {
      mbotWComms.write(servo_3, true, function(error) {
        //  console.log("servo a 135 graus");
      });
    }


    //   console.log();
    //   console.log(key);
    //   console.log();
  }
});


function notificaClienteDesconexao(error) {

  contClient = 0;

  // podeConectar=false;

  if (error = null) error = '';

  console.log('');
  console.error('\x1b[31m', 'Notificou MMBlockly...');
  console.error('\x1b[0m', '');


  if (temClienteConectado()) {
    enviaMsgParaTodosClientes('desconectado:' + error);
  }

}

/**
 * ENVIA VALORES DE SENSORES E OUTROS COMANDOS PARA MMBLOCKLY
 */
function notificaCliente(componente, valor) {

  if (temClienteConectado() && !desprezaSinal(componente, valor)) {
    enviaMsgParaTodosClientes(componente + "," + sinalEstavel(componente, valor));
  }

}

let ultimoSinalSom = 0;
let ultimoSinalLuz = 0;

function desprezaSinal(componente, valor) {

  if (componente == ULTRASOUNDSENSOR) {


    if (valor != 400 && Math.abs(Math.round(valor) - ultimoSinalSom) <= 2)
      return true;

    ultimoSinalSom = Math.round(valor);

    if (valor < 400 || (valor == 400 && cont400 == 10)) {
      cont400 = 0;
      return false;
    } else {
      cont400++;

      return true;
    }
  } else if (componente == LIGHTSENSOR) {

    if (Math.abs(Math.round(valor) - ultimoSinalLuz) <= 40)
      return true;

    ultimoSinalLuz = Math.round(valor);

  }

  return false;

}

/**
 *ESTABILIZA SINAIS, NO CASO DOS SENSORES DE SOM E LUZ
 */
//var kfLuz = new KalmanFilter({R:0.01,Q:3});
//var kfUltrassom = new KalmanFilter({R:1.0,Q:10});
let cont400 = 0;

function sinalEstavel(componente, valor) {

  if (componente != LIGHTSENSOR && componente != ULTRASOUNDSENSOR)
    return Math.round(valor);

  // Se for sensor de luz ou ultrasom, estabiliza sinal com filtro kalman e só envia se for diferente do último enviado
  // caso tenha se passado menos de 1 segundo.
  if (componente == LIGHTSENSOR) {
    // console.log('valor original '+Math.round(valor));
    return Math.round(valor);
  }

  if (componente == ULTRASOUNDSENSOR) {

    // valorFiltrado = Math.round(kfUltrassom.filter(valor));
    // console.log('valor original '+Math.round(valor));
    if (valor == 400)
      return 400;
    else
      return Math.round(valor);
  }

}

function temClienteConectado() {

  return wsServer != null && wsServer.connections != null && wsServer.connections[0] != null

}

function decimalParaHexa(numeroDecimal) {

  var hexString = numeroDecimal.toString(16);
  return parseInt(hexString, 16);

}

const charReadUUIDs = [mbotReadEndPointUUID];
const charWriteUUIDs = [mbotWriteEndPointUUID];
var mbotService;
var characteristics;
let reconectouUmaVez = false;

function connectTombot(peripheral) {

  peripheral.removeAllListeners('servicesDiscover');
  peripheral.removeAllListeners('connect');
  peripheral.removeAllListeners('disconnect');

  peripheral.connect(error => {

    if (error) {
      console.log('Erro ao tentar conectar: ' + error);
      notificaClienteDesconexao(error);
      return;
    }

    // console.log('\x1b[0m\x1b[32m', 'Comunicação com robô mBot via bluetooth ativada: ' + peripheral.address);
    // console.log('\x1b[0m',        '-------------------------------------------------');

    macaddressConectado = peripheral.uuid;

    if (temClienteConectado()) {
      enviaMsgParaTodosClientes('conectado:' + macaddressConectado);
      notificouClienteConexao = true;
    }

    // Serviço e caracteristicas a serem descobertas
    const serviceUUIDs = [mbotServiceUUID];
    var allowDuplicates = true; // default: false

    //const charReadUUIDs  = [mbotReadEndPointUUID];
    // const charWriteUUIDs = [mbotWriteEndPointUUID];

    // Caracteristica BLE que queremos encontrar
    // Se especificar as características read e write como um array, noble retorna um array vazio.
    // Então filtra após descobrir.

    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, [], function(error, services, chars) {
      //  console.log('error='+error+" services = "+services+' chars='+chars+' repetiu='+repetiu);

      mbotService = services[0];
      //  console.log("Characte: " , chars[0].uuid);
      //  console.log("Characte: " , chars[1].uuid);

      characteristics = chars;

      // Se não notificou cliente da conexão notifica agora
      if (temClienteConectado() && !notificouClienteConexao) {
        //console.log('Entrou para notificar conexao');
        enviaMsgParaTodosClientes('conectado:' + peripheral.uuid);
        notificouClienteConexao = true;

      }

      if (!error) {
        //  console.log("Descobriu serviços do mBot...");

        for (var i in chars) {
          // console.log("vai comparar "+chars[i].uuid+" com "+mbotReadEndPointUUID);
          if (chars[i].uuid == mbotReadEndPointUUID)
            mbotReadDataDriver(error, mbotService, chars[i]);
          //console.log("vai comparar "+chars[i].uuid+" com "+mbotWriteEndPointUUID);
          if (chars[i].uuid == mbotWriteEndPointUUID)
            mbotWriteDataDriver(error, mbotService, chars[i]);
        }

        // console.log("- End scanning BLE characteristics.");
      } else {
        console.log("Não encontrou serviços BLE para o mBot...");
      }
    });


  });


  peripheral.on('disconnect', () => {


    macaddressConectado = null;

    notificaClienteDesconexao('mBot foi desconectado');

    podeConectar = false;

    if (reconectouUmaVez) {
      console.error('\x1b[0m', '');
      console.error('\x1b[0m', '');
      console.error('\x1b[31m', 'mBot foi desconectado.');
      console.error('\x1b[31m', 'Feche a janela e inicie novamente.');
      console.error('\x1b[0m', '');
      console.error('\x1b[0m', '');
      process.exit(1);
    } else {
      console.error('\x1b[31m', 'mBot foi desconectado. Tentando reconexão');
      setTimeout(recuperaConexao, 3000);
    }


    /*
    let tentativas=0;

    var shouldReconnect = setInterval(() => {
      //console.log(peripheral.state);
      //tenta reconexão a cada 5 segundos por 10 vezes, senao aborta
      tentativas++;
      if (peripheral.state == 'disconnected' && tentativas<=20)
        connectTombot(peripheral);
      else
        process.exit(1);

    }, 5000);
*/
    //noble.startScanning();
  });
}

function recuperaConexao() {
  //reconectouUmaVez = true;
  noble.startScanning();
}

var ultimoContador = -1;

function monitoraDispositivoConectado() {

  if (contadorIntervalo == ultimoContador) {

    // console.log('contadorIntervalo=' + contadorIntervalo + ' e ultimoContador=' + ultimoContador);

    ultimoContador = contadorIntervalo;

    // Assume que conexão está congelada
    notificaClienteDesconexao('congelado');

    clearInterval(monitoriaTask);

    noble.startScanning();

  } else {
    ultimoContador = -1;
  }

}

var sensoresUtilizados = [];

var podeConectar = null;

function mbotReadDataDriver(error, services, characteristics) {

  var mbotRComms = characteristics;
  //  console.log('services='+services);
  //  console.log('! mbot READ BLE characteristic found.'+mbotRComms);
  // subscribe to be notified whenever the peripheral update the characteristic
  //garantir nao subscreve mais de uma vez (maxEventLisners)
  mbotRComms.unsubscribe(() => {
    // console.log('unsubscreveu');
    mbotRComms.subscribe(error => {
      //  console.log('subscreveu');
      //  console.log(' .');
      if (error) {
        console.error('Erro ao subscrever para ouvir características do mbot BLE');
        notificaClienteDesconexao(error);
      } else {
        console.log('\x1b[0m', '-------------------------------------------------------------');
        console.log('\x1b[0m\x1b[32m', '                Controlador mBot Ativo v' + VERSAO);
        console.log('\x1b[0m', '-------------------------------------------------------------');
        console.log('\x1b[0m', '------------  TESTE E CONTROLE POR TECLADO   ----------------');
        console.log('\x1b[0m', '------------                                 ----------------');
        console.log('\x1b[0m', '------------      SETAS > MOTORES            ----------------');
        console.log('\x1b[0m', '------------      BARRA DE ESPAÇO > PARE     ----------------');
        console.log('\x1b[0m', '------------      1 > LUZ AMARELA            ----------------');
        console.log('\x1b[0m', '------------      2 > LUZ AZUL               ----------------');
        console.log('\x1b[0m', '------------      3 > BUZINA                 ----------------');
        console.log('\x1b[0m', '------------      4 > SERVO 0º               ----------------');
        console.log('\x1b[0m', '------------      5 > SERVO 45º              ----------------');
        console.log('\x1b[0m', '------------      6 > SERVO 90º              ----------------');
        console.log('\x1b[0m', '------------      7 > SERVO 135º             ----------------');
        console.log('\x1b[0m', '------------                                 ----------------');
        console.log('\x1b[0m', '-------------------------------------------------------------');
        console.log('\x1b[0m', '--- Se for o primeiro uso, teste todos os comandos acima! ---');
        console.log('\x1b[0m', '-------------------------------------------------------------');
        podeConectar = true;
        monitoriaTask = setInterval(monitoraDispositivoConectado, 3000);

      }

    });

  });

  //console.log('vai ouvir data');

  //var bufAnterior=new Buffer(4);
  // data callback receives notifications
  mbotRComms.on('data', (data, isNotification) => {

    // console.log('> mbot data received: "' + data.toString('hex') + '"');

    //contadorIntervalo++;

    /* Se não notificou cliente da conexão notifica agora
    if (temClienteConectado() && (contadorIntervalo == 300 || !notificouClienteConexao)) {
      //console.log('Entrou para notificar conexao');
      enviaMsgParaTodosClientes('conectado:' + macaddressConectado);
      notificouClienteConexao = true;
      contadorIntervalo = 0;
    }
    * */

    // ENVIA-DADOS-SENSORES

    // This doesn't work all the time.
    // We are epecting that the received data is a complete answer starting by 0xff and 0x55
    // To be perfect we need to "slide" the buffer looking for 0xff0x55
    //console.log(data);
    if (data[0] == 0xff && data.length >= 10) // Command header
      if (data[1] == 0x55)
        if (data[3] == 0x2) { // Float value
          var buf = new Buffer(4);
          buf[3] = data[4];
          buf[2] = data[5];
          buf[1] = data[6];
          buf[0] = data[7];
          // console.log('passou '+data);
          //console.log(data.length);

          // if (buf!=bufAnterior) {
          //   bufAnterior=buf;
          //   //console.log('buffer = '+buf.toString('hex'));
          // }

          var b = new ArrayBuffer(4);
          var v = new DataView(b);
          buf.forEach(function(b, i) {
            v.setUint8(i, b);
          });

          // console.log("float: " + v.getFloat32(0) );
          //console.log("teste: " + JSON.stringify(data));

          //Alteracao condicionais para isolar sensores que sao recebidos

          if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[0] && data[2] == 0x08) {
            // Mitiga problema de contaminação. TODO Melhorar em versão 1.01
            if (v.getFloat32(0) >= 0 && v.getFloat32(0) <= 4)
              notificaCliente(LINESENSOR, v.getFloat32(0))
            //poolSensor = 1;
          }

          if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[1] && data[2] == 0x18) {
            // Despreza zeros porque ocorre eventualmente por algum motivo
            // Vai de 0 a 1000
            if (v.getFloat32(0) > 0 && v.getFloat32(0) <= 1000)
              notificaCliente(LIGHTSENSOR, v.getFloat32(0))
            //poolSensor = 2;
          }

          if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[2] && data[2] == 0x00) {
            // Vai de 0 a 400
            if (v.getFloat32(0) > 4 && v.getFloat32(0) <= 400)
              notificaCliente(ULTRASOUNDSENSOR, v.getFloat32(0))
            // poolSensor = 0;
          }

        }

  });

}

var mbotWComms = null;

const SUBSCRICAO = 'subscricao';
const REMOVESUBSCRICAO = 'removesubscricao';
var usaSensorLinha = false;
var usaSensorLuz = false;
var usaSensorUltrasom = false;
let leituraSensoresIntervalo = null;

function mbotWriteDataDriver(error, services, characteristics) {
  mbotWComms = characteristics;

  //console.log('! mbot WRITE BLE characteristic found.'+error+ 'caract='+characteristics );

  // SOLICITA-DADO-SENSOR

  // create an interval to send data to the service
  let count = 0;

  leituraSensoresIntervalo = setInterval(() => {
    count++;

    // Se somente usa sensor de linha, evita fazer pooling com os demais.
    if (sensoresUtilizados[0] && !sensoresUtilizados[1] && !sensoresUtilizados[2])
      cont = 1;

    let par = (count % 2) == 0;

    //const message = new Buffer('hello, ble ' + count, 'utf-8');

    // Lê dados do sensor de luz
    //Leitura de dados:
    //resposta 3, sem linha
    //resposta 2, apenas esquero em cima da linha
    //resposta 1, apenas direito em cima da linha
    //resposta 0, ambos  em cima da linha
    //
    if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[0] && !par) {
      // console.log("Lendo dados do sensor de segue linha...");
      mbotWComms.write(readLineFollower, true, function(error) {});

    }

    if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[1] && par) {
      //  console.log("Lendo dados do sensor de luz...");

      mbotWComms.write(readLightSensor, true, function(error) {

      });

    }

    if (sensoresUtilizados && sensoresUtilizados.length > 0 && sensoresUtilizados[2] && par) {
      //  console.log("Lendo dados do sensor ultrassom...");

      mbotWComms.write(readUS, true, function(error) {

        }

      );

    }

  }, 50);
}




const BUZZER = 'buzzer';

const DCMOTORM1 = 'dcmotorm1';
const DCMOTORM2 = 'dcmotorm2';
const DCMOTOR_FORWARD = 'forward';
const DCMOTOR_BACK = 'back';

// Velocidade na posição 8
const DCMOTORS = 'dcmotors';
const DCMOTORS_BACK = 'dcmotorsBack';
const DCMOTORS_RIGHT = 'dcmotorsRight';
const DCMOTORS_LEFT = 'dcmotorsLeft';

const SERVOMOTOR = 'servomotor';
const LEDLEFT = 'ledleft';
const LEDRIGHT = 'ledright';
const LEDBOTH = 'ledboth';
const PLAYNOTE = 'playnote';

const LINESENSOR = 'linesensor';
const ULTRASOUNDSENSOR = 'ultrasoundsensor';
const LIGHTSENSOR = 'lightsensor';

const BUTTON = 'button';
const BUTTON_PRESSED = 'pressed';
const BUTTON_RELEASED = 'released';

const IRSENSOR = 'irsensor';

const COMANDO_FINAL = "comandoFinal";

function retornaFim() {

  notificaCliente(COMANDO_FINAL, "");

}

// Recebe comando obtido do Blockly e envia para mBot.
function escreveParaMBot(comando, valor) {

  // Se nao está conectado no bluetooth, nao tenta enviar
  if (macaddressConectado == null && podeConectar) {
    console.log('Evitou comando ' + comando + '=' + valor + ' porque identificou que o mBot está sem conexão bluetooth.');
    return;
  }

  if (comando == COMANDO_FINAL) {
    // Devolve mensagem após 5 segundos, avisando que execução finalizou.
    setTimeout(retornaFim, 2000);
  }

  // Para de ouvir sensores
  if (comando == REMOVESUBSCRICAO) {
    sensoresUtilizados[0] = false;
    sensoresUtilizados[1] = false;
    sensoresUtilizados[2] = false;
  }

  // Comando que apenas restringe a captura de sensores
  if (comando == SUBSCRICAO) {

    // console.log('valor subscricao = '+valor);
    sensoresUtilizadosStr = valor.split(',');

    if (sensoresUtilizadosStr[0] == "true")
      sensoresUtilizados[0] = true;
    else
      sensoresUtilizados[0] = false;

    if (sensoresUtilizadosStr[1] == "true")
      sensoresUtilizados[1] = true;
    else
      sensoresUtilizados[1] = false;

    if (sensoresUtilizadosStr[2] == "true")
      sensoresUtilizados[2] = true;
    else
      sensoresUtilizados[2] = false;

    // console.log('recebeu = '+sensoresUtilizados);
  }

  // Comandos a enviar imediatamente

  if (comando == BUZZER) {

    mbotWComms.write(buzz, true, function(error) {
      //console.log(BUZZER);
    });

  } else if (comando == DCMOTORM1) {

    var dcMotorM1BaseBufferMax = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x09, 0x01, 0xFF]);

    var sentidoPotencia = valor.split(',');
    var sentido = sentidoPotencia[0];
    var potencia = sentidoPotencia[1];

    // console.log('entrou 1  com sentido '+sentido+' e potencia='+potencia);

    if (sentido == DCMOTOR_FORWARD) {
      var velm1 = 255 - parseInt(potencia);
      if (velm1 == 0) velm1 = 1;
      dcMotorM1BaseBufferMax.writeUInt8(velm1, 7);
    } else {
      var vel = parseInt(potencia);
      if (vel > 240) vel = 240;
      dcMotorM1BaseBufferMax.writeUInt8(vel, 7);
      dcMotorM1BaseBufferMax.writeUInt8(0, 8);
    }

    mbotWComms.write(dcMotorM1BaseBufferMax, true, function(error) {
      //  console.log("Motor M1 pra frente com "+valor,dcMotorM1BaseBufferMax);
    });


  } else if (comando == DCMOTORM2) {

    var dcMotorM2BaseBufferMax = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x0A, 0xFF, 0x00]);

    var sentidoPotencia = valor.split(',');
    var sentido = sentidoPotencia[0];
    var potencia = sentidoPotencia[1];

    // console.log('entrou 2 com sentido '+sentido+' e potencia='+potencia);

    if (sentido == DCMOTOR_FORWARD) {
      dcMotorM2BaseBufferMax.writeUInt8(parseInt(potencia), 7);
    } else {
      var velm1 = 255 - parseInt(potencia);
      if (velm1 <= 15) velm1 = 15;
      dcMotorM2BaseBufferMax.writeUInt8(velm1, 7);
      dcMotorM2BaseBufferMax.writeUInt8(255, 8);
    }

    mbotWComms.write(dcMotorM2BaseBufferMax, true, function(error) {
      //  console.log("Motor M2 pra frente com "+valor,dcMotorM2BaseBufferMax);
    });

  } else if (comando == DCMOTORS || comando == DCMOTORS_BACK || comando == DCMOTORS_RIGHT || comando == DCMOTORS_LEFT) {

    const DCMOTORS_STOP = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x00]);
    var dcMotorsBaseBufferMax = new Buffer([0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0xFF, 0x00]);

    var sentidoPotenciaCalibragem = valor.split(',');
    valor = sentidoPotenciaCalibragem[0];
    var potenciaAdicionalEsquerda = parseInt(sentidoPotenciaCalibragem[1]);
    var potenciaAdicionalDireita = parseInt(sentidoPotenciaCalibragem[2]);

    if (parseInt(valor) == 0) {
      mbotWComms.write(DCMOTORS_STOP, true, function(error) {
        //    console.log("para motores ");
      });
    } else {
      // Cada motor gira para um sentido oposto ao do outro e não podem ser 0 (mínimo 1)
      var velm1 = 255 - parseInt(valor);

      // para frente conforme valor
      if (comando == DCMOTORS) {
        velm1 = velm1 - potenciaAdicionalEsquerda;
        if (velm1 <= 0) velm1 = 1;
        veldir = parseInt(valor) + potenciaAdicionalDireita;
        if (veldir > 240) veldir = 240;
        //console.log(velm1+', '+veldir);
        dcMotorsBaseBufferMax.writeUInt8(velm1, 6);
        dcMotorsBaseBufferMax.writeUInt8(255, 7);
        dcMotorsBaseBufferMax.writeUInt8(veldir, 8);
        dcMotorsBaseBufferMax.writeUInt8(0, 9);
      } else if (comando == DCMOTORS_BACK) {
        //console.log('Entrou para voltar');
        //referencia: var motor_reverse100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x55, 0x00, 0xaa, 0xFF]);
        velm1 = velm1 - potenciaAdicionalEsquerda;
        if (velm1 <= 0) velm1 = 1;
        veldir = parseInt(valor) + potenciaAdicionalDireita;
        if (veldir > 240) veldir = 240;

        dcMotorsBaseBufferMax.writeUInt8(veldir, 6);
        dcMotorsBaseBufferMax.writeUInt8(0, 7);
        dcMotorsBaseBufferMax.writeUInt8(velm1, 8);
        dcMotorsBaseBufferMax.writeUInt8(255, 9);

      } else if (comando == DCMOTORS_RIGHT) {
        if (velm1 < 15) velm1 = 15;

        // referencia direita a 100 var motor_turnright100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xaa, 0xFF, 0xaa, 0xFF]);
        dcMotorsBaseBufferMax.writeUInt8(velm1, 6);
        dcMotorsBaseBufferMax.writeUInt8(255, 7);
        dcMotorsBaseBufferMax.writeUInt8(velm1, 8);
        dcMotorsBaseBufferMax.writeUInt8(255, 9);


      } else if (comando == DCMOTORS_LEFT) {

        veldir = parseInt(valor);
        if (veldir > 240) veldir = 240;
        //console.log('vel left = ' + veldir);
        //ambos motores viram a esquerda a 100
        // referencia esquerda a 100  var motor_turnleft100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x55, 0x00, 0x55, 0x00]);

        dcMotorsBaseBufferMax.writeUInt8(veldir, 6);
        dcMotorsBaseBufferMax.writeUInt8(0, 7);
        dcMotorsBaseBufferMax.writeUInt8(veldir, 8);
        dcMotorsBaseBufferMax.writeUInt8(0, 9);

      }

      mbotWComms.write(dcMotorsBaseBufferMax, true, function(error) {
        //      console.log("ambos motores "+valor,dcMotorsBaseBufferMax);
      });

    }

  } else if (comando == SERVOMOTOR) {

    var servoMotorsBaseBuffer180Max = new Buffer([0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0xB4]);

    var anguloPortaSlot = valor.split(',');

    var porta = parseInt(anguloPortaSlot[0]);
    var slot = parseInt(anguloPortaSlot[1]);
    var angulo = parseInt(anguloPortaSlot[2]);

    if (angulo > 140) angulo = 140;

    servoMotorsBaseBuffer180Max.writeUInt8(porta, 6);
    servoMotorsBaseBuffer180Max.writeUInt8(slot, 7);
    servoMotorsBaseBuffer180Max.writeUInt8(angulo, 8);

    mbotWComms.write(servoMotorsBaseBuffer180Max, true, function(error) {
      // console.log("servo no angulo"+valor,servoMotorsBaseBuffer180Max);
    });

  } else if (comando == LEDLEFT || comando == LEDRIGHT || comando == LEDBOTH) {

    var ledBase = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x02, 0xff, 0xFF, 0xff]);
    var rgb = valor.split(',');

    if (comando == LEDLEFT)
      ledBase.writeUInt8(2, 8);
    else if (comando == LEDRIGHT)
      ledBase.writeUInt8(1, 8);
    else
      ledBase.writeUInt8(0, 8);

    ledBase.writeUInt8(parseInt(rgb[0]), 9);
    ledBase.writeUInt8(parseInt(rgb[1]), 10);
    ledBase.writeUInt8(parseInt(rgb[2]), 11);

    mbotWComms.write(ledBase, true, function(error) {
      //console.log("LED"+valor,ledBase);
    });


  } else if (comando == PLAYNOTE) {

    var buzzBase = new Buffer([0xff, 0x55, 0x07, 0x00, 0x02, 0x22, 0x06, 0x01, 0xf4, 0x01]);

    var notaTempo = valor.split(',');

    var nota = notaTempo[0];
    var tempo = notaTempo[1];

    // nota
    if (nota == 'C2') {
      buzzBase.writeUInt8(0x41, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'D2') {
      buzzBase.writeUInt8(0x49, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'E2') {
      buzzBase.writeUInt8(0x52, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'F2') {
      buzzBase.writeUInt8(0x57, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'G2') {
      buzzBase.writeUInt8(0x62, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'A2') {
      buzzBase.writeUInt8(0x6E, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'B2') {
      buzzBase.writeUInt8(0x7B, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'C3') {
      buzzBase.writeUInt8(0x83, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'D3') {
      buzzBase.writeUInt8(0x93, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'E3') {
      buzzBase.writeUInt8(0xa5, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'F3') {
      buzzBase.writeUInt8(0xaf, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'G3') {
      buzzBase.writeUInt8(0xc4, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'A3') {
      buzzBase.writeUInt8(0xdc, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'B3') {
      buzzBase.writeUInt8(0xf7, 6);
      buzzBase.writeUInt8(0x00, 7);
    } else if (nota == 'C4') {
      buzzBase.writeUInt8(0x06, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'D4') {
      buzzBase.writeUInt8(0x26, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'E4') {
      buzzBase.writeUInt8(0x4a, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'F4') {
      buzzBase.writeUInt8(0x5d, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'G4') {
      buzzBase.writeUInt8(0x88, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'A4') {
      buzzBase.writeUInt8(0xb8, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'B4') {
      buzzBase.writeUInt8(0xee, 6);
      buzzBase.writeUInt8(0x01, 7);
    } else if (nota == 'C5') {
      buzzBase.writeUInt8(0x0b, 6);
      buzzBase.writeUInt8(0x02, 7);
    } else if (nota == 'D5') {
      buzzBase.writeUInt8(0x4b, 6);
      buzzBase.writeUInt8(0x02, 7);
    } else if (nota == 'E5') {
      buzzBase.writeUInt8(0x93, 6);
      buzzBase.writeUInt8(0x02, 7);
    } else if (nota == 'F5') {
      buzzBase.writeUInt8(0xba, 6);
      buzzBase.writeUInt8(0x02, 7);
    } else if (nota == 'G5') {
      buzzBase.writeUInt8(0x10, 6);
      buzzBase.writeUInt8(0x03, 7);
    } else if (nota == 'A5') {
      buzzBase.writeUInt8(0x70, 6);
      buzzBase.writeUInt8(0x03, 7);
    } else if (nota == 'B5') {
      buzzBase.writeUInt8(0xdc, 6);
      buzzBase.writeUInt8(0x03, 7);
    } else if (nota == 'C6') {
      buzzBase.writeUInt8(0x17, 6);
      buzzBase.writeUInt8(0x04, 7);
    } else if (nota == 'D6') {
      buzzBase.writeUInt8(0x97, 6);
      buzzBase.writeUInt8(0x04, 7);
    } else if (nota == 'E6') {
      buzzBase.writeUInt8(0x27, 6);
      buzzBase.writeUInt8(0x05, 7);
    } else if (nota == 'F6') {
      buzzBase.writeUInt8(0x75, 6);
      buzzBase.writeUInt8(0x05, 7);
    } else if (nota == 'G6') {
      buzzBase.writeUInt8(0x20, 6);
      buzzBase.writeUInt8(0x06, 7);
    } else if (nota == 'A6') {
      buzzBase.writeUInt8(0xE0, 6);
      buzzBase.writeUInt8(0x06, 7);
    } else if (nota == 'B6') {
      buzzBase.writeUInt8(0xB8, 6);
      buzzBase.writeUInt8(0x07, 7);
    } else if (nota == 'C7') {
      buzzBase.writeUInt8(0x2D, 6);
      buzzBase.writeUInt8(0x08, 7);
    } else if (nota == 'D7') {
      buzzBase.writeUInt8(0x0D, 6);
      buzzBase.writeUInt8(0x09, 7);
    } else if (nota == 'E7') {
      buzzBase.writeUInt8(0x4D, 6);
      buzzBase.writeUInt8(0x0A, 7);
    } else if (nota == 'F7') {
      buzzBase.writeUInt8(0xEA, 6);
      buzzBase.writeUInt8(0x0A, 7);
    } else if (nota == 'G7') {
      buzzBase.writeUInt8(0x40, 6);
      buzzBase.writeUInt8(0x0C, 7);
    } else if (nota == 'A7') {
      buzzBase.writeUInt8(0xC0, 6);
      buzzBase.writeUInt8(0x0D, 7);
    } else if (nota == 'B7') {
      buzzBase.writeUInt8(0x6F, 6);
      buzzBase.writeUInt8(0x6F, 6);
      buzzBase.writeUInt8(0x0F, 7);
    } else if (nota == 'C8') {
      buzzBase.writeUInt8(0x5A, 6);
      buzzBase.writeUInt8(0x10, 7);
    } else if (nota == 'D8') {
      buzzBase.writeUInt8(0x5B, 6);
      buzzBase.writeUInt8(0x12, 7);
    }

    // tempo
    if (tempo == '1/8') {
      buzzBase.writeUInt8(0x7d, 8);
      buzzBase.writeUInt8(0x00, 9);
    } else if (tempo == '1/4') {
      buzzBase.writeUInt8(0xfa, 8);
      buzzBase.writeUInt8(0x00, 9);
    } else if (tempo == '1/2') {
      buzzBase.writeUInt8(0xf4, 8);
      buzzBase.writeUInt8(0x01, 9);
    } else if (tempo == '1') {
      buzzBase.writeUInt8(0xe8, 8);
      buzzBase.writeUInt8(0x03, 9);
    } else if (tempo == '2') {
      buzzBase.writeUInt8(0xd0, 8);
      buzzBase.writeUInt8(0x07, 9);
    }

    mbotWComms.write(buzzBase, true, function(error) {
      //console.log("BUZZ NOTE "+nota + " tempo "+tempo,buzzBase);
    });


  }

}


/* WEB SOCKET DAQUI EM DIANTE */

var WebSocketServer = require('websocket').server;

var http = require('http');

var server = http.createServer(function(request, response) {
  // console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8081, function() {
  //  console.log('---------------------------------------------------------------');
  //  console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta 8081');
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

let contClient = 0;

function originIsAllowed(origin) {
  if (contClient > 0) {
    console.log('Já existe uma instância de MMBlocly enviando comandos para este mBot. Apenas uma é permitida.');
    return false;
  }

  if (!podeConectar) {
    if (podeConectar != null) {
      console.log('mBot ainda não está totalmente inicializado.');
      return false;
    }
  }

  contClient++;

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
    enviaMsgParaTodosClientes('conectado:' + macaddressConectado + ',sala:' + sala_registrado + ',estacao:' + estacao_registrado + ',escola:' + escolaid);
    notificouClienteConexao = true;
    contadorIntervalo = 0;
  }

  let ultimoComando = null;
  let ultimoValor = null;

  connection.on('message', function(comandoValorStr) {

    // console.log('RECEBEU MENSAGEM ',comandoValorStr.utf8Data);

    var comandoValor = JSON.parse(comandoValorStr.utf8Data);

    //  console.log('RECEBEU MENSAGEM ',comandoValor.valor);

    if (comandoValor.comando != ultimoComando || comandoValor.valor != ultimoValor) {
      escreveParaMBot(comandoValor.comando, comandoValor.valor);
      ultimoComando = comandoValor.comando;
      ultimoValor = comandoValor.valor;
    } else {
      // console.log('desprezou repetido'+comandoValor.comando+' com valor '+comandoValor.valor);
    }



  });

  connection.on('close', function(reasonCode, description) {
    notificaClienteDesconexao('fechada pelo usuário');
    console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');

  });
});

function enviaMsgParaTodosClientes(evento) {

  var i;
  for (i = 0; i < wsServer.connections.length; i++) {
    //console.log('vai comunicar ao mmblockly o evento = '+evento);
    wsServer.connections[i].send(evento);

  }

}
