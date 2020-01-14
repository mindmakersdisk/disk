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
   
const express = require('express');  
const app = express();
const path = require('path');
const router = express.Router();
const cors = require('cors');

app.use(cors()) 
// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    next();
});

//app.use(express.static("public"));

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

var pontos = new Map();
pontos.set('personal',0);
pontos.set('company',0);
pontos.set('bank',0);


var senha = new Map();

// devolve a estacao corrente do servidor e pontos do usuario em cada app virtual
app.get('/usrxtml111kkkxxvyi812902134lk', (request, response) => {
  
  // Se enviou pontos, soma
   if (request.query.xtml111kkkxxv!=null && request.query.xtml111kkkxxv != 'zera' && request.query.xtml111kkkxxv.indexOf('$')>-1) {
     var pontosRetorno = request.query.xtml111kkkxxv.split('$');
     console.log('vai somar '+pontosRetorno[1]+' pontos para ' + pontosRetorno[0]);
     if (!Number.isNaN(parseInt(pontosRetorno[1])))
          pontos.set(pontosRetorno[0], parseInt(pontosRetorno[1]));
  } else if (request.query.xtml111kkkxxv == 'zera' ) {
    pontos.set('personal',0);
    pontos.set('company',0);
    pontos.set('bank',0);

  }
    
  response.json({
    user:estacao_registrado,
    personal:pontos.get('personal'),
    company:pontos.get('company'),
    bank:pontos.get('bank')})
    
    
})


// devolve a sala e a estacao corrente.
app.get('/id', (request, response) => {
    
  response.json({
    estacao:estacao_registrado,
    sala:sala_registrado})
    
})


// registra ou devolve senha, conforme parametros
app.get('/usrxtml111mmsdskkkdk112399s', (request, response) => {
  
  var senhaParaSniffer="";
  var appUsuarioParaSniffer="";
  // Se enviou senha, registra
   if (request.query.x42342341kkkxxv!=null && request.query.x42342341kkkxxv.indexOf('-')>-1) {
     var usuarioSenha = request.query.x42342341kkkxxv.split('-');
     
     senhaParaSniffer= usuarioSenha[1];
     appUsuarioParaSniffer=usuarioSenha[0];
  //   console.log('vai registrar '+usuarioSenha[1]+' para ' + usuarioSenha[0]);
          senha.set(usuarioSenha[0], usuarioSenha[1]);
    
  } else if (request.query.x42342341kkkxxv!=null) {

      //  console.log('sem senha', request.query.x42342341kkkxxv)
      //  console.log('com senha', senha.get(request.query.x42342341kkkxxv))
     senhaParaSniffer= senha.get(request.query.x42342341kkkxxv);   
          appUsuarioParaSniffer=  request.query.x42342341kkkxxv;
        response.json({
          user:estacao_registrado,
          login:request.query.x42342341kkkxxv,
          senha:senha.get(request.query.x42342341kkkxxv)})
  }
  
  // Sempre permite sniffer para quem está "ouvindo"
    enviaMsgParaTodosClientes("hacker:sniffer"+"@@"+senhaParaSniffer+"@@"+appUsuarioParaSniffer);
    
    
})

/****************************************************************
 *  PHISING E SPOOFING A PARTIR DAQUI
****************************************************************/

// Recebe uma mensagem de outra maquina para hackear a corrente (PHISHING ou SPOOFING)
var spam = new Map();

// O mapa de SPAM inicia com a mensagem, depois troca para descartou ou senha=<senha> caso o usuário tenha clicado
const SPAM_DESCARTOU="DESCARTOU";
const SPAM_CLICOU="SENHA=";

// Só permite 4 SPAMs na fila
app.get('/phishingspoofingsend', (request, response) => {
  
   if (request.query.msg!=null) {
     var retorno = request.query.msg.split('@@');
     var usuario = retorno[0];
     console.log('usuario hacker='+usuario+ ' com msg '+retorno[1]);
     
     var fila = spam.size;
     if (fila==4) {
       
        response.json({
        status:"CAIXA_CHEIA"})
       
     } else {
       
      spam.set(usuario+(fila+1),retorno[1]);
      var tempoEstimado = (fila+1) * 40;

      response.json({
        status:"OK",
        tempoEstimado:tempoEstimado+''})
     
     }
   }
    
})


