/*
 Mind Makers - mBot Controller

 Adaptqado de:

// Author: fcgdam/PrimalCortex 2018.
//
// Sample code to connect the computer to the mBot Bluetooth module.
//
// One of the versions of the mbot v1.1 comes with an onboard bluetooth module.
// This module, according to the schematics is wired to the TX/RX arduino pins, and uses the baud rate of 115200.
// So it is possible to communicate with mbot through bluetooth to send commands and receive data. This is what mblock program does.
//
// This code is a stepping stone to enable computer <-> mbot communications so that we can use another protocol and programs instead of mblock.
//
// As far as I'm aware with the available devices that I have:
//
// mBot bluetooth advertises Makeblock_LE name.
//
// After connecting there is one service that has two characteristics:
//
// Service UUID: 0000ffe1-0000-1000-8000-00805f9b34fb   -> We can use the short notation ffe1
//
//  READ UUID: 0000ffe2-0000-1000-8000-00805f9b34fb -> We can use the short notation ffe2
//
//  WRITE UUID: 0000ffe3-0000-1000-8000-00805f9b34fb -> We can use the short notation ffe3
//
// After some testing with some BLE tools, the above UUIDs are the ones that allow to communicate with mbot through BLE.
// Also the READ characteristic supports notification, so our callback for read will be triggered when there is data available from the mBot.
//
// So basically when writing to the write characteristic will send data to the mbot, and when data is available, we get notified.
//
// Overall this works just fine, not very fast, but allows to build on top of this much nicer projects. */

const noble   = require('noble');

const readline = require('readline');

const devName               = "Makeblock_LE";
const mbotServiceUUID       = "ffe1";
const mbotReadEndPointUUID  = "ffe2";
const mbotWriteEndPointUUID = "ffe3";

const ir_A = 45;
const ir_B = 46;
const ir_C = 47;
const ir_D = 44;
const ir_E = 43;
const ir_F = 0D;
const ir_UP = 40;
const ir_DOWN = 19;
const ir_LEFT = 07;
const ir_RIGHT = 09;
const ir_SETTINGS = 15;
const ir_R0 = 16;
const ir_R1 = 0C;
const ir_R2 = 18;
const ir_R3 = 5E;
const ir_R4 = 08;
const ir_R5 = 1C;
const ir_R6 = 5A;
const ir_R7 = 42;
const ir_R8 = 52;
const ir_R9 = 4A;

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
var face = new Buffer( [0xff, 0x55 ,0x17 ,0x00 ,0x02 ,0x29 ,0x04 ,0x02 ,0x00 ,0x00 ,0x00 ,0x00 ,0x40 ,0x48 ,0x44 ,0x42 ,0x02 ,0x02 ,0x02 ,0x02 ,0x42 ,0x44 ,0x48 ,0x40 ,0x00 ,0x00]);

// Read Ultrasensor data
var readUS =          new Buffer( [0xff, 0x55 ,0x04 ,0x00 ,0x01 ,0x01 ,0x03]);

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

// For cycling demo
var loop = 1;

