/*
  Interaçao com BLE Bit

  Paulo Alvim 04/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')  
//const si = require('systeminformation')
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');

var blebitServiceUuid = '0705d0c0c8d841c9ae1552fad5358b8a';
var blebitSignalCharacteristicUuid = '0705d0c0c8d841c9ae1552fad5358b8a';  
var blebitService=null;
var blebitSignalCharacteristic=null;
          
                     
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('Procurando por um BLE Bit a menos de 2m...');
    noble.startScanning();
  } else {
   console.log('Encerrando procura');
   noble.stopScanning();
 }
});


noble.on('discover', function(peripheral) {
  
  if ((''+peripheral.advertisement.localName).indexOf('w30') == 0 &&
          peripheral.rssi>-60) {

   //console.log(peripheral);    
   // console.log(peripheral.advertisement);
   // console.log(peripheral.advertisement.serviceData); 
     
    peripheral.connect(function(error) {
    
        console.log('Conectando ao BLE BIT com macaddress:' + peripheral.uuid);
   //console.log(peripheral);    
         var obj = peripheral.advertisement.serviceData[0];
         console.log(obj.data[0]);
    
     
        peripheral.discoverServices([blebitServiceUuid], function(err, services) {
    
        services[0].discoverCharacteristics([], function(error, characteristics) {
       
          characteristic = characteristics[0];

          // cria sinal de outra forma
          const bufWrite = Buffer.allocUnsafe(3);
          
          bufWrite.writeUInt8(0x00, 0);
          bufWrite.writeUInt8(2, 1);
          bufWrite.writeUInt8(0xff, 2);
       
          console.log('antes escrever');
                    
          characteristic.write(bufWrite, true, function (error) {
                            if (!error) {
                               console.log(bufWrite);
                            } else {
                              console.log('errou ao escrever');
                              console.log(error);
                            }
                        });

          characteristic.on('data', function(data, isNotification) {
            console.log(data);
          });

          characteristic.subscribe(function(error) {
            console.log('notificacao ligada');
          });
          
        })

     })

   });
    
  }

});

function testeF() {
    console.log('entrou apos escrever');
}

function decimalParaHexa(numeroDecimal) {

  var hexString = numeroDecimal.toString(16);
  return parseInt(hexString, 16);
  
}