// Monitoria do Hacker, sobre seus SPAMs
app.get('/phishingspoofingmonitor', (request, response) => {
  
   if (request.query.usuario!=null) {
    
     var usuarioHacker = request.query.usuario;
    
     var totSPAMsEncontradosNaFila=0;
     var resposta="";
     
    // testa o máximo de mensagens que são 4 na fila
     for ( var i = 0; i < 4; i++ ) {
        var msgStatus = spam.get(usuarioHacker+(i+1));
        if (msgStatus != undefined) {
           // Verifica a situação da mensagem
           totSPAMsEncontradosNaFila++;
           
           // Se finalizou e já avisou, remove msg
           if (msgStatus.startsWith(SPAM_DESCARTOU)) {
               resposta = resposta + " SPAM cód."+(i+1)+" descartado pelo usuário sem clicar;";
               spam.delete(usuarioHacker+(i+1));
               
           } else if (msgStatus.startsWith(SPAM_CLICOU)) {
             resposta = resposta + " SPAM cód."+(i+1)+" foi clicado! "+msgStatus;
               spam.delete(usuarioHacker+(i+1));
           } else {
             resposta = resposta + " SPAM cód."+(i+1)+" ainda não foi enviado para o usuário.";
           }
           
           
           
        }
     }
     
     
     if (totSPAMsEncontradosNaFila==0) {
       
        response.json({
        status:"SEM_SPAMS"})
       
     } else {
       

      response.json({
        status:"OK",
        msg:resposta})
     
     }
     
   }
    
})


// Máquina local fica 'ouvindo' sobre o recebimento de msg, e quando recebe uma exibe ao usuário com prioridade.
app.get('/phishingspoofingreceive', (request, response) => {
  
   var totalSPAM = spam.size;
  // console.log('vai ver se recebe '+totalSPAM);
   
   if (totalSPAM>0) {
    
      // pega a primeira e envia, com identificador para ajudar no feedback
      var resposta = "";
      var achou = false;
      for (var key of spam.keys()) {
        console.log(spam.get(key));
        if (spam.get(key)!='SPAM_DESCARTOU' && spam.get(key)!='SPAM_CLICOU') {
          resposta = key + "@@"+spam.get(key);
          achou = true;
          break;
        }
      }
      if (achou) {
     
        console.log('vai retornar '+resposta);
          response.json({
          status:"OK",
          msg:resposta})
      } else {
        response.json({
        status:"SEM_SPAMS"
        })
      }     
    
    } else {
       
      response.json({
        status:"SEM_SPAMS"
        })
     
     }
    
})


// Máquina local atualiza a situação da mensagem conforme ação do usuário
// Devolve <usuario><seq>@@<acao>, acao podendo ser SPAM_DESCARTOU ou SPAM_CLICOU
app.get('/phishingspoofingreceiveupdate', (request, response) => {
  
   if (request.query.acao!=null) {
    
     var retorno = request.query.acao.split('@@');
    
     var hackerSeq = retorno[0];
     
     var situacao = retorno[1];
     
     console.log('vai atualizar mensagem de '+hackerSeq+" para situacao "+situacao);
     
     msgFinal = "desprezada pelo usuário";
     if (situacao=="SPAM_CLICOU") {
        if (senha.size>0)
          msgFinal = "clicada pelo usuário. Senha(s) obtida(s): "+senhasFormatadas(senha)+". Descubra o site para hackear os pontos";
        else
          msgFinal = "clicada pelo usuário,mas ele ainda não tem nenhuma senha definida!";        
     }
     
     enviaMsgParaTodosClientes("hacker:"+hackerSeq+"@@"+"Sua última mensagem foi "+msgFinal);
     
     spam.delete(hackerSeq);
     
      response.json({
        status:"OK"})
       
  } else {

      response.json({
        status:"erro",
        msg:"não informou parametro acao"})
     
     }
    
})


