#!/usr/bin/env node
/*
  Interaçao com microbit

  Paulo Alvim 04/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/
// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var pi_registrado='';
var sd_registrado='';
var sala_registrado = '1';
var estacao_registrado = '';
var sphero_registrado='';
var littlebits_registrado='';
var mbot_registrado='';
var microbit_registrado='';
var microbitBLEConectado=false;

var macaddressArg;

const request = require('request')  
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');

/******************************************************************
 *  Perguntas, configuração do macaddress e registro na plataforma
 ******************************************************************/
 var modoRegistro = false;

              
fs.readFile('/home/mindmakers/school.info', function(err,data)
    {
      if (err) {
          console.log("Essa estação ainda não está ativada. Ative antes de usar o microbit");
          process.exit(1);
      } else {

      
              escolainfo = data.toString();
              escolaidIni =escolainfo.indexOf('Cód.:')+5;
              escolaid= escolainfo.substring(escolaidIni,escolainfo.indexOf('||'),escolaidIni).trim();
              //console.log(escolaid);
              escolanomeIni =escolainfo.indexOf('Nome:')+5;
              escolanome= escolainfo.substring(escolanomeIni,escolainfo.indexOf('||',escolanomeIni)).trim();
              //console.log(escolanome);
              piIni = escolainfo.indexOf('Pi:')+3;
              pi_registrado= escolainfo.substring(piIni,escolainfo.indexOf('||',piIni)).trim();
              //console.log(pi_registrado);
              sdIni = escolainfo.indexOf('SD:')+3;
              sd_registrado= escolainfo.substring(sdIni,escolainfo.indexOf('||',sdIni)).trim();
              //console.log(sd_registrado);
              salaIni = escolainfo.indexOf('Sala:')+5
              sala_registrado= escolainfo.substring(salaIni,escolainfo.indexOf('||',salaIni)).trim();
              //console.log(sala_registrado);
              estacaoIni = escolainfo.indexOf('Estação:')+8
              estacao_registrado= escolainfo.substring(estacaoIni,escolainfo.indexOf('||',estacaoIni)).trim();
              //console.log(estacao_registrado);
              spheroIni = escolainfo.indexOf('Sphero:')+7
              sphero_registrado= escolainfo.substring(spheroIni,escolainfo.indexOf('||',spheroIni)).trim();
              littlebitsIni = escolainfo.indexOf('littlebits:')+11
              littlebits_registrado= escolainfo.substring(littlebitsIni,escolainfo.indexOf('||',littlebitsIni)).trim();
              mbotIni = escolainfo.indexOf('mbot:')+5
              mbot_registrado= escolainfo.substring(mbotIni,escolainfo.indexOf('||',mbotIni)).trim();
              microbitIni = escolainfo.indexOf('microbit:')+9
              microbit_registrado= escolainfo.substring(microbitIni,escolainfo.indexOf('||',microbitIni)).trim();
          
              macaddressArg = microbit_registrado;
              console.log('Identificou microbit configurado: '+macaddressArg);
              
              if (macaddressArg != undefined && macaddressArg != null && macaddressArg !='' && macaddressArg !='XX:XX:XX:XX:XX:XX') {
                  
                  // Tem um littleBits configurado

                  var acaoDefaultTemporal=setTimeout(acionaRegistradoTemporal,7000);
                  
                  inquirer.prompt(questionsConfigurado).then(answers => {

                        if (acaoDefaultTemporal) 
                            clearTimeout(acaoDefaultTemporal);

                        if (answers.usarOuConfigurar==USAR_REGISTRADO) {
                          // Conexão normal
                          console.log('Vai conectar com microbit pré-configurado');
                          controlaMicrobit();
                          
                        } else {
                          // Registrar um novo
                          console.log('Vai configurar um novo microbit');
                          procurarNovoMicrobit();
                          
                        }


                    });


              } else {

                 // Não tem um microbit configurado
                 procurarNovoMicrobit();

              }
              
      }
      
    });

 const USAR_REGISTRADO="Usar Registrado";
 const REGISTRAR_NOVO="Registrar Novo";
 const REGISTRAR="Registrar";
 
 var questionsConfigurado = [
  {
    type: 'list',
    name: 'usarOuConfigurar',
    message: "Usar microbit registrado ou registrar um novo?",
    default: USAR_REGISTRADO,
    choices: [USAR_REGISTRADO,REGISTRAR_NOVO]
  }
];

 var questionsNaoConfigurado = [
  {
    type: 'list',
    name: 'configurar',
    message: "Aproxime um microbit energizado e aperte enter para configurá-lo nesta estação",
    default: REGISTRAR,
    choices: [REGISTRAR]
  }
];

