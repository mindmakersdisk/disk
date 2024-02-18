/*
  Serviço Node para controle do robô Sphero  - usar somente para o Sphero Cinza SPRK, bluetooth 2.x
  Paulo Alvim 20/12/2016. Atualizado em 27/12/2021

  1. Certificar-se que o bluetooth do PI está ligado
  2. Rodar com "sudo node app.js [macaddress]", onde macaddress é de um sphero visível pelo bluetooth. Ex.: sudo node mmsphero-server.js E8:8A:B4:69:69:99
  3. Testar abrindo o navegador e chamando http://localhost?code=[codigo-sphero.js]
  4. Para desconectar, fechar o serviço do Node

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

// Registrados
const VERSAO = "2.0"
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
var code = ""
var currentAngle = 0; // para frente
var eConfig = true;

var inquirer = require('inquirer');
var fs = require('fs');
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
const request = require('request')
var modoRegistro = false;


const readline = require('readline');


fs.readFile('/home/mindmakers/school.info', function(err, data) {
  if (err) {
    console.log("Essa estação ainda não está ativada. Ative antes de usar o Sphero");
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

    macaddressArg = sphero_registrado;
    console.log(macaddressArg);

    if (macaddressArg != undefined && macaddressArg != null && macaddressArg != '' && macaddressArg != 'XX:XX:XX:XX:XX:XX') {

      // Tem um Sphero configurado

      var acaoDefaultTemporal = setTimeout(acionaRegistradoTemporal, 7000);

      inquirer.prompt(questionsConfigurado).then(answers => {

        if (acaoDefaultTemporal)
          clearTimeout(acaoDefaultTemporal);

        if (answers.usarOuConfigurar == USAR_REGISTRADO) {
          // Conexão normal
          console.log('Vai conectar com Sphero pré-configurado');
          controlaSphero();

        } else {
          // Registrar um novo
          procurarNovoSphero();

        }

      });

    } else {

      // Não tem um Sphero configurado
      procurarNovoSphero();

    }

  }

});


/******************************************************************
 *  Perguntas, configuração do macaddress e registro na plataforma
 ******************************************************************/
const USAR_REGISTRADO = "Usar Registrado";
const REGISTRAR_NOVO = "Registrar Novo";
const REGISTRAR = "Registrar";


var questionsConfigurado = [{
  type: 'list',
  name: 'usarOuConfigurar',
  message: "Usar Sphero registrado ou registrar um novo?",
  default: USAR_REGISTRADO,
  choices: [USAR_REGISTRADO, REGISTRAR_NOVO]
}];

var questionsNaoConfigurado = [{
  type: 'list',
  name: 'configurar',
  message: "Aproxime um Sphero carregado e aperte enter para configurá-lo nesta estação",
  default: REGISTRAR,
  choices: [REGISTRAR]
}];

var questionsInformar = [{
  type: 'input',
  name: 'macaddress',
  message: "Informe o macaddress com 12 digitos sem ':' (ex.: cd09654dbd23) para configurar manualmente." +
    " Ou aproxime o Sphero e aperte enter para tentar mais uma vez..."
}];


