/*
 Mind Makers - mBot BLE Controller
 
 Paulo Alvim 04/2019
 Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const noble   = require('noble');

const readline = require('readline');

const devName               = "Makeblock_LE";
const mbotServiceUUID       = "ffe1";
const mbotReadEndPointUUID  = "ffe2";
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
var face = new Buffer( [0xff, 0x55, 0x17, 0x00, 0x02, 0x29, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00]);

// Read Ultrasensor data
var readUS =          new Buffer( [0xff, 0x55, 0x04, 0x00, 0x01, 0x01 ,0x03]);

//**************************************************
//     ff    55      len idx action device port slot data a
//      0     1       2   3   4      5      6    7    8
//      0xff  0x55   0x4 0x3 0x1    0x1    0x1  0xa
// ***************************************************/

//o valor de 0x03 é o device(sensor de luz), e o 0x06 é a port(onborard)
// Sensor de luz
var readLightSensor = new Buffer( [0xff, 0x55, 0x04, 0x00, 0x01, 0x03, 0x06]);

// Segue linha
var readLineFollower = new Buffer( [0xff, 0x55, 0x04, 0x00, 0x01, 0x11, 0x02]);

//Lê segue linha, botão A
var readIR = new Buffer( [0xff, 0x55, 0x05, 0x00, 0x01, 0x1E, 0x00, 0x45]);

//Botão onboard pressionado?
var read_onboard_button_pressed =  new Buffer( [0xFF, 0X55, 0x05, 0x00, 0x01, 0x23, 0x07, 0x00]);

//Botão onboard não pressionado?
var read_onboard_button_released =  new Buffer( [0xFF, 0X55, 0x05, 0x00, 0x01, 0x23, 0x07, 0x01]);

// Motor m1 - horario - frente 255
var motor_m1 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x09, 0x01, 0xFF]);

// Motor m2 -  horario - frente 255
var motor_m2 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x0A, 0xFF, 0x00]);

//ambos motores param
var motor_stop =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x00]);

//ambos motores avançam a 255
var motor_run255 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0xFF, 0x00]);

var motor_run100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x9C, 0xFF, 0x64, 0x00]);

//ambos motores dão ré a 255
var motor_reverse255 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF, 0x00, 0x01, 0xFF]);

var motor_reverse100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x64, 0x00, 0x9C, 0xFF]);

//ambos motores viram a direita a 255
var motor_turnright255 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0x01, 0xFF]);

//ambos motores viram a direita a 100
var motor_turnright100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x9C, 0xFF, 0x9C, 0xFF]);

//ambos motores viram a esquerda a 255
var motor_turnleft255 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0xFF, 0x00, 0xFF, 0x00]);

//ambos motores viram a esquerda a 100
var motor_turnleft100 =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x64, 0x00, 0x64, 0x00]);

//servo na porta 1, slot 1, 0 graus
var servo_0 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x00]);

//servo na porta 1, slot 1, 45 graus
var servo_1 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x2B]);

//servo na porta 1, slot 1, 90 graus
var servo_2 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x5A]);

//servo na porta 1, slot 1, 135 graus
var servo_3 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0x87]);

//servo na porta 1, slot 1, 180 graus
var servo_4 =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0xB4]);

// Buzzer
var buzz =      new Buffer( [0xff, 0x55, 0x07, 0x00, 0x02, 0x22, 0x06, 0x01, 0xf4, 0x01]);

//**************************************************
//     ff    55      len idx action device port slot data a
//      0     1       2   3   4      5      6    7    8
//      0xff  0x55   0x4 0x3 0x1    0x1    0x1  0xa
// ***************************************************/


/********************** VALORES HEXADECIMAIS DO FIRMWARE DO MBOT  - FIM **********************************
 *********************************************************************************************************/

// For cycling demo
var loop = 1;

noble.on('stateChange', function(state) {

     if (state === 'poweredOff') {
        console.log('');
        console.error('\x1b[31m','O Bluetooth não está ativado! Ative no ícone superior direito em seu computador e tente novamente.');
        console.error('\x1b[0m','');
        process.exit(1);
    } else if (state === 'poweredOn') {
        console.log('---------------------------------------------------------------');
        console.log('                    Serviço Bluetooth Ativo                    ');
        console.log('---------------------------------------------------------------');  

        console.log('Procurando por um mBot com módulo BLE a menos de 2m...');
        noble.startScanning();
    } else {
        console.log('Encerrando procura por dispositivos Bluetooth');
        noble.stopScanning();
    }
});