var questionsInformar = [
  {
    type: 'input',
    name: 'macaddress',
    message: "Informe o macaddress com 12 digitos sem ':' (ex.: cd09654dbd23) para configurar manualmente."
    +" Ou aproxime o microbit e aperte enter para tentar mais uma vez..."
  }
];

/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoMicrobit() {

  if (macaddressArg==null || macaddressArg=='') {
     console.log('Não registrou o microbit porque não recebeu um macaddress válido');
     return;
  }

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
                         "Cód.: "+escolaid+"||\n"+
                         "Nome: "+escolanome+"||\n"+
                         "Pi: "+pi_registrado+"||\n"+
                         "SD: "+sd_registrado+"||\n"+
                         "Sala: "+sala_registrado+"||\n"+
                         "Estação: "+estacao_registrado+"||\n"+
                         "Sphero: "+sphero_registrado+"||\n"+
                         "littlebits: "+littlebits_registrado+"||\n"+
                         "mbot: "+mbot_registrado+"||\n"+
                         "microbit: "+macaddressArg+"||\n"+
                         "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err,data)
        {
          if (err) {
              console.log(err);
              // Encerra com falha
              process.exit(1);
          } else {
            
            console.error('\x1b[32m',       '---------------------------------------------------');
            console.error('\x1b[0m\x1b[32m','-- Alterou a configuração para usar o microbit  ----');
            console.error('\x1b[0m\x1b[1m', '            '+macaddressArg);
            console.error('\x1b[0m\x1b[1m', '-- Chame novamente para começar a usar         ----');
            console.error('\x1b[0m\x1b[32m','-- Esta janela fecha em 7 segundos...          ----');
            console.log('');   

          }

        
        });

}

function encerraAposLeitura() {
  
  process.exit(1)
  
}