/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoSphero() {

  if (macaddressArg == null || macaddressArg == '') {
    console.log('Não registrou o Sphero porque não recebeu um macaddress válido');
    return;
  }

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
    "Cód.: " + escolaid + "||\n" +
    "Nome: " + escolanome + "||\n" +
    "Pi: " + pi_registrado + "||\n" +
    "SD: " + sd_registrado + "||\n" +
    "Sala: " + sala_registrado + "||\n" +
    "Estação: " + estacao_registrado + "||\n" +
    "Sphero: " + macaddressArg + "||\n" +
    "littlebits: " + littlebits_registrado + "||\n" +
    "mbot: " + mbot_registrado + "||\n" +
    "microbit: " + microbit_registrado + "||\n" +
    "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err, data) {
    if (err) {
      console.log(err);
      // Encerra com falha
      process.exit(1);
    } else {

      console.error('\x1b[32m', '---------------------------------------------------');
      console.error('\x1b[0m\x1b[32m', '-- Alterou a configuração para usar o Sphero   ----');
      console.error('\x1b[0m\x1b[1m', '            ' + macaddressArg);
      console.error('\x1b[0m\x1b[1m', '-- Chame novamente para ativar o controlador   ----');
      console.error('\x1b[0m\x1b[32m', '-- Esta janela fecha em 7 segundos...          ----');
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


function registraSpheroPlataforma() {

  console.log('Entrou para registrar na plataforma...');

  if (macaddressArg == null || macaddressArg == '')
    return;

 // inquirer.prompt(autenticacao).then(autenticacao => {

    registraAposConferirAtivacao(autenticacao.login, autenticacao.senha);

 // });

}

function registraAposConferirAtivacao(login, senha) {

  // Registra SPRK+
  // console.log('Registrando o Sphero "'+macaddressArg+'" na plataforma.');

  if (escolaid == undefined || escolaid == null || escolaid == '') {
    console.error('\x1b[31m', '----------------------------------------------------------------');
    console.error('\x1b[31m', 'Não registrou na plataforma porque esta estação não está ativada');
    console.error('\x1b[31m', '----------------------------------------------------------------');

  } else {

/*
    request({
        url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
        method: 'POST',
        json: {
          'username': login,
          'password': senha,
          'tipo': 'SPRKPlus',
          'alocadoescola': escolaid,
          'chaveNatural': macaddressArg,
          'acao': 'registrar',
          'observacao': 'ativação automática'
        },
	  strictSSL:false
      },
      function(error, response, body) {
        // console.log('ERROR ---------------------------');
        // console.log(error);
        //   console.log('RESPONSE---------------------------');
        //   console.log(response);
        //  console.log('BODY---------------------------');
        //  console.log(body);
        if ((body && !body.success) || error) {
          if (body && !body.success) {
            console.error('\x1b[31m', 'Erro ao registrar Sphero: ' + JSON.stringify(body.err));
          } else {
            console.error('\x1b[31m', 'Erro ao registrar Sphero: ' + error);
          }
          setTimeout(encerraAposLeitura, 15000);
        } else {
          console.log('\x1b[32m', 'Sphero registrado na plataforma com sucesso! ');
          // Modifica o atalho e variável
          atualizaAtalhoSphero();
          setTimeout(encerraAposLeitura, 10000);
        }
      }
    );
	*/
          console.log('\x1b[32m', 'Sphero registrado com sucesso! ');
          // Modifica o atalho e variável
          atualizaAtalhoSphero();
          setTimeout(encerraAposLeitura, 10000);
  }


}


var ks = require('node-key-sender');

function acionaRegistradoTemporal() {

  ks.sendKey('enter');

}

function procurarNovoSphero() {

  modoRegistro = true;

  console.log('Procurando por um Sphero próximo para configurar...');

  // Procura por bluetooth

  noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      console.log('         Serviço Bluetooth Ativo v' + VERSAO);
      console.log('Procurando por Sphero SPRK+ a menos de 20cm...');
      noble.startScanning();
    } else {
      console.log('Encerrando procura');
      noble.stopScanning();
    }
  });

}

function configurarNovoSphero() {

  // Registra na plataforma (opcional)
  registraSpheroPlataforma();

  modoRegistro = false;

  // Já permite usar
  //controlaSphero();

}

var global_jsondevicelist = [];
var numeroScans = 0;
var numeroTentativas = 0;