// Limpa senhas e pontos
app.get('/vw/registrado', (request, response) => {
  
    if (request.query.limpa!=null) {
      
       senha = new Map();
       pontos = new Map();
       pontos.set('personal',0);
       pontos.set('company',0);
       pontos.set('bank',0);
      
        response.json({
          registrado:"NAO"});
    
   } else  {
     
    // console.log('verifica se esta registrado '+senha.size);
      if (senha.size==0) {
         response.json({
          registrado:"NAO"});
      }
      else { 
        response.json({
          registrado:"SIM"});
      }
     
   }
})


// Limpa senhas
app.get('/vw/enviasenha', (request, response) => {
  
  //console.log('entrou com '+request.query.user);
    if (request.query.user!=null) {
      
       enviaMsgParaTodosClientes("hacker:"+request.query.user+"@@"+
       "Sua mensagem de spoofing e seu site falso enganaram o usuário. Senhas obtidas: "+senhasFormatadas(senha));

    }
})

function senhasFormatadas(senhaMap) {

  var senhas="";
  for (var key of senhaMap.keys()) {
    senhas = senhas + senhaMap.get(key)+ " ";
  }
  return senhas;
}



/****************************************************
 *                TIMELINE NESTE TRECHO
 * *************************************************/
var timelineMarcoCorrente="";

// envia indicacao para exibir recurso (imagens, URL, texto, timeline ou marco) em outra estação ativada.
app.get('/show', (request, response) => {
  
  // Simplesmente pega a mensagem na URL e reenvia introduzindo um prefixo como indicativo do tipo - ver encoding
   if (request.query.msg!=null) {
     
     var evento = "timeline:"+request.query.msg;
     
     console.log('vai enviar evento via websocket '+evento);
     
      enviaMsgParaTodosClientes(evento);
      
       response.json({
            status: 'ok'
          })
   }
    
})


// controla a linha do tempo - feito apenas na maquina de quem publica uma linha do tempo
app.get('/timelinepublica', (request, response) => {
  
  // Pega o nome concatenado com marco, separado por @@
   timelineMarcoCorrente=request.query.nome;
   console.log('marco corrente alterado para '+timelineMarcoCorrente);
   response.json({
            status: 'ok'
          })
   setTimeout(limpaPublicacao,30000);
   // limpa em 30segundos. Se ninguem 'ouviu' (ouvem de 5 em 5 seg) e porque a execucao parou
    
})

function limpaPublicacao() {
  timelineMarcoCorrente="";
}


// verificar se um marco foi publicado e responde no status 'ok' ou 'no'
app.get('/timeline', (request, response) => {
  
  // Pega o nome concatenado com marco, separado por @@
  console.log('vai comparar '+request.query.nome+' com '+timelineMarcoCorrente);
   if (request.query.nome == timelineMarcoCorrente) {
     // console.log('ok');
         response.json({
            status: 'ok'
          })
          
   } else {
     // console.log('no');
      response.json({
            status: 'no'
      })
   }
        
    
})


/****************************************************
 *                TIMELINE NESTE TRECHO - FIM
 * *************************************************/
 
// PING
app.post('/', (request, response) => {  

  response.json({
    status: 'ok',codigo:code
  })
})

app.use('/vw',express.static(path.join(__dirname,'vw')));

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
var WebSocketServer = require('websocket').server;

var http = require('http'); 

var notificouClienteConexao=false;


function temClienteConectado() {
  
  return wsServer!= null && wsServer.connections != null && wsServer.connections[0] != null
  
}

 
var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

//var estacaoInstrutor = verificaInstrutor();

//if (estacaoInstrutor) {
  server.listen(801, function() {
      console.log('---------------------------------------------------------------');
      console.log(' '+(new Date().toLocaleString()) + ' Websocket ouvindo na porta 801');
      console.log('---------------------------------------------------------------');    
  });
//} 
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: true
});
 
function originIsAllowed(origin) {
  //  console.log('entrou para permitir origin');
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
       console.log((new Date().toLocaleString()) + ' message recebida ' + message);
     
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
