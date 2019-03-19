/*
  Mind Makers Blockly.
  Serviço Node para seleção dos dispositivos bluetooth disponíveis. 
  Paulo Alvim 20/12/2016
 
  1. Certificar-se que o bluetooth do PI está ligado
  2. Rodar com "sudo node appble.js". 
  3. Testar abrindo o navegador e chamando http://localhost

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/
const express = require('express')  
const app = express()
var noble = require('/home/pi/node_modules/noble/index.js')


// Este servidor foi concebido para rodar local, por isso o uso de estado
// em variáveis globais
var global_jsondevicelist=[]


// Permite que página da aplicação Mind Makers acesse este servidor local
app.use((request, response, next) => {  
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  next()
})

app.get('/', (request, response) => {  
  response.json(global_jsondevicelist)
})

app.listen(8080) 

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', function(peripheral) {
  
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  console.log();

  global_jsondevicelist.push({"address":peripheral.address,
 				"localname":peripheral.advertisement.localName,
				"rssi":peripheral.rssi, 
				"manufacter":JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))});

});


 