noble.on('discover', function(peripheral) {

  if (!modoRegistro)
    return

  numeroScans++;

  console.log('Encontrou dispositivos Bluetooth Low Energy (BLE). Scan no. ' + numeroScans);

  if (peripheral.rssi > -75 && (
      ('' + peripheral.advertisement.localName).indexOf('SK') == 0 ||
      ('' + peripheral.advertisement.localName).indexOf('Sphero') == 0)) {

    console.log('\x1b[32m', 'Encontrou Sphero SPRK+:' + peripheral.address + ' [Nome:' + peripheral.advertisement.localName +
      ', Conectável:' + peripheral.connectable + ', RSSI:' + peripheral.rssi + ']');
    console.log('');


    global_jsondevicelist.push({
      "address": peripheral.address,
      "localname": peripheral.advertisement.localName,
      "rssi": peripheral.rssi,
      "manufacter": JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))
    });

    // registro completo se houver alguma diferença
    macaddressArg = peripheral.address + '';

    configurarNovoSphero();

    noble.stopScanning();

  }

  if (numeroScans >= 8 && global_jsondevicelist.length == 0) {

    console.log('Não localizei um Sphero próximo. Para registrar, aproxime uma unidade a menos de 20cm do computador.');
    console.log('');
    noble.stopScanning();

    numeroTentativas++;

    if (numeroTentativas == 1) {

      // Se não achou por certo tempo, pede para informar o macaddress ou retentar
      inquirer.prompt(questionsInformar).then(answers => {

        if (answers.macaddress == undefined || answers.macaddress == null || answers.macaddress == '') {

          // Tentar descobrir um novo novamente
          numeroScans = 0;
          noble.startScanning();

        } else {

          // usa o informado manualmente
          console.log('Vai configurar Sphero nesta estação com macaddress informado: ' + answers.macaddress);
          macaddressArg = ajustaMac(answers.macaddress);
          configurarNovoSphero();

        }

      });

    } else {

      console.error('\x1b[31m', 'Não foi possível encontrar um Sphero para registrar.');
      console.error('\x1b[31m', 'Reconfira a carga do Sphero e tente novamente.');
      console.error('\x1b[31m', 'Se tudo estiver ok, tente novamente após desligar e ligar a antena Bluetooth');
      console.error('\x1b[31m', 'do computador, usando o atalho no canto superior direito.');
      console.error('\x1b[0m', '------------------------------------------');
      // Encerra com falha
      setTimeout(encerraAposLeitura, 10000);

    }

  }


});

function ajustaMac(mac12) {
  return mac12.substring(0, 2) + ':' + mac12.substring(2, 4) + ':' + mac12.substring(4, 6) + ':' + mac12.substring(6, 8) +
    ':' + mac12.substring(8, 10) + ':' + mac12.substring(10, 12);
}


/*******************************************************************
 *  controlador Sphero daqui por diante
 *******************************************************************/
var WebSocketServer = require('websocket').server;

var http = require('http');


