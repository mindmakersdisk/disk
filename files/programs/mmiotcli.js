/*
  Serviço da Sala IoT - Conexão Local Dinâmica 
  Paulo Alvim 19/16/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

var shell = require('shelljs');

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


var macaddressArg;
var code = ""
var currentAngle=0;  // para frente
var eConfig=true;

var inquirer = require('inquirer');
var fs = require('fs');
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
const request = require('request')
var modoRegistro = false;

              
fs.readFile('/home/mindmakers/school.info', function(err,data)
    {
      if (err) {
          
          console.log("Essa estação ainda não está ativada. Ative antes de usar o Sphero");
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
          
              macaddressArg = sphero_registrado;
            
      }
      
    });


/*******************************************************************
 *  controlador Sphero daqui por diante 
 *******************************************************************/
var WebSocketServer = require('websocket').server;

var http = require('http');    
const express = require('express')  
const app = express()
 
// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    next();
});

// PING
app.get('/', (request, response) => {  
 

//  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.code!=null) {
    eConfig=request.query.config!=null;
     currentAngle=0; 
     code=request.query.code

  }

  response.json({
    status: 'ok',codigo:code
  })
})

const DIR_BASE_IMGS = '/home/mindmakers/imgs';
const CHROMIUM_BASE = 'chromium-browser';
const TYPE_IMG_NUMBER = "r";
const TYPE_IMG_ROBOGODE = "g";
const TYPE_IMG_ROBOLADY = "l";
const TYPE_IMG_NAMED = "n";
// Robogode 0 a 16
const ORIGINAL = 'o_original';
const O_3D = 'o_3d';
const BASQUETE = 'o_basquete';
const BOX = 'o_boxe';
const ENGENHEIRO = 'o_engenheiro';
const EXPLORADOR = 'o_explorador';
const FAZENDEIRO = 'o_fazendeiro';
const GARI = 'o_gari';
const LENHADOR = 'o_lenhador';
const MARATONISTA = 'o_maratonista';
const MARINHEIRO = 'o_marinheiro';
const MUSICO = 'o_musico';
const NEVE = 'o_neve';
const PAPERCRAFT = 'o_papercraft';
const POLICIAL = 'o_policial';
const SOCIAL = 'o_social';
const TURISTA = 'o_turista';
const ROBOGODES = [ORIGINAL,O_3D,BASQUETE,BOX,ENGENHEIRO,EXPLORADOR,FAZENDEIRO,GARI,LENHADOR,
                          MARATONISTA,MARINHEIRO,MARINHEIRO,MUSICO,NEVE,PAPERCRAFT,POLICIAL,SOCIAL,TURISTA];

// Robolady - 0 a 17
const A_ORIGINAL = 'a_original';
const A_3D = 'a_3d';
const A_ARTISTA = 'a_artista';
const A_BAILARINA = 'a_bailarina';
const A_CABELOAFRO = 'a_cabeloafro';
const A_CABELOAZUL = 'a_cabeloazul';
const A_CABELOROXO = 'a_cabeloroxo';
const A_COZINHEIRA = 'a_cozinheira';
const A_ENGENHEIRA = 'a_engenheira';
const A_ESPORTISTA = 'a_esportista';
const A_EXPLORADORA = 'a_exploradora';
const A_FAZENDEIRA = 'a_fazendeira';
const A_MUSICA = 'a_musica';
const A_NADADORA = 'a_nadadora';
const A_NEVE = 'a_neve';
const A_POLICIAL = 'a_policial';
const A_SOCIAL = 'a_social';
const A_TURISTA = 'a_turista';
const ROBOLADIES = [A_ORIGINAL,A_3D, A_ARTISTA,A_BAILARINA,A_CABELOAFRO,A_CABELOAZUL,A_CABELOROXO,A_COZINHEIRA,A_ENGENHEIRA,
                          A_ESPORTISTA,A_EXPLORADORA,A_FAZENDEIRA,A_MUSICA,A_NADADORA,A_NEVE,A_POLICIAL,A_SOCIAL,A_TURISTA];

