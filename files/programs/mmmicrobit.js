// subscribes to the accelerometer service and prints out values

var BBCMicrobit = require('bbc-microbit'); // or require('bbc-microbit')

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

BBCMicrobit.discover(function(microbit) {
  
  console.log('\tDescobriu o microbit: id = %s, macaddress = %s', microbit.id, microbit.address);


  microbitGlobal=microbit;

  microbit.on('disconnect', function() {
    console.log('\tmicrobit desconectou!');
    
    ipc.server.broadcast(
            'microbit.desconectado',
            {
                id:ipc.config.id
            }
          );
          
    
  });

 
  /********************************************************************
   * REGISTROS E ESCRITA DE TODOS OS SENSORES - SEMPRE OUVE TODOS.
   * ******************************************************************/
  console.log('Conectando ao microbit...');
  microbit.connectAndSetUp(function() {
    console.log('\tConectou ao microbit');

     microbit.subscribeButtons(function() {
      //console.log('\tsubscribed to buttons');
    });

    console.log('definido período do acelerômetro para %d ms', period);
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
    
    console.log('Definindo pino %d como entrada (input)', pin);
    microbit.pinInput(pin, function() {
      console.log('\tPino definido como entrada');

      console.log('Definindo pino %d como analógico', pin);
      microbit.pinAnalog(pin, function() {
        console.log('\tPino definido como analógico');

//        console.log('subscribing to pin data');
        microbit.subscribePinData(function() {
  //        console.log('\tsubscribed to pin data');
        });
      });
    });
    
    console.log('Definindo período do sensor de temperatura para %d ms', period);
    microbit.writeTemperaturePeriod(period, function() {
      console.log('\tPeríodo do sensor de temperatura definido');

//      console.log('subscribing to temperature');
      microbit.subscribeTemperature(function() {
  //      console.log('\tsubscribed to temperature');
      });
    });
    
    
  });
});

      
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
        var last_compass_point_name = "";
        var last_temperature;
        var last_x=0;
        var last_y=0;
        var last_z=0;
           
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