noble.on('stateChange', function(state) {
    console.log("- Bluetooth state change");

    if (state === 'poweredOn') {
        console.log("  - Start scanning...");
        noble.startScanning();
    } else {
        console.log("  - Stopped scanning...");
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;

    console.log('! Found device with local name: ' + localName );

    if ( localName == devName ) {
        noble.stopScanning();
        console.log('! Mbot robot found! ');
        console.log("  - Stopped scanning...");
        console.log('- Connecting to ' + localName + ' ['+ peripheral.id + ']');
        connectTombot( peripheral );
    }
});

function connectTombot(peripheral) {

    peripheral.connect(error => {
        console.log('! Connected to', peripheral.id);

        // specify the services and characteristics to discover
        const serviceUUIDs   = [mbotServiceUUID];
        const charReadUUIDs  = [mbotReadEndPointUUID];
        const charWriteUUIDs = [mbotWriteEndPointUUID];

        // The second parameter defines the set of BLE characteristics that we want to find.
        // But if I specify the mbot read and write chracteristics as an array, noble returns an empty array.
        // So I filter after the discovery.
        peripheral.discoverSomeServicesAndCharacteristics( serviceUUIDs, [], function(error, services, chars ) {
            var mbotService = services[0];
//            console.log("Characte: " , chars[0].uuid);
//            console.log("Characte: " , chars[1].uuid);

            if (!error) {
                console.log("! mbot BLE service found!");

                for( var i in chars ) {
                    if ( chars[i].uuid == mbotReadEndPointUUID )
                        mbotReadDataDriver( error, mbotService, chars[i] );

                    if ( chars[i].uuid == mbotWriteEndPointUUID )
                        mbotWriteDataDriver( error, mbotService, chars[i] );
                }

                console.log("- End scanning BLE characteristics.");
            } else {
                console.log("! mbot BLE service not found... Sorry!");
            }
        });

    });

    peripheral.on('disconnect', () => console.log('! Mbot has disconnected...'));
}

function mbotReadDataDriver(error, services, characteristics) {
    var mbotRComms = characteristics;

    console.log('! mbot READ BLE characteristic found.');

    // data callback receives notifications
    mbotRComms.on('data', (data, isNotification) => {
        console.log('> mbot data received: "' + data.toString('hex') + '"');
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
                    console.log("float: " + v.getFloat32(0) );
                    console.log("teste: " + JSON.stringify(data));


                } else if (data[3] == 0x1  ) {
                   // 1-byte
                    console.log("identificou byte = "+data[4]);
                    console.log("identificou byte = "+JSON.stringify(data));


                } else if (data[3] == 0x3 ) {
                   // 3-short
                    console.log("identificou short = "+data[4]+data[5]+data[6]+data[7]);
                    console.log("identificou short = "+JSON.stringify(data));


                } else {
                   // 4-len+string
                   console.log("identificou len+string = "+data[4]+data[5]+data[6]+data[7]);
                   console.log("identificou len+string = "+JSON.stringify(data));

                }




    });

    // subscribe to be notified whenever the peripheral update the characteristic
    mbotRComms.subscribe(error => {
        if (error) {
            console.error('! Error subscribing to mbot BLE characteristic');
        } else {
            console.log('! Subscribed for mbot read notifications');
        }
    });
}

var mbotWComms=null;

function mbotWriteDataDriver(error, services, characteristics) {
    mbotWComms = characteristics;

    console.log('! mbot WRITE BLE characteristic found.');

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
        //mbotWComms.write( readLineFollower , true , function(error) {
        //       console.log("Lendo dados do sensor de segue linha...");
        //});

        // Lê dados do sensor de luz
        //mbotWComms.write( readLightSensor , true , function(error) {
        //        console.log("Lendo dados do sensor de luz...");
        //});

        // Lê dados do sensor ultrassom
       // mbotWComms.write( readUS , true , function(error) {
       //         console.log("Lendo dados do sensor ultrassom...");
       // });

       // Pergunta se botão da A do controle está pressionado
       mbotWComms.write( readIR , true , function(error) {
               console.log("Lendo se o botão A do controle está pressionado...");
       });
     
     // Pergunta se botão da placa está pressionado
      // mbotWComms.write( read_onboard_button_pressed , true , function(error) {
      //         console.log("Lendo o botão onBoard está pressionado...");
      // });

      // Pergunta se botão da placa NÃO está pressionado
     // mbotWComms.write( read_onboard_button_released , true , function(error) {
     //         console.log("Lendo o botão onBoard NÃO está pressionado...");
     // });


        loop = ++loop % 2;

        //if ( (count % 5) == 0) console.log(".");
    }, 1500);
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
                console.log("Barulho");
            });
    }
    if (key.name=='5') {
         mbotWComms.write( servo_1 , true, function(error) {
                console.log("Barulho");
            });
    }
    if (key.name=='6') {
         mbotWComms.write( servo_2 , true, function(error) {
                console.log("Barulho");
            });
    }
    if (key.name=='7') {
         mbotWComms.write( servo_3 , true, function(error) {
                console.log("Barulho");
            });
    }
    if (key.name=='8') {
         mbotWComms.write( servo_4 , true, function(error) {
                console.log("Barulho");
            });
    }
    if (key.name=='9') {
         mbotWComms.write( read_onboard_button_pressed , true, function(error) {
                console.log("Barulho");
            });
    }


    console.log();
    console.log(key);
    console.log();
  }
});
console.log('Press any key...');