var autenticacao = [
  {
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



function registraMicrobitPlataforma() {

    console.log('Entrou para registrar na plataforma...');

    if (macaddressArg==null || macaddressArg=='')
       return;

    inquirer.prompt(autenticacao).then(autenticacao => {

       registraAposConferirAtivacao(autenticacao.login,autenticacao.senha);  
    
    });

}

function registraAposConferirAtivacao(login,senha) {
  
         // Registra microbit
        // console.log('Registrando o Sphero "'+macaddressArg+'" na plataforma.');

         if (escolaid == undefined || escolaid==null || escolaid=='') {
            console.error('\x1b[31m','----------------------------------------------------------------');
            console.error('\x1b[31m','Não registrou na plataforma porque esta estação não está ativada');
            console.error('\x1b[31m','----------------------------------------------------------------');
            
         } else {


             request({url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
                    method: 'POST',
                    json: {
                      'username':login,
                      'password':senha,
                      'tipo':'microbit',
                      'alocadoescola':escolaid,
                      'chaveNatural':macaddressArg,
                      'acao': 'registrar',
                      'observacao': 'ativação automática'}
                    },
                    function(error, response, body){
                       // console.log('ERROR ---------------------------');
                       // console.log(error);
                     //   console.log('RESPONSE---------------------------');
                     //   console.log(response);
                      //  console.log('BODY---------------------------');
                      //  console.log(body);
                        if (!body.success || error) {
                            if (!body.success){
                              console.error('\x1b[31m','Erro ao registrar microbit: '+JSON.stringify(body.err));
                            }else{
                              console.error('\x1b[31m','Erro ao registrar microbit: '+error);
                            }
                             setTimeout(encerraAposLeitura,15000);  
                        } else {
                            console.log('\x1b[32m','microbit registrado na plataforma com sucesso! ');
                             // Modifica o atalho e variável
                             atualizaAtalhoMicrobit();
                             setTimeout(encerraAposLeitura,10000);  
                        }
                    }
                );
              
              }
  
  
}


var ks = require('node-key-sender');

function acionaRegistradoTemporal() {
 
  ks.sendKey('enter');
 
}

var numeroScans=0;
var numeroTentativas=0;

function procurarNovoMicrobit() {
  
  modoRegistro=true;
  
  console.log('Procurando por um microbit próximo para configurar...');  
  
  // Procura por bluetooth

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

        console.log('Procurando por um microbit a menos de 2m...');
        noble.startScanning();
      } else {
       console.log('Encerrando procura por dispositivos Bluetooth');
       noble.stopScanning();
     }
    });
    
    
    noble.on('discover', function(peripheral) {
      
      console.log('Investigando dispositivos Bluetooth Low Energy (BLE)...');

      numeroScans++;
      
      microbitBLEConectado=false;
      
      //console.log(peripheral.advertisement);
      
      if ((''+peripheral.advertisement.localName).indexOf('BBC') == 0 &&
              peripheral.rssi>-60) {
         
          console.log('\x1b[32m','Encontrou microbit:'+peripheral.address + ' [Nome:'+peripheral.advertisement.localName +
                ', Conectável:' + peripheral.connectable + ', RSSI:' + peripheral.rssi+']');
          console.log('');
         
         noble.stopScanning();
          
         macaddressArg=peripheral.address;   
         
         configurarNovoMicrobit();  

       //console.log(peripheral);    
       // console.log(peripheral);
       // console.log(peripheral.advertisement.serviceData); 

      }
      
      if (numeroScans>=8) {
        
           console.error('\x1b[31m','Não foi possível encontrar um microbit ligado para registrar.');
           console.error('\x1b[31m','Confira se ele está ligado e com luz amarela acessa.');
           console.error('\x1b[31m','Se tudo estiver ok, tente novamente após desligar e ligar a antena Bluetooth');
           console.error('\x1b[31m','do computador, usando o atalho no canto superior direito.');
           console.error('\x1b[0m', '------------------------------------------');
           // Encerra com falha
           setTimeout(encerraAposLeitura,10000);   
        
      }
      

    });
  
}

function configurarNovoMicrobit() {
  
  // Registra na plataforma (opcional)
  registraMicrobitPlataforma();
  
  modoRegistro=false;


}
 
 
 /*************************************************************
 * Serviços BLE para microbit daqui por diante
 ************************************************************/

var BBCMicrobit = require('bbc-microbit'); 

var pin = 0;
var interval = 1000; // ms
var pinValue = 0;

var period = 160; // ms


var COMPASS_POINT_DELTA = 22.5;

var COMPASS_POINTS = [
            "N",
            "NNE",
            "NE",
            "LNE",
            "L",
            "ESE",
            "SE",
            "SSE",
            "S",
            "SSO",
            "SO",
            "OSO",
            "O",
            "ONO",
            "NO",
            "NNO"
    ];

var BUTTON_VALUE_MAPPER = ['Solto', 'Pressionado', 'Pressionado Longo'];    



