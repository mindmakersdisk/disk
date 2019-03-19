/*
  Mind Makers Blockly.
  Serviço Node para controle do robô Sphero
  Paulo Alvim 20/12/2016
 
  1. Certificar-se que o bluetooth do PI está ligado
  2. Rodar com "sudo node app.js [macaddress]", onde macaddress é de um sphero visível pelo bluetooth. Ex.: sudo node app.js E8:8A:B4:69:69:99 
  3. Testar abrindo o navegador e chamando http://localhost?code=[codigo-sphero.js]
  4. Para desconectar, fechar o serviço do Node

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

// Alvim 20/12/2016
// Este servidor foi concebido para rodar local, por isso o uso de estado em variáveis globais
// captura macaddress como argumento
var args = process.argv.slice(2)
var macaddressArg=args[0]
var code = ""
var macaddress = ""
var currentAngle=0;  // para frente
var eConfig=true;

console.log('Entrou com macaddress: '+macaddressArg)

if (macaddressArg) {
	macaddress=macaddressArg
}

var sphero = require("sphero"),
    bb8 = sphero(args[0]);

// submete comandos dinamicamente, para o SPRK+
bb8.connect(function() {

  bb8.ping();  // Importante: evita travamentos inesperados
 
  bb8.version(function(err, data) {   
     if (err) { console.error("err:", err); } 
     else 
      { console.log("Versão:" + data.msaVer+ '.'+ data.msaRev); }
     });
	 
  console.log('Conectou com sucesso! Aguardando comandos em http://localhost?code=')
 
  count=0;

  setInterval(function() {

     if (count % 60 == 0) {     console.log('Verificando comandos ...') }

     count++;

     if (code!='') {

	try {
         
	 console.log('Vai executar: '+code)
	 	 
	 eval(code)
	 	 
	 if (!eConfig) {
		}		
	} catch(e) {
	 console.log('Erro ao tentar executar comando. Erro: '+e)
	}
	code=''
  
   }
 
  }, 1000);

});

const express = require('express')  
const app = express()
 
// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    next();
});

app.get('/', (request, response) => {  
 

//  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code!=null) {
    eConfig=request.query.config!=null;
     currentAngle=0; 
     code=request.query.code

/*
	try {
         console.log('Vai executar: '+code)
	 eval(code)
	// if (!eConfig) {
	//	bb8.color('black')
	 //	bb8.setBackLed(0)
	//	}		
	} catch(e) {
	 console.log('Erro ao tentar executar comando. Erro: '+e)
	}
*/


  }

  response.json({
    status: 'ok',codigo:code
  })
})

app.get('/dispositivocorrente', (request, response) => {  
  
 // response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code!=null) {
     code=request.query.code
  }

  response.json({
    dispositivo: macaddress
  })
})


function wait(seconds) {
    var iMilliSeconds = seconds * 1000
    var counter= 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}

app.listen(80) 


 