var contadorIntervalo = 0;
var macaddressConectado = null;
var notificouClienteConexao=false;
var monitoriaTask=null;

noble.on('discover', function(peripheral) {
 
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
   
    if (localName == devName  && peripheral.rssi>-60) {
     
   //     console.log('! Found device with local name: ' + localName );
   //     console.log('- Connecting to ' + localName + ' ['+ peripheral.id + ']');
        connectTombot( peripheral );

    }
});

noble.on('disconnect', function(data) {

   console.log('mBot desconectado'+data);
   
   notificaClienteDesconexao('');
   
   notificouClienteConexao=false;
   macaddressConectado=null;

});


function notificaClienteDesconexao(error) {
  
  if (error=null) error='';
  
      console.log('');
      console.error('\x1b[31m','Perdeu a conexão com o circuito eletrônico digital...');
      console.error('\x1b[0m','');
 
      if (temClienteConectado()) {
          wsServer.connections[0].send('desconectado:'+error);
      }
  
}


function notificaCliente(componente,valor) {
  
      if (temClienteConectado()) {
          wsServer.connections[0].send(componente+","+valor);
      }
  
}

function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}

function decimalParaHexa(numeroDecimal) {

  var hexString = numeroDecimal.toString(16);
  return parseInt(hexString, 16);
  
}



function connectTombot(peripheral) {

    peripheral.connect(error => {
         console.log('    Conectado ao mBot com macaddress:' + peripheral.uuid);
     
         macaddressConectado = peripheral.uuid;
         
           if (temClienteConectado()) {
                 wsServer.connections[0].send('conectado:'+macaddressConectado);
                 notificouClienteConexao=true;
                 contadorIntervalo=0;
          }
         
        // Serviço e caracteristicas a serem descobertas
        const serviceUUIDs   = [mbotServiceUUID];
        const charReadUUIDs  = [mbotReadEndPointUUID];
        const charWriteUUIDs = [mbotWriteEndPointUUID];

        // Caracteristica BLE que queremos encontrar
        // Se especificar as características read e write como um array, noble retorna um array vazio.
        // Então filtra após descobrir.
        peripheral.discoverSomeServicesAndCharacteristics( serviceUUIDs, [], function(error, services, chars ) {
            var mbotService = services[0];
//            console.log("Characte: " , chars[0].uuid);
//            console.log("Characte: " , chars[1].uuid);

            if (!error) {
               // console.log("Descobriu serviços do mBot...");

                for( var i in chars ) {
                    if ( chars[i].uuid == mbotReadEndPointUUID )
                        mbotReadDataDriver( error, mbotService, chars[i] );

                    if ( chars[i].uuid == mbotWriteEndPointUUID )
                        mbotWriteDataDriver( error, mbotService, chars[i] );
                }

              //  console.log("- End scanning BLE characteristics.");
            } else {
                console.log("Não encontrou servições BLE para o mBot...");
            }
        });

        
    });

    peripheral.on('disconnect', () => console.log('mBot foi desconectado...'));
}

var ultimoContador=-1;

function monitoraDispositivoConectado() {
  
  if (contadorIntervalo==ultimoContador) {
      console.log('contadorIntervalo='+contadorIntervalo+' e ultimoContador='+ultimoContador);
      ultimoContador=contadorIntervalo;
      
      // Assume que conexão está congelada
      notificaClienteDesconexao();
      
      clearInterval(monitoriaTask);
      
      noble.startScanning();
      
  } else {
      ultimoContador=-1;
  }
  
}

var poolSensor=0;