var PATTERNS = [
  {
    name: 'Arrow up right',
    value: new Buffer('0F03050910', 'hex')
  },
  {
    name: 'Arrow down left',
    value: new Buffer('011214181E', 'hex')
  },
  {
    name: 'Arrow down right',
    value: new Buffer('100905030F', 'hex')
  },
  {
    name: 'Arrow up left',
    value: new Buffer('1E18141201', 'hex')
  },
  {
    name: 'Diamond',
    value: new Buffer('040A110A04', 'hex')
  },
  {
    name: 'Smile',
    value: new Buffer('0A0A00110E', 'hex')
  },
  {
    name: 'Wink',
    value: new Buffer('080B00110E', 'hex')
  },
  {
    name: 'Solid',
    value: new Buffer('1F1F1F1F1F', 'hex')
  },
  {
    name: 'Blank',
    value: new Buffer('0000000000', 'hex')
  }
];

//var text = 'Alo';

//var patternIndex = Math.floor((Math.random() * PATTERNS.length)); // choose a random pattern
//var pattern = PATTERNS[patternIndex];

let microbitGlobal;

console.log('Procurando por um microbit...');

function controlaMicrobit() {

  BBCMicrobit.discover(function(microbit) {
    
    if (microbit.address!=macaddressArg)
        return
    
    console.log('\x1b[0m\x1b[32m','Comunicação via bluetooth ativada com wearable microbit: '+microbit.address);
   // console.log('\x1b[0m',        '--------------------------------------------------------------------------');

    microbitGlobal=microbit;

    microbit.on('disconnect', function() {
      
      console.log('\x1b[31m','\tmicrobit desconectou!');
      console.error('\x1b[0m','');
      notificaClienteDesconexao();
      ipc.server.broadcast(
              'microbit.desconectado',
              {
                  id:ipc.config.id
              }
            );
        
      microbitBLEConectado=false  
        
      controlaMicrobit();     
      
    });

   
    /********************************************************************
     * REGISTROS E ESCRITA DE TODOS OS SENSORES - SEMPRE OUVE TODOS.
     * ******************************************************************/
    //console.log('Conectando ao microbit...');
    microbit.connectAndSetUp(function() {
      console.log('\x1b[0m','Ajustando parâmetros iniciais...');

       microbit.subscribeButtons(function() {
        //console.log('\tsubscribed to buttons');
      });

      console.log(' Definindo período do acelerômetro para %d ms', period);
      microbit.writeAccelerometerPeriod(period, function() {
        console.log('\tperíodo do acelerômetro definido');

       // console.log('subscribing to accelerometer');
        microbit.subscribeAccelerometer(function() {
         // console.log('\tsubscribed to accelerometer');
        });      
        
      });
      
      
      microbit.writeMagnetometerPeriod(period, function() {
        //console.log('\tmagnetometer period set');

        //console.log('subscribing to magnetometer bearing');
        microbit.subscribeMagnetometerBearing(function() {
        //  console.log('\tsubscribed to magnetometer bearing');
        });
        
        //  console.log('subscribing to magnetometer');
        microbit.subscribeMagnetometer(function() {
        //  console.log('\tsubscribed to magnetometer');
        });
        
      });
      
      console.log(' Definindo pino %d como entrada (input)', pin);
      microbit.pinInput(pin, function() {
        console.log('\tpino definido como entrada');

        console.log(' Definindo pino %d como analógico', pin);
        microbit.pinAnalog(pin, function() {
          console.log('\tpino definido como analógico');

  //        console.log('subscribing to pin data');
          microbit.subscribePinData(function() {
    //        console.log('\tsubscribed to pin data');
          });
        });
      });
      
      console.log(' Definindo período do sensor de temperatura para %d ms', period);
      microbit.writeTemperaturePeriod(period, function() {
        console.log('\tperíodo do sensor de temperatura definido');

  //      console.log('subscribing to temperature');
        microbit.subscribeTemperature(function() {
    //      console.log('\tsubscribed to temperature');
        });
      });
      
      setTimeout(finalizaInicializacao,2000);
      
    });
  });
  
}