function controlaSphero() {

  //console.log("Entrou no controlador do Sphero: "+macaddressArg);

  var sphero = require("sphero"),
    bb8 = sphero(macaddressArg, {
      emitPacketErrors: false
    });
  //orb = sphero("/dev/rfcomm0", {emitPacketErrors: true});

  // submete comandos dinamicamente, para o SPRK+
  bb8.connect(function() {

    bb8.ping(function(err, data) {
      if (err)
        console.log(err);
    }); // Importante: evita travamentos inesperados

    // Notifica NODE-RED
    if (temNodeRedConectado()) {
      ipc.server.broadcast(
        'sphero.conectado', {
          id: ipc.config.id
        }
      );
    }

    bb8.version(function(err, data) {
      if (err) {
        console.error((new Date().toLocaleString()) + " err:", err);
      } else {

        console.log('\x1b[0m\x1b[32m', 'Leitura de componentes digitais do SPHERO via bluetooth ativada');
        console.log('\x1b[0m\x1b[32m', '                Controlador SPHERO Ativo v' + VERSAO);
        console.log('\x1b[0m', '---------------------------------------------------------------');
        console.log('\x1b[0m', '---------        TESTE E CONTROLE POR TECLADO        ----------');
        console.log('\x1b[0m', '---------                                            ----------');
        console.log('\x1b[0m', '--------- SETAS > MOVIMENTO                          ----------');
        console.log('\x1b[0m', '--------- BARRA DE ESPAÇO > COMEÇAR/PARAR CALIBRAGEM ----------');
        console.log('\x1b[0m', '--------- R > LUZ VERMELHA                           ----------');
        console.log('\x1b[0m', '--------- G > LUZ VERDE                              ----------');
        console.log('\x1b[0m', '--------- B > LUZ AZUL                               ----------');
        console.log('\x1b[0m', '--------- Y > LUZ AMARELA                            ----------');
        console.log('\x1b[0m', '--------- 1 > LUZ BRANCA                             ----------');
        console.log('\x1b[0m', '--------- 0 > DESLIGAR LUZ                           ----------');
        console.log('\x1b[0m', '--------- CTRL + C > FINALIZA PROGRAMA               ----------');
        console.log('\x1b[0m', '---------                                            ----------');
        console.log('\x1b[0m', '---------------------------------------------------------------');
        console.log('\x1b[0m', '---- Se for o primeiro uso, teste todos os comandos acima! ----');
        console.log('\x1b[0m', '---------------------------------------------------------------');
        console.log('');
        console.log('\x1b[0m', (new Date().toLocaleString()) + " Versão:" + data.msaVer + '.' + data.msaRev);
        console.log('');
      }
    });

    // console.log('Conectou com sucesso!! Aguardando comandos em http://localhost?code=')

    // console.error('\x1b[32m', '---------------------------------------------------');
    // console.error('\x1b[0m\x1b[32m', '-- Conectou com sucesso!! Aguardando comandos  ----');
    // console.error('\x1b[0m\x1b[32m', '---------------------------------------------------');

    count = 0;

    setInterval(function() {

      if (count % 60 == 0) {
        if (bb8.connection.peripheral.state == "connected") {
          estado = 'conectado'
        } else {
          estado = bb8.connection.peripheral.state;
        }
        console.log('\x1b[32m', (new Date().toLocaleString()) + ' Sphero ' + estado + '. Verificando comandos ...');

        //console.log(bb8);

      }

      //console.log(bb8.busy);
      //console.log(bb8.connection.peripheral.state);

      if (count % 5 == 0) {

        if (bb8.connection.peripheral.state != "connected") {
          console.log('\x1b[31m', '-----------------------------------------------------------------------');
          console.log('\x1b[31m', (new Date().toLocaleString()) + " Sphero desonectou! Caso não tenha sido intencional,");
          console.log('\x1b[31m', "                   feche esta janela e reinicie o serviço.");
          console.log('\x1b[0m\x1b[31m', '-----------------------------------------------------------------------');
          modoRegistro = true;

          process.exit();

        };
      }
      count++;

      if (count == 1) {
        code = 'bb8.setInactivityTimeout(1500);';
        bb8.setDefaultSettings();

      }


      if (code != '') {

        try {
          
          // movimentos do MK0 sao discretos e precisam aumentar a forca na diagonal, por isso mandam este flag
          if (code.indexOf('bb8.rollMK0')>-1) {
              //console.log(' recebeu '+code);
              var vel = parseFloat(code.substring(12,code.indexOf(',')));
              //console.log(code.substring(12,code.indexOf(',')))
              var angulo = parseInt(code.substring(code.indexOf(',')+1,code.indexOf(')')));

              if (angulo!=0 && angulo!=90 && angulo!=270 && angulo!=180)
                  vel = (vel*1.30).toFixed(1);
              else
                  vel = vel.toFixed(1);
                  
              code = "bb8.roll("+vel+","+angulo+")";
          }

          console.log('\x1b[32m', (new Date().toLocaleString()) + ' Vai executar: ' + code)

          eval(code);

          if (!eConfig) {}

        } catch (e) {

          console.log((new Date().toLocaleString()) + ' Erro ao tentar executar comando. Erro: ' + e)

          if (temNodeRedConectado()) {

            ipc.server.emit(
              socket,
              'error.message', {
                id: ipc.config.id,
                message: e
              }
            );

          }


        }
        code = ''

      }

    }, 1000);

    //tentativa diminuir eventos de colisão que estavam sendo disparados somente por movimento
    //var opts = {
    //device: "bb8",
    //meth: 0x01,
    //xt: 0xff,
    //yt: 0xff,
    //xs: 0xff,
    //ys: 0xff,
    //dead: 0xf0
    //}
    //bb8.detectCollisions(opts);


    // bb8.detectCollisions({
    //   device: "bb8"
    // });


    //ver se da pra diminuir falso-positivo com detectFreefall
    //bb8.detectFreefall();

    bb8.on("freefall", function(data) {
      //console.log("freefall detected");
      //console.log("  data:", data);
      console.log('\x1b[32m', (new Date().toLocaleString()) + " Queda livre detectada!");

      if (temClienteConectado())
        enviaMsgParaTodosClientes('quedaLivre={"valor":' + data.value + '}');

      if (temNodeRedConectado()) {
        //  console.log('teste colisao');
        ipc.server.broadcast(
          'sphero.freeFall', {
            id: ipc.config.id,
            message: {
              value: data.value
            }
          }
        );

      }

    });


    bb8.on("landed", function(data) {
      //console.log("landing detected");
      //console.log("  data:", data);
      console.log('\x1b[32m', (new Date().toLocaleString()) + " Aterrisagem detectada!");

      if (temClienteConectado())
        enviaMsgParaTodosClientes('aterrisou={"valor":' + data.value + '}');

      if (temNodeRedConectado()) {
        //  console.log('teste colisao');
        ipc.server.broadcast(
          'sphero.landing', {
            id: ipc.config.id,
            message: {
              value: data.value
            }
          }
        );

      }

    });

    var ultimaColisao = new Date();

    bb8.on("collision", function(data) {

      //console.log("  data:", data);

      var colisaoAtual = new Date();

      if ((colisaoAtual - ultimaColisao) >= 1000) {

        console.log('\x1b[32m', (new Date().toLocaleString()) + " Colisão detectada!");

        if (temClienteConectado())
          enviaMsgParaTodosClientes('colisao={"x":' + data.x + ',"y":' + data.y + ',"xMagnitude":' + data.xMagnitude +
            ',"yMagnitude":' + data.xMagnitude + ',"speed":' + data.speed + '}');

        if (temNodeRedConectado()) {

          //  console.log('teste colisao');

          ipc.server.broadcast(
            'sphero.hitted', {
              id: ipc.config.id,
              message: {
                x: data.x,
                y: data.y,
                xMagnitude: data.xMagnitude,
                yMagnitude: data.xMagnitude,
                speed: data.speed
              }
            }
          );

        }

        ultimaColisao = colisaoAtual;

      }

    });

  });

  bb8.on("error", function(err, data) {
    // Do something with the err or just ignore.
    console.log('\x1b[0m', (new Date().toLocaleString()) + "bb8.onerro");
    if (err) {
      console.log('\x1b[0m', (new Date().toLocaleString()) + " error: ", err);
    } else {
      console.log('\x1b[0m', (new Date().toLocaleString()) + " data: " + JSON.stringify(data));
    }

  });

  bb8.once('disconnect', function() {

    console.log('\x1b[0m', (new Date().toLocaleString()) + " desonectou");

  });

  bb8.on('close', function() {

    console.log('\x1b[0m', (new Date().toLocaleString()) + " close");

  });

  process.on('SIGHUP', function() {
    //tentativa desconexão ao fechar a janela, funciona em ubuntu. estava SIGINT antes.
    bb8.sleep(10, 0, 0, function(err, data) {
      console.log((new Date().toLocaleString()) + 'Obrigado, até a próxima!');
      console.log(err || "data: " + JSON.stringify(data));
      process.exit();
    });

  });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  calli = false;
  lastdir = 0;

  process.stdin.on('keypress', (str, key) => {
    speed = 20;
    //console.log(modoRegistro);

    if (key.ctrl && key.name === 'c') {

      bb8.sleep(10, 0, 0, function(err, data) {
        //console.log(err || "data: " + JSON.stringify(data));
        process.exit();
      });

    } else if (key.ctrl && key.name === 'q') {

      bb8.ping(function(err, data) {
        console.log('\x1b[32m\x1b[0m', (new Date().toLocaleString()) + ' ping');
        console.log(err || "data: " + JSON.stringify(data));
      });

    } else if (key.ctrl && key.name === 'w') {
      //TODO - ver qual é o maximo batteryvoltage e fazer scale de 0 a 100
      // batteryvoltage 700 começa a piscar vermelho
      bb8.getPowerState(function(err, data) {
        console.log('\x1b[32m\x1b[0m', (new Date().toLocaleString()) + ' getPowerState');
        if (err) {
          console.log("error: ", err);
        } else {
          console.log("data:");
          console.log("  recVer:", data.recVer);
          console.log("  batteryState:", data.batteryState);
          console.log("  batteryVoltage:", data.batteryVoltage);
          console.log("  chargeCount:", data.chargeCount);
          console.log("  secondsSinceCharge:", data.secondsSinceCharge);
        }
      });

    } else if (key.ctrl && key.name === 'e') {

      bb8.getVoltageTripPoints(function(err, data) {
        console.log('\x1b[32m\x1b[0m', (new Date().toLocaleString()) + ' getVoltageTripPoints');
        if (err) {
          console.log("error: ", err);
        } else {
          console.log("data:");
          console.log("  vLow:", data.vLow);
          console.log("  vCrit:", data.vCrit);
        }
      });

    } else if (key.ctrl && key.name === 'r') {

      bb8.runL1Diags(function(err, data) {
        console.log('\x1b[32m\x1b[0m', (new Date().toLocaleString()) + ' runL1Diags');
        console.log(err || "data: " + JSON.stringify(data));
      });

    } else if (key.ctrl && key.name === 't') {

      bb8.runL2Diags(function(err, data) {
        console.log('\x1b[32m\x1b[0m', (new Date().toLocaleString()) + ' runL2Diags');
        if (err) {
          console.log("error: ", err);
        } else {
          console.log("data: ", data);
        }
      });

    } else if (key.ctrl && key.name === 'a') {
      //tentativa diminuir mensagens "command sync lost" e só ligar colisão e freefall quando necessário
      bb8.detectCollisions({
        device: "bb8"
      });

      bb8.detectFreefall();

    } else if (!modoRegistro) {
      //console.log(`You pressed the "${str}" key`);
      if (!bb8.busy) {
        if (key.name == 'space') {

          if (calli == false) {
            bb8.startCalibration();
            calli = true;
          } else if (calli == true) {
            bb8.finishCalibration();
            calli = false;
          }
        }
        if (key.name == '2') {
          //bb8.stop();
          bb8.roll(0, lastdir);
        }

        if (key.name == 'up') {
          bb8.roll(speed, 0);
          lastdir = 0;
        }
        if (key.name == 'down') {
          bb8.roll(speed, 180);
          lastdir = 180;
        }
        if (key.name == 'right') {
          bb8.roll(speed, 90);
          lastdir = 90;
        }
        if (key.name == 'left') {
          bb8.roll(speed, 270);
          lastdir = 270;
        }
        if (key.name == 'r') {
          bb8.color("red");
        }
        if (key.name == 'y') {
          bb8.color("yellow");
        }
        if (key.name == 'g') {
          bb8.color("green");
        }
        if (key.name == 'b') {
          bb8.color("blue");
        }
        if (key.name == 'w') {
          bb8.color("white");
        }
        if (key.name == 'd') {
          bb8.color("black");
        }
        if (key.name == '1') {
          bb8.color("white");
        }
        if (key.name == '0') {
          bb8.color("black");
        }
        //   console.log();
        //   console.log(key);
        //   console.log();
      }
    }
  });
}


