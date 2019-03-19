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
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')


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
  
  if (peripheral.rssi>-60  && (
            (''+peripheral.advertisement.localName).indexOf('SK') == 0 || 
            (''+peripheral.advertisement.localName).indexOf('Sphero')==0)) {
    
      console.log('Sphero com macaddress:'+peripheral.address +  ', '  + ' conectável?' + peripheral.connectable + ',' +
                  ' RSSI:' + peripheral.rssi + ', nome:'+peripheral.advertisement.localName);

}

  global_jsondevicelist.push({"address":peripheral.address,
 				"localname":peripheral.advertisement.localName,
				"rssi":peripheral.rssi, 
				"manufacter":JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))});

});


 