function mbotReadDataDriver(error, services, characteristics) {
    
    var mbotRComms = characteristics;

 //   console.log('! mbot READ BLE characteristic found.');


    // data callback receives notifications
    mbotRComms.on('data', (data, isNotification) => {
       //console.log('> mbot data received: "' + data.toString('hex') + '"');
              
               contadorIntervalo++;
          
          // Se não notificou cliente da conexão notifica agora
          if (temClienteConectado() &&  (contadorIntervalo==300 || !notificouClienteConexao)) {
                 //console.log('Entrou para notificar conexao');
                 wsServer.connections[0].send('conectado:'+macaddressConectado);
                 notificouClienteConexao=true;
                 contadorIntervalo=0;
          }
              
              
        // This doesn't work all the time.
        // We are epecting that the received data is a complete answer starting by 0xff and 0x55
        // To be perfect we need to "slide" the buffer looking for 0xff0x55
        if ( data[0] == 0xff )      // Command header
            if ( data[1] == 0x55 )
                if ( data[3] == 0x2 ) { // Float value
                    var buf = new Buffer(4);
                    buf[3] = data[4];
                    buf[2] = data[5];
                    buf[1] = data[6];
                    buf[0] = data[7];

                    //console.log(buf.toString('hex'));
                    var b = new ArrayBuffer(4);
                    var v = new DataView(b);
                    buf.forEach( function (b,i) {
                        v.setUint8(i,b);
                    });
                    
                   // console.log("float: " + v.getFloat32(0) );
                    //console.log("teste: " + JSON.stringify(data));
                       
                    if (poolSensor==0)  {  
                        notificaCliente(LINESENSOR,v.getFloat32(0)) 
                        poolSensor=1;   
                    } else if (poolSensor==1) {   
                        notificaCliente(LIGHTSENSOR,v.getFloat32(0))  
                        poolSensor=2;     
                    } else if (poolSensor==2) {   
                        notificaCliente(ULTRASOUNDSENSOR,v.getFloat32(0))   
                        poolSensor=0; 
                    } 
                        


                } 
                
                
    });

    // subscribe to be notified whenever the peripheral update the characteristic
    mbotRComms.subscribe(error => {
        if (error) {
            console.error('Erro ao subscrever para ouvir características do mbot BLE');
            notificaClienteDesconexao(error);
        } else {
              console.log('\x1b[0m\x1b[32m','Leitura de componentes digitais do mBot via bluetooth ativada');
              console.log('\x1b[0m','---------------------------------------------------------------------');
              monitoriaTask = setInterval(monitoraDispositivoConectado,3000);
        }
    });
}

var mbotWComms=null;

function mbotWriteDataDriver(error, services, characteristics) {
    mbotWComms = characteristics;

    //console.log('! mbot WRITE BLE characteristic found.');

    // create an interval to send data to the service
    let count = 0;
    setInterval(() => {
        count++;
        //const message = new Buffer('hello, ble ' + count, 'utf-8');

        // Lê dados do sensor de luz
        //Leitura de dados:
        //resposta 3, sem linha
        //resposta 2, apenas esquero em cima da linha
        //resposta 1, apenas direito em cima da linha
        //resposta 0, ambos  em cima da linha
        //
        if (poolSensor==0) {
            mbotWComms.write( readLineFollower , true , function(error) {
                  // console.log("Lendo dados do sensor de segue linha...");
           });

        } else if (poolSensor==1) {

            // Lê dados do sensor de luz
            mbotWComms.write( readLightSensor , true , function(error) {
                  //  console.log("Lendo dados do sensor de luz...");
            });
         
        } else if (poolSensor==2) {

            // Lê dados do sensor ultrassom
            mbotWComms.write( readUS , true , function(error) {
                   // console.log("Lendo dados do sensor ultrassom...");
            });

        }
        

        loop = ++loop % 2;

        //if ( (count % 5) == 0) console.log(".");
    }, 100);
}


readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    console.log(`You pressed the "${str}" key`);

    if (key.name=='space') {
          mbotWComms.write( motor_stop , true, function(error) {
                console.log("motores param");
            });
    }

    if (key.name=='up') {
          mbotWComms.write( motor_run255 , true, function(error) {
                console.log("ambos motores para frente");
            });
    }
    if (key.name=='w') {
          mbotWComms.write( motor_run100 , true, function(error) {
                console.log("ambos motores para frente");
            });
    }

    if (key.name=='down') {
          mbotWComms.write( motor_reverse255 , true, function(error) {
                console.log("ambos motores para trás");
            });
    }
    if (key.name=='s') {
          mbotWComms.write( motor_reverse100 , true, function(error) {
                console.log("ambos motores para trás");
            });
    }

    if (key.name=='right') {
          mbotWComms.write( motor_turnright255 , true, function(error) {
                console.log("ambos motores viram para direita");
            });
    }
    if (key.name=='d') {
          mbotWComms.write( motor_turnright100 , true, function(error) {
                console.log("ambos motores viram para direita");
            });
    }

    if (key.name=='left') {
         mbotWComms.write( motor_turnleft255 , true, function(error) {
                console.log("ambos motores viram para esquerda");
            });
    }
    if (key.name=='a') {
         mbotWComms.write( motor_turnleft100 , true, function(error) {
                console.log("ambos motores viram para esquerda");
            });
    }

    if (key.name=='0') {
          mbotWComms.write( ledColor0 , true, function(error) {
                console.log("Write Led Color1 OK");
            });
    }

    if (key.name=='1') {
          mbotWComms.write( ledColor1 , true, function(error) {
                console.log("Write Led Color1 OK");
            });
    }
     if (key.name=='2') {
         mbotWComms.write( ledColor2 , true, function(error) {
                console.log("Write Led Color2 OK");
            });
    }
    if (key.name=='3') {
         mbotWComms.write( buzz , true, function(error) {
                console.log("Barulho");
            });
    }
    if (key.name=='4') {
         mbotWComms.write( servo_0 , true, function(error) {
                console.log("servo a 0 graus");
            });
    }
    if (key.name=='5') {
         mbotWComms.write( servo_1 , true, function(error) {
                console.log("servo a 45 graus");
            });
    }
    if (key.name=='6') {
         mbotWComms.write( servo_2 , true, function(error) {
                console.log("servo a 90 graus");
            });
    }
    if (key.name=='7') {
         mbotWComms.write( servo_3 , true, function(error) {
                console.log("servo a 135 graus");
            });
    }
    if (key.name=='8') {
         mbotWComms.write( servo_4 , true, function(error) {
                console.log("servo a 180 graus");
            });
    }
    if (key.name=='9') {
         mbotWComms.write( read_onboard_button_pressed , true, function(error) {
                console.log("Botão na placa pressionado?");
            });
    }
    ///////////////////////////
    // }
    // if (key.name=='i') {
    //      mbotWComms.write( motor_run , true, function(error) {
    //             console.log("ambos motores vão para frente");
    //         });
    // }
    // if (key.name=='k') {
    //      mbotWComms.write( motor_reverse , true, function(error) {
    //             console.log("ambos motores vão para trás");
    //         });
    // }
    // if (key.name=='j') {
    //      mbotWComms.write( motor_turnleft , true, function(error) {
    //             console.log("ambos motores vão para esquerda");
    //         });
    // }
    // if (key.name=='l') {
    //      mbotWComms.write( motor_turnright , true, function(error) {
    //             console.log("ambos motores vão para direita");
    //         });
    // }
    // if (key.name=='o') {
    //      mbotWComms.write( servo , true, function(error) {
    //             console.log("ativa o servo");
    //         });
    // }
    // if (key.name=='+') {
    //   if(m<4){
    //     m +=1;
    //
    //     //atualização
    //     motor_run[6] = motor_speed[m];
    //     motor_run[8] = 0xFF - motor_speed[m];
    //     console.log("motor_run será = "+JSON.stringify(motor_run));
    //
    //     motor_reverse[6] =  0xFF - motor_speed[m];
    //     motor_reverse[8] =  0xFF - motor_speed[m];
    //     console.log("motor_reverse será = "+JSON.stringify(motor_reverse));
    //
    //     motor_turnright[6] = motor_speed[m];
    //     motor_turnright[8] = motor_speed[m];
    //     console.log("motor_turnright será = "+JSON.stringify(motor_turnright));
    //
    //     motor_turnleft[6] = 0xFF - motor_speed[m];
    //     motor_turnleft[6] = 0xFF - motor_speed[m];
    //     console.log("motor_turnleft será = "+JSON.stringify(motor_turnleft));
    //     console.log("Aperte 'i' 'j' 'k' 'l' para ativar a nova velocidade");
    //
    //   }
    // }
    // if (key.name=='-') {
    //   if(m>0){
    //     m -=1;
    //
    //     //atualização
    //     motor_run[6] = motor_speed[m];
    //     motor_run[8] = 0xFF - motor_speed[m];
    //     motor_reverse[6] =  0xFF - motor_speed[m];
    //     motor_reverse[8] =  0xFF - motor_speed[m];
    //     motor_turnright[6] = motor_speed[m];
    //     motor_turnright[8] = motor_speed[m];
    //     motor_turnleft[6] = 0xFF - motor_speed[m];
    //     motor_turnleft[6] = 0xFF - motor_speed[m];
    //     console.log("motor_run será = "+JSON.stringify(motor_run));
    //     console.log("motor_reverse será = "+JSON.stringify(motor_reverse));
    //     console.log("motor_turnright será = "+JSON.stringify(motor_turnright));
    //     console.log("motor_turnleft será = "+JSON.stringify(motor_turnleft));
    //     console.log("Aperte 'i' 'j' 'k' 'l' para ativar a nova velocidade");
    //   }
    // }
    // if (key.name=='*') {
    //   if(s<4){
    //     s+=1;
    //     servo[8] = servo_value[s];
    //     console.log("servo será = "+JSON.stringify(servo));
    //     console.log("Aperte 'o' para ativar a nova abertura do servo");
    //   }
    // }
    // if (key.name=='/') {
    //   if(s>0){
    //     s-=1;
    //     servo[8] = servo_value[s];
    //     console.log("servo será = "+JSON.stringify(servo));
    //     console.log("Aperte 'o' para ativar a nova abertura do servo");
    //   }
    // }
    ///////////////////////////

    console.log();
    console.log(key);
    console.log();
  }
});