const express = require('express')
const app = express()

// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function(req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  next();
});

app.get('/', (request, response) => {

  //  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code != null) {
    eConfig = request.query.config != null;
    currentAngle = 0;
    code = request.query.code

  }

  response.json({
    status: 'ok',
    codigo: code
  })
})

app.get('/dispositivocorrente', (request, response) => {

  // response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code != null) {
    code = request.query.code
  }

  response.json({
    dispositivo: macaddressArg
  })
})


function wait(seconds) {

  var iMilliSeconds = seconds * 1000
  var counter = 0,
    start = new Date().getTime(),
    end = 0;
  while (counter < iMilliSeconds) {
    end = new Date().getTime();
    counter = end - start;
  }
}

app.listen(80)




//implementação comando via WebSocket
const COMANDO_FINAL = "comandoFinal";
const COLOR = "color";
const ROLL = "roll";

//Possívelmente ver comando em sphero.js dentro do noble
const STARTCALIBRATION = "startCalibration";
const FINISHCALLIBRATION = "finishCalibration";
const SETBACKLED = "setBackLed";
const SETRGBLED = "setRgbLed";
const SETRAWMOTORS = "setRawMotors";
const RANDOMCOLOR  = "randomColor"

/*
EXEMPLOS DE COD
"bb8.randomColor()"
"bb8.setBackLed(255);"
"bb8.setBackLed(0);"
"bb8.color({red:" + red + ",green:" + green + ",blue:" + blue + "});"
*/