function finalizaInicializacao() {
  
  
    microbitBLEConectado=true;
    console.log('\x1b[0m\x1b[32m','microbit inicializado com sucesso');
    console.log('\x1b[0m',        '---------------------------------');

  
  
}

      
/**************************************************************
 *     ENVIA COMANDOS PARA MICROBIT              
 **************************************************************/

    function togglePin(pin,pinValue) {
      //pinValue = (pinValue === 0) ? 1 : 0;

      console.log('Escrevendo %d para pino %d', pinValue, pin);
      microbitGlobal.writePin(pin, pinValue, function() {
        console.log('\tFeito');
      });
      
    }
    
    function enviaPadraoLED(padrao) {
      
         console.log('Enviando padrão para matriz de LEDs', padrao.name);
        microbitGlobal.writeLedMatrixState(padrao.value, function() {
          console.log('\tPadrão enviado');

        });
      
    }

    function enviaTexto(texto) {
      
        console.log('Enviando texto "%s" para matriz de LEDs', texto);
        microbitGlobal.writeLedText(texto, function() {
          console.log('\tTexto enviado');

        });
     
      
    }

function compassPoint(bearing) {
  var d = bearing / COMPASS_POINT_DELTA;
  var name_inx = Math.floor(d);
  if (d - name_inx > 0.5) {
      name_inx++;
  }
  if (name_inx > 15) {
      name_inx = 0;
  }
  return COMPASS_POINTS[name_inx];
  
}

// Recebe mensagem no padrão "acao:CODIGO,
function escreveParaMicrobit(mensagem) {
  
  console.log(mensagem);
    
  var comandoValor = [];
  comandoValor = mensagem.utf8Data.split(',');
  var comando = comandoValor[0].split(':')[1];
  
  //console.log('comando='+comando);
  
  if (!microbitBLEConectado)
      return
  
  if (comando==ACAO_PIN) {
    
      var pinoValor = [];
      pinoValor = comandoValor[1].split(':');
    
      console.log('Definindo pino %d como saída (output)', pinoValor[0]);
      
      microbitGlobal.pinOutput(parseInt(pinoValor[0]), function() {
        console.log('\tPino definido como saída');

        console.log('definindo pino %d como digital', pinoValor[0]);
        microbitGlobal.pinDigital(parseInt(pinoValor[0]), function() {
          console.log('\tPino definido como digital');

             togglePin(parseInt(pinoValor[0]),parseInt(pinoValor[1]));
        });
      });

    } else  if (comando==ACAO_FIGURA) {
      
        console.log('padrao='+comandoValor[1]);
      
        enviaPadraoLED(PATTERNS[parseInt(comandoValor[1])]); 
      
    } else  if (comando==ACAO_TEXTO) {
      
        enviaTexto(comandoValor[1]);
    } 


}

      
/**************************************************************
 *     WEB-SOCKET             
 **************************************************************/

var WebSocketServer = require('websocket').server;

var http = require('http');
 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(403);
    response.end();
});
server.listen(8082, function() {
  //  console.log('---------------------------------------------------------------');
  //  console.log('            '+(new Date().toLocaleString()) + ' Websocket ouvindo na porta 8082');
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
             enviaMsgParaTodosClientes('conectado:'+macaddressArg+',sala:'+sala_registrado+',estacao:'+estacao_registrado);
             notificouClienteConexao=true;
             contadorIntervalo=0;
             
             monitoraSensoresMicrobitParaWebSocket();
             
      }
   
   
    connection.on('message', function(message) {

      //console.log('RECEBEU MENSAGEM '+message);
            
      escreveParaMicrobit(message);
    
    });
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
    });
});

var last_compass_point_name = "";
var last_temperature;
var last_x=0;
var last_y=0;
var last_z=0;