const BUZZER='buzzer';

const DCMOTORM1='dcmotorm1';
const DCMOTORM2='dcmotorm2';
const DCMOTOR_FORWARD='forward';
const DCMOTOR_BACK='back';

// Velocidade na posição 8
const DCMOTORS='dcmotors';
const DCMOTORS_BACK='dcmotorsBack';
const DCMOTORS_RIGHT='dcmotorsRight';
const DCMOTORS_LEFT='dcmotorsLeft';

const SERVOMOTOR='servomotor';
const LEDLEFT='ledleft';
const LEDRIGHT='ledright';
const LEDBOTH='ledboth';
const PLAYNOTE='playnote';

const LINESENSOR='linesensor';
const ULTRASOUNDSENSOR='ultrasoundsensor';
const LIGHTSENSOR='lightsensor';

const BUTTON='button';
const BUTTON_PRESSED='pressed';
const BUTTON_RELEASED='released';

const IRSENSOR='irsensor';

// Recebe comando obtido do Blockly e envia para mBot.
function escreveParaMBot(comando,valor) {
  
  if (comando==BUZZER) {
       
       mbotWComms.write( buzz , true, function(error) {
                //console.log(BUZZER);
            });
            
  } else if (comando==DCMOTORM1) {
      
        var dcMotorM1BaseBufferMax =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x09, 0x01, 0xFF]);
 
        var sentidoPotencia = valor.split(',');
        var sentido = sentidoPotencia[0];
        var potencia = sentidoPotencia[1];        
 
        if (sentido = DCMOTOR_FORWARD) {
            var velm1 = 255 - parseInt(potencia);
            if (velm1==0) velm1=1;
            dcMotorM1BaseBufferMax.writeUInt8(velm1,7);
        } else {
            dcMotorM1BaseBufferMax.writeUInt8(Oxff,7);
            dcMotorM1BaseBufferMax.writeUInt8(parseInt(potencia),8);              
        }

        mbotWComms.write( dcMotorM1BaseBufferMax , true, function(error) {
          //  console.log("Motor M1 pra frente com "+valor,dcMotorM1BaseBufferMax);
        });  
        
      
  } else if (comando==DCMOTORM2) {
      
       var dcMotorM2BaseBufferMax =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0A, 0x0A, 0xFF, 0x00]);
 
       var sentidoPotencia = valor.split(',');
       var sentido = sentidoPotencia[0];
       var potencia = sentidoPotencia[1];   
        
       if (sentido = DCMOTOR_FORWARD) {
             dcMotorM2BaseBufferMax.writeUInt8(parseInt(potencia),7);
        } else {
            var velm1 = 255 - parseInt(potencia);
            if (velm1==0) velm1=1;
            dcMotorM1BaseBufferMax.writeUInt8(velm1,7);              
            dcMotorM1BaseBufferMax.writeUInt8(Oxff,8);
        }
      
        mbotWComms.write( dcMotorM2BaseBufferMax , true, function(error) {
          //  console.log("Motor M2 pra frente com "+valor,dcMotorM2BaseBufferMax);
        });  
      
  } else if (comando==DCMOTORS || comando==DCMOTORS_BACK || comando==DCMOTORS_RIGHT || comando==DCMOTORS_LEFT) {
      
        const DCMOTORS_STOP =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x00]);
        var dcMotorsBaseBufferMax =  new Buffer( [0xFF, 0X55, 0x07, 0x00, 0x02, 0x05, 0x01, 0xFF, 0xFF, 0x00]);
              
        var sentidoPotenciaCalibragem = valor.split(',');  
        valor = sentidoPotenciaCalibragem[0];
        var potenciaAdicionalEsquerda=parseInt(sentidoPotenciaCalibragem[1]);
        var potenciaAdicionalDireita=parseInt(sentidoPotenciaCalibragem[2]);
    
        if (parseInt(valor)==0) {
            mbotWComms.write( DCMOTORS_STOP , true, function(error) {
            //    console.log("para motores ");
            });  
        } else {
            // Cada motor gira para um sentido oposto ao do outro e não podem ser 0 (mínimo 1)
            var velm1 = 255 - parseInt(valor);
            
            // para frente conforme valor
            if (comando==DCMOTORS) {   
                velm1 = velm1-potenciaAdicionalEsquerda;  
                if (velm1<=0) velm1=1;
                veldir = parseInt(valor)+potenciaAdicionalDireita;
                if (veldir>255) veldir=255;    
                console.log(velm1+', '+veldir);            
                dcMotorsBaseBufferMax.writeUInt8(velm1,6);
                dcMotorsBaseBufferMax.writeUInt8(255,7);
                dcMotorsBaseBufferMax.writeUInt8(veldir,8);
                dcMotorsBaseBufferMax.writeUInt8(0,9);
            } else if (comando==DCMOTORS_BACK) {
                dcMotorsBaseBufferMax.writeUInt8(255,6);  
                dcMotorsBaseBufferMax.writeUInt8(velm1,7);
                dcMotorsBaseBufferMax.writeUInt8(0,8);              
                dcMotorsBaseBufferMax.writeUInt8(parseInt(valor),9);
            } else if (comando==DCMOTORS_RIGHT) {
                dcMotorsBaseBufferMax.writeUInt8(255,6);  
                dcMotorsBaseBufferMax.writeUInt8(velm1,7);
                dcMotorsBaseBufferMax.writeUInt8(255,8);              
                dcMotorsBaseBufferMax.writeUInt8(velm1,9);
            } else if (comando==DCMOTORS_LEFT) {
                dcMotorsBaseBufferMax.writeUInt8(0,6);  
                dcMotorsBaseBufferMax.writeUInt8(parseInt(valor),7);
                dcMotorsBaseBufferMax.writeUInt8(0,8);              
                dcMotorsBaseBufferMax.writeUInt8(parseInt(valor),9);
            }
                        
            mbotWComms.write( dcMotorsBaseBufferMax , true, function(error) {
          //      console.log("ambos motores "+valor,dcMotorsBaseBufferMax);
            });  
            
        }
      
  } else if (comando==SERVOMOTOR) {
      
      var servoMotorsBaseBuffer180Max =  new Buffer( [0xFF, 0X55, 0x06, 0x00, 0x02, 0x0B, 0x01, 0x01, 0xB4]);
     
      var anguloPortaSlot = valor.split(',');
     
      var porta = parseInt(anguloPortaSlot[0]);
      var slot = parseInt(anguloPortaSlot[1]);
      var angulo = parseInt(anguloPortaSlot[2]);
            
      if (angulo > 120) angulo = 120;

      servoMotorsBaseBuffer180Max.writeUInt8(porta,6);          
      servoMotorsBaseBuffer180Max.writeUInt8(slot,7);    
      servoMotorsBaseBuffer180Max.writeUInt8(angulo,8);
      
      mbotWComms.write( servoMotorsBaseBuffer180Max , true, function(error) {
       // console.log("servo no angulo"+valor,servoMotorsBaseBuffer180Max);
      }); 
      
  } else if (comando==LEDLEFT || comando==LEDRIGHT || comando==LEDBOTH) {
      
     var ledBase = new Buffer([0xff, 0x55, 0x09, 0x00, 0x02, 0x08, 0x07, 0x02, 0x02, 0xff, 0xFF, 0xff]);   
     var rgb = valor.split(',');
     
     if (comando==LEDLEFT) 
        ledBase.writeUInt8(2,8); 
     else if (comando==LEDRIGHT) 
        ledBase.writeUInt8(1,8);
     else
        ledBase.writeUInt8(0,8);     
     
     ledBase.writeUInt8(parseInt(rgb[0]),9);  
     ledBase.writeUInt8(parseInt(rgb[1]),10);
     ledBase.writeUInt8(parseInt(rgb[2]),11);              
     
      mbotWComms.write( ledBase , true, function(error) {
        //console.log("LED"+valor,ledBase);
      }); 

      
  }  else if (comando==PLAYNOTE) {
 
     var buzzBase = new Buffer( [0xff, 0x55, 0x07, 0x00, 0x02, 0x22, 0x06, 0x01, 0xf4, 0x01]);     
     
     var notaTempo = valor.split(',');
     
     var nota = notaTempo[0];
     var tempo = notaTempo[1];     
     
     // nota
   if (nota=='C2') {
        buzzBase.writeUInt8(0x41,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='D2') {
        buzzBase.writeUInt8(0x49,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='E2') {
        buzzBase.writeUInt8(0x52,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='F2') {
        buzzBase.writeUInt8(0x57,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='G2') {
        buzzBase.writeUInt8(0x62,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='A2') {
        buzzBase.writeUInt8(0x6E,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='B2') {
        buzzBase.writeUInt8(0x7B,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='C3') {
        buzzBase.writeUInt8(0x83,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='D3') {
        buzzBase.writeUInt8(0x93,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='E3') {
        buzzBase.writeUInt8(0xa5,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='F3') {
        buzzBase.writeUInt8(0xaf,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='G3') {
        buzzBase.writeUInt8(0xc4,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='A3') {
        buzzBase.writeUInt8(0xdc,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='B3') {
        buzzBase.writeUInt8(0xf7,6); 
        buzzBase.writeUInt8(0x00,7); 
     } else if (nota=='C4') {
        buzzBase.writeUInt8(0x06,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='D4') {
        buzzBase.writeUInt8(0x26,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='E4') {
        buzzBase.writeUInt8(0x4a,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='F4') {
        buzzBase.writeUInt8(0x5d,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='G4') {
        buzzBase.writeUInt8(0x88,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='A4') {
        buzzBase.writeUInt8(0xb8,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='B4') {
        buzzBase.writeUInt8(0xee,6); 
        buzzBase.writeUInt8(0x01,7); 
     } else if (nota=='C5') {
        buzzBase.writeUInt8(0x0b,6); 
        buzzBase.writeUInt8(0x02,7); 
     } else if (nota=='D5') {
        buzzBase.writeUInt8(0x4b,6); 
        buzzBase.writeUInt8(0x02,7); 
     } else if (nota=='E5') {
        buzzBase.writeUInt8(0x93,6); 
        buzzBase.writeUInt8(0x02,7); 
     } else if (nota=='F5') {
        buzzBase.writeUInt8(0xba,6); 
        buzzBase.writeUInt8(0x02,7); 
     } else if (nota=='G5') {
        buzzBase.writeUInt8(0x10,6); 
        buzzBase.writeUInt8(0x03,7); 
     } else if (nota=='A5') {
        buzzBase.writeUInt8(0x70,6); 
        buzzBase.writeUInt8(0x03,7); 
     } else if (nota=='B5') {
        buzzBase.writeUInt8(0xdc,6); 
        buzzBase.writeUInt8(0x03,7); 
     } else if (nota=='C6') {
        buzzBase.writeUInt8(0x17,6); 
        buzzBase.writeUInt8(0x04,7); 
     } else if (nota=='D6') {
        buzzBase.writeUInt8(0x97,6); 
        buzzBase.writeUInt8(0x04,7); 
     } else if (nota=='E6') {
        buzzBase.writeUInt8(0x27,6); 
        buzzBase.writeUInt8(0x05,7); 
     } else if (nota=='F6') {
        buzzBase.writeUInt8(0x75,6); 
        buzzBase.writeUInt8(0x05,7); 
     } else if (nota=='G6') {
        buzzBase.writeUInt8(0x20,6); 
        buzzBase.writeUInt8(0x06,7); 
     } else if (nota=='A6') {
        buzzBase.writeUInt8(0xE0,6); 
        buzzBase.writeUInt8(0x06,7); 
     } else if (nota=='B6') {
        buzzBase.writeUInt8(0xB8,6); 
        buzzBase.writeUInt8(0x07,7); 
     } else if (nota=='C7') {
        buzzBase.writeUInt8(0x2D,6); 
        buzzBase.writeUInt8(0x08,7); 
     } else if (nota=='D7') {
        buzzBase.writeUInt8(0x0D,6); 
        buzzBase.writeUInt8(0x09,7); 
     } else if (nota=='E7') {
        buzzBase.writeUInt8(0x4D,6); 
        buzzBase.writeUInt8(0x0A,7); 
     } else if (nota=='F7') {
        buzzBase.writeUInt8(0xEA,6); 
        buzzBase.writeUInt8(0x0A,7); 
     } else if (nota=='G7') {
        buzzBase.writeUInt8(0x40,6); 
        buzzBase.writeUInt8(0x0C,7); 
     } else if (nota=='A7') {
        buzzBase.writeUInt8(0xC0,6); 
        buzzBase.writeUInt8(0x0D,7); 
     } else if (nota=='B7') {
        buzzBase.writeUInt8(0x6F,6); 
        buzzBase.writeUInt8(0x0F,7); 
     } else if (nota=='C8') {
        buzzBase.writeUInt8(0x5A,6); 
        buzzBase.writeUInt8(0x10,7); 
     } else if (nota=='D8') {
        buzzBase.writeUInt8(0x5B,6); 
        buzzBase.writeUInt8(0x12,7); 
     } 
      
     // tempo
     if (tempo=='1/8') {
        buzzBase.writeUInt8(0x7d,8); 
        buzzBase.writeUInt8(0x00,9); 
     } else if (tempo=='1/4') {
        buzzBase.writeUInt8(0xfa,8); 
        buzzBase.writeUInt8(0x00,9); 
     } else if (tempo=='1/2') {
        buzzBase.writeUInt8(0xf4,8); 
        buzzBase.writeUInt8(0x01,9); 
     } else if (tempo=='1') {
        buzzBase.writeUInt8(0xe8,8); 
        buzzBase.writeUInt8(0x03,9); 
     } else if (tempo=='2') {
        buzzBase.writeUInt8(0xd0,8); 
        buzzBase.writeUInt8(0x07,9); 
     } 
      
      mbotWComms.write( buzzBase , true, function(error) {
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
    console.log('---------------------------------------------------------------');
    console.log('            '+(new Date().toLocaleString()) + ' Servidor ouvindo na porta 8081');
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
                 wsServer.connections[0].send('conectado:'+macaddressConectado);
                 notificouClienteConexao=true;
                 contadorIntervalo=0;
          }
   
    connection.on('message', function(comandoValorStr) {

      console.log('RECEBEU MENSAGEM ',comandoValorStr.utf8Data);
      
      var comandoValor = JSON.parse(comandoValorStr.utf8Data);
      
      console.log('RECEBEU MENSAGEM ',comandoValor.valor);
                  
      escreveParaMBot(comandoValor.comando,comandoValor.valor);
      
    });
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date().toLocaleString()) + ' Conexão ' + connection.remoteAddress + ' finalizada.');
    });
});