//para implementação genérica
const arrComandos = [COLOR, ROLL];
var exitecomando = 0;

function retornaFim() {

  notificaCliente(COMANDO_FINAL, "");

}

// Recebe comando obtido do Blockly e envia para Sphero.
function escreveParaSphero(comando, valor) {
  //console.log('comando: '+comando);
  //console.log('valor: '+valor);

  if (comando == COMANDO_FINAL) {
    // Devolve mensagem após 5 segundos, avisando que execução finalizou.
    setTimeout(retornaFim, 2000);
  }

  // Comandos a enviar imediatamente

  //Implementação genérica de comandos validando nome do comando com a array de possíveis
  for (i = 0; i < arrComandos.length; i++) {
    //console.log('arrComandos: ' + arrComandos[i]);
    //console.log('comando: ' + comando);
    if (comando == arrComandos[i]) {
      exitecomando = 1;
    }
  }
  if (exitecomando == 1) {
    code = 'bb8.' + comando + '("' + valor + '");';
    exitecomando = 0;
  } else {
    //console.log('comando não exite');
  }


  /*
    //Implementação comando a comando
    if (comando == COLOR) {

      //code = 'bb8.color("'+valor+'");';
      code = 'bb8.'+COLOR+'("'+valor+'");';

      //codigo direto assim fala que bb8 não exite
      //bb8.color('"'+valor+'"');

    } else if (comando == ROLL) {

      var potenciaSentido = valor.split(',');
      var potencia = potenciaSentido[0];
      var sentido = potenciaSentido[1];

      code = 'bb8.roll("'+potencia+','+sentido+'");';

      //bb8.roll(potencia + ',' + sentido);

    } else {

      console.log('comando não implementado');

    }
  */

}