// Redunda observação provisoriamente, com relação ao Node-RED. Refatorar oportunamente.
function monitoraSensoresMicrobitParaWebSocket(pinId) {

         if (!microbitBLEConectado)
            return;
            
        /* BUTTON */
         microbitGlobal.on('buttonAChange', function(value) {
            
            console.log('\tBotão A mudou: ', BUTTON_VALUE_MAPPER[value]);
                    
            // Envia para Websocket se houverem conexões
            if (temClienteConectado()) {
              
              notificaCliente(ACAO_BOTAOA,BUTTON_VALUE_MAPPER[value]);
              
            }
            
          });
          


        /* BUTTON */
         microbitGlobal.on('buttonBChange', function(value) {
            console.log('\tBotão B mudou:: ', BUTTON_VALUE_MAPPER[value]);
                    
            // Envia para Websocket se houverem conexões
            if (temClienteConectado()) {
              
              notificaCliente(ACAO_BOTAOB,BUTTON_VALUE_MAPPER[value]);
              
            }
            
          });  


        
          microbitGlobal.on('accelerometerChange', function(x, y, z) {
            //console.log('\ton -> accelerometer change: accelerometer = %d %d %d G', x.toFixed(1), y.toFixed(1), z.toFixed(1));
                   
            if (x.toFixed(1) != last_x || y.toFixed(1) != last_y || z.toFixed(1) != last_z) {       
                     
                     
                  // Envia para Websocket se houverem conexões
                  if (temClienteConectado()) {
                    
                    notificaCliente(ACAO_ACELER,'x:'+x.toFixed(1)+' y:'+y.toFixed(1)+' z:'+z.toFixed(1));
                    
                  }    
                
                last_x=x.toFixed(1);
                last_y=y.toFixed(1);
                last_z=z.toFixed(1);
              
            }
            
            
          });


        
          microbitGlobal.on('magnetometerChange', function(x, y, z) {
           
             // TODO

            
          });
         

        
          microbitGlobal.on('magnetometerBearingChange', function(bearing) {
            //console.log('\ton -> magnetometer bearing change: magnetometer bearing = %d', bearing);
            
              // TODO
           
            
          });
        

        
         microbitGlobal.on('temperatureChange', function(temperature) {

      
            if (temperature != last_temperature) {
              
              console.log('\tMudou a temperatura para %d °C', temperature);
            
                            // Envia para Websocket se houverem conexões
                  if (temClienteConectado()) {
                    
                    notificaCliente(ACAO_TEMP,temperature+'');
                    
                  }    
                
              
                last_temperature = temperature;
              
            }
        });

         
        if (pinId) {
        
           microbitGlobal.pinInput(pinId, function() {

            console.log('\tConfigurou pino %d como de entrada ',pinId);

         
          
           });
        }
        
         microbitGlobal.on('pinDataChange', function(pin, value) {
         // console.log('\ton -> pin data change: pin = %d, value = %d', pin, value);
          
          
                if (temClienteConectado()) {
                    
                    notificaCliente(ACAO_PIN,value+'');
                    
                  }    
          
        });

  
}

function enviaMsgParaTodosClientes(evento) {
  
    var i;
    for (i = 0; i < wsServer.connections.length; i++) { 
	
        wsServer.connections[i].send(evento);
      
    }
  
}

function notificaClienteDesconexao(error) {
  
  if (error=null) error='';
  
      console.log('');
      console.error('\x1b[31m','Perdeu a conexão com o microbit...');
      console.error('\x1b[0m','');
 
      if (temClienteConectado()) {
          enviaMsgParaTodosClientes('desconectado:'+error);
      }
      
      // inicializa para devolver o valor após reconexão
      last_compass_point_name = "";
      last_temperature;
      last_x=0;
      last_y=0;
      last_z=0;
  
}


function notificaCliente(componente,valor) {
  
      if (temClienteConectado()) {
          enviaMsgParaTodosClientes(componente+","+valor);
      }
  
}


function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}


/******************** COMUNICAÇÃO INTER NODE.JS PARA USO COM NODE-RED ****************************/

const ipc = require('node-ipc');

function temNodeRedConectado() {

  return ipc!= null && ipc.server != null 
  
}

ipc.config.id = 'microbit';
ipc.config.retry= 1500;
ipc.config.silent=true;
ipc.config.delay= 5000;