app.get('/img', (request, response) => {  
  
 // response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.query.s!=escolaid) {
    
      response.json({
        error: "Não foi possível obedecer ao comando. Estação parece não estar ativada"
      });
      return;
  }
  
  if (request.query.t == undefined || request.query.t == null || request.query.t == '') {
      response.json({
        error: "Não foi possível obedecer ao comando. Tipo do comando não foi definido"
      })
       return;
  }
  
  if (request.query.t==TYPE_IMG_NUMBER && (request.query.r == undefined || request.query.r == null || request.query.r == '')) {
      response.json({
        error: "Não foi possível obedecer ao comando. Número parece não ter sido definido"
      })
      return;
  }
  if (request.query.t==TYPE_IMG_NAMED && (request.query.n == undefined || request.query.n == null || request.query.n == '')) {
      response.json({
        error: "Não foi possível obedecer ao comando. Nome da imagem parece não ter sido definido"
      })
      return;
  }
  
  if (request.query.t==TYPE_IMG_ROBOGODE) {
    
      var robogodeIndice = Math.floor(Math.random() * 16);
      var nomeImagem = ROBOGODES[robogodeIndice];
          
      exibeImagem(request,response,DIR_BASE_IMGS+"/"+nomeImagem+".png");
      
  } else if (request.query.t==TYPE_IMG_ROBOLADY) {
    
      var roboladyIndice = Math.floor(Math.random() * 17);
      var nomeImagem = ROBOLADIES[roboladyIndice];
      
      exibeImagem(request,response,DIR_BASE_IMGS+"/"+nomeImagem+".png");
      
  } else if (request.query.t==TYPE_IMG_NUMBER) {
   
      exibeImagem(request,response,DIR_BASE_IMGS+"/"+request.query.r+".png");

  } else if (request.query.t==TYPE_IMG_NAMED) {
    
      exibeImagem(request,response,DIR_BASE_IMGS+"/"+request.query.n);
      
  }  

})

app.listen(800, function () {
      console.log('---------------------------------------------------------------');
    console.log('            '+(new Date().toLocaleString()) + ' Webserver ouvindo na porta 800');
    console.log('---------------------------------------------------------------');    
  }) 


/****************************************************************
 *  daqui em diante websocket
 ****************************************************************/
var notificouClienteConexao=false;


function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}

 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

if (verificaInstrutor()) {
  server.listen(700, function() {
      console.log('---------------------------------------------------------------');
      console.log(' '+(new Date().toLocaleString()) + ' Websocket facilitador ouvindo na porta 700');
      console.log('---------------------------------------------------------------');    
  });
}
 
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
  
    console.log('Cliente conectado');
  
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
          }
   
    connection.on('message', function(message) {

      // Implementa envios para Sphero por aqui.
      
     
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


function statPath(path) {

  try {

    return fs.statSync(path);

  } catch (ex) {
      return false;
  }

}


function verificaInstrutor() {

  var ePortugues = statPath('/home/pi/Área de Trabalho');

  var atalho_instrutor;

  if (ePortugues) {

    atalho_instrutor= fs.readFileSync('/home/pi/Área de Trabalho/update.desktop')+'';

  } else {

    // versão em ingles
    atalho_instrutor= fs.readFileSync('/home/pi/Desktop/update.desktop')+'';

  }

   // obtém versão
   return atalho_instrutor.indexOf('teacher.sh')>-1;


}

/******************************************************************************
 *                     AÇÕES EXECUTADAS POR ESTE PROGRAMA
 ******************************************************************************/

function exibeImagem(request,response,imagemComPath) {

/*
  if (shell.exec("sudo fbi -T 10 --noverbose -t 10 --once -a "+imagemComPath).code !== 0) {
    shell.echo('Erro ao tentar exibir imagem');
    shell.exit(1);
    
     response.json({
        error: "Erro ao tentar exibir imagem "+imagemComPath
     })
    
    
  }
  */
  shell.exec("sudo fbi -T 10 --noverbose -t 10 --once -a "+imagemComPath, function(code, output) {
    if(code!=0) {
      response.json({
        error: "Erro ao tentar exibir imagem "+imagemComPath
     })
   } else {
     response.json({
       msg:""
     })
   }
    });

}