/****************************************************************
 *  daqui em diante websocket para MMBlockly
 ****************************************************************/
var notificouClienteConexao = false;


function temClienteConectado() {

  return wsServer != null && wsServer.connections != null && wsServer.connections[0] != null

}


var server = http.createServer(function(request, response) {
  // console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8083, function() {
  console.log('---------------------------------------------------------------');
  console.log('            ' + (new Date().toLocaleString()) + ' Websocket ouvindo na porta 8083');
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

  console.log((new Date().toLocaleString()) + ' Cliente conectado');

  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date().toLocaleString()) + ' Conexão com origem ' + request.origin + ' rejeitada.');
    return;
  }

  var connection = request.accept('echo-protocol', request.origin);
  console.log((new Date().toLocaleString()) + ' Conexão aceita.');

  if (temClienteConectado()) {
    enviaMsgParaTodosClientes('conectado:' + macaddressArg + ',sala:' + sala_registrado + ',estacao:' + estacao_registrado + ',escola:' + escolaid);
    notificouClienteConexao = true;
    contadorIntervalo = 0;
  }

  connection.on('message', function(message) {

    // Implementa envios para Sphero por aqui.

    var comandoValor = JSON.parse(message.utf8Data);

    //  console.log('RECEBEU MENSAGEM ',comandoValor.valor);

    escreveParaSphero(comandoValor.comando, comandoValor.valor);


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

ipc.config.id = 'sphero';
ipc.config.retry = 1500;
ipc.config.silent = true;

// Envia código para Sphero
ipc.serveNet(
  function() {
    ipc.server.on(
      'program.sphero.message',
      function(data, socket) {
        ipc.log('Recebeu mensagem de', (data.id), (data.message));
        console.log((new Date().toLocaleString()) + ' vai enviar para sphero ' + data.message);
        //code = data.message.replaceAll('sprk.','bb8.');
        code = data.message;
      }
    );
  }
);


function temNodeRedConectado() {

  return ipc != null && ipc.server != null

}

ipc.server.start();