const ACAO_TEXTO="TEXTO";
const ACAO_FIGURA="FIGURA"; 
const ACAO_PIN="PIN";
const ACAO_BOTAOA="A";
const ACAO_BOTAOB="B"; 
const ACAO_BOTAOAB="AB";    
const ACAO_ACELER="ACELER";   
const ACAO_MAG="MAG";   
const ACAO_MAGBEAR="MAGBEAR";   
const ACAO_TEMP="TEMP";   

ipc.serveNet(
    function(){
      
        /**************************************************************
         *     RECEBE COMANDOS DO NODE-RED E REPASSE PARA MICROBIT              
         **************************************************************/
      
        ipc.server.on(
            'to.microbit.message',
            function(data,socket){
                ipc.log('Recebeu mensagem do node-red', (data.id), (data.message));
                console.log('vai enviar para circuito microbit ',data.message);
                
                if (data.message.acao==ACAO_PIN) {
    
                  console.log('Definindo pino %d como saída (output)', data.message.pinId);
                  
                  microbitGlobal.pinOutput(data.message.pinId, function() {
                    console.log('\tPino definido como saída');

                    console.log('definindo pino %d como digital', data.message.pinId);
                    microbitGlobal.pinDigital(data.message.pinId, function() {
                      console.log('\tPino definido como digital');

                         togglePin(data.message.pinId,data.message.pinValor);
                    });
                  });
    
                } else  if (data.message.acao==ACAO_FIGURA) {
                  
                    enviaPadraoLED(PATTERNS[data.message.indiceFiguraLED]); 
                  
                } else  if (data.message.acao==ACAO_TEXTO) {
                  
                    enviaTexto(data.message.textoLED)
                } 
             
            }
        );
        
        /**************************************************************
         *     A PARTIR DAQUI, MONITORA SENSORES E ENVIA PARA NODE-RED              
         **************************************************************/

           
        ipc.server.on(
            'from.microbit.message.connection',
            function(data,socket){
              
                ipc.log('Recebeu mensagem do node-red', (data.id), (data.message));
                console.log('vai se inscrever para escutar sensor de microbit ',data.message);
                
                if (data.message.acao==ACAO_BOTAOA) {
    
                  /* BUTTON */
                   microbitGlobal.on('buttonAChange', function(value) {
                      
                      console.log('\tBotão A mudou: ', BUTTON_VALUE_MAPPER[value]);
                              
                      // Envia para Node-Red se ativo
                      if (temNodeRedConectado()) {
                        
                         ipc.server.broadcast(
                            'from.microbit.message.'+data.message.acao,
                            {
                                id:ipc.config.id,
                                topic: ACAO_BOTAOA,
                                message : BUTTON_VALUE_MAPPER[value]
                            }
                          );
                        
                      }
                    });
                    
                } else if (data.message.acao==ACAO_BOTAOB) {
    
                  /* BUTTON */
                   microbitGlobal.on('buttonBChange', function(value) {
                      console.log('\tBotão B mudou:: ', BUTTON_VALUE_MAPPER[value]);
                              
                      // Envia para Node-Red se ativo
                      if (temNodeRedConectado()) {
                         
                         ipc.server.broadcast(
                            'from.microbit.message.'+data.message.acao,
                            {
                                id:ipc.config.id,
                                topic: data.message.acao,
                                message : BUTTON_VALUE_MAPPER[value]
                            }
                          );
                        
                      }
                    });  

                 
                } else  if (data.message.acao==ACAO_ACELER) {
                  
                    microbitGlobal.on('accelerometerChange', function(x, y, z) {
                      //console.log('\ton -> accelerometer change: accelerometer = %d %d %d G', x.toFixed(1), y.toFixed(1), z.toFixed(1));
                             
                      if (x.toFixed(1) != last_x || y.toFixed(1) != last_y || z.toFixed(1) != last_z) {       
                               
                          // Envia para Node-Red se ativo
                          if (temNodeRedConectado()) {
                             
                             ipc.server.broadcast(
                                'from.microbit.message.'+data.message.acao,
                                {
                                    id:ipc.config.id,
                                    topic: data.message.acao,
                                    message : {x:x.toFixed(1), y:y.toFixed(1), z:z.toFixed(1)}
                                }
                              );
                            
                          }
                          
                          last_x=x.toFixed(1);
                          last_y=y.toFixed(1);
                          last_z=z.toFixed(1);
                        
                      }
                      
                      
                    });

                 
                } else  if (data.message.acao==ACAO_MAG) {
                  
                    microbitGlobal.on('magnetometerChange', function(x, y, z) {
                     
                           // Envia para Node-Red se ativo
                          if (temNodeRedConectado()) {
                             
                             ipc.server.broadcast(
                                'from.microbit.message.'+data.message.acao,
                                {
                                  id:ipc.config.id,
                                  topic: data.message.acao,
                                  message : {x:x.toFixed(1), y:y.toFixed(1), z:z.toFixed(1)}
                                }
                              );
                            
                          }

                      
                    });
                   
                  
                } else  if (data.message.acao==ACAO_MAGBEAR) {
                  
                    microbitGlobal.on('magnetometerBearingChange', function(bearing) {
                      //console.log('\ton -> magnetometer bearing change: magnetometer bearing = %d', bearing);
                      
                          var point_name = compassPoint(bearing);
                          if (point_name !== last_compass_point_name) {
                             console.log('\t Direção da Bússola: %s', point_name);
                             last_compass_point_name = point_name;
                             
                              
                             if (temNodeRedConectado()) {
                                 
                                 ipc.server.broadcast(
                                     'from.microbit.message.'+data.message.acao,
                                    {
                                        id:ipc.config.id,
                                         topic: data.message.acao,
                                         message: point_name
                                        
                                    }
                                  );
                                
                              }
                      
                             
                             
                          }
                     
                      
                    });
                  
                   
                } else  if (data.message.acao==ACAO_TEMP) {
                  
                   microbitGlobal.on('temperatureChange', function(temperature) {

                
                      if (temperature != last_temperature) {
                        
                        console.log('\tMudou a temperatura para %d °C', temperature);
                      
                        if (temNodeRedConectado()) {
                             
                             ipc.server.broadcast(
                                 'from.microbit.message.'+data.message.acao,
                                {
                                    id:ipc.config.id,
                                    topic: data.message.acao,
                                    message: temperature
                                }
                              );
                            
                          }
                        
                          last_temperature = temperature;
                        
                      }
                  });
  
                   
                } else if (data.message.acao==ACAO_PIN) {
                  
                  
                   microbitGlobal.pinInput(data.message.pinId, function() {

                    console.log('\tConfigurou pino %d como de entrada ',data.message.pinId);

                    if (data.message.pinSinal=="A") {

                        microbitGlobal.pinAnalog(data.message.pinId, function() {
                          console.log('Configurou pino %d como analógico', pin);

                          microbitGlobal.subscribePinData(function() {
                            //console.log('\tsubscribed to pin data');
                          });
                        
                        });
                     
                    
                    } else {
                      
                      // TODO VALIDAR
                       microbitGlobal.pinDigital(data.message.pinId, function() {
                          console.log('Configurou pino %d como digital', pin);

                          microbitGlobal.subscribePinData(function() {
                            //console.log('\tsubscribed to pin data');
                          });
                        
                        });
                      
                    }
                  
                   });
                  
                   microbitGlobal.on('pinDataChange', function(pin, value) {
                   // console.log('\ton -> pin data change: pin = %d, value = %d', pin, value);
                    
                       if (temNodeRedConectado()) {
                           
                           ipc.server.broadcast(
                              'from.microbit.message.'+data.message.acao,
                              {
                                  id:ipc.config.id,
                                  topic: data.message.acao,
                                  message : value
                              }
                            );
                          
                        }
                    
                  });
                  
                  
                }
             
            }
        );
        
    }
);

ipc.server.start();


