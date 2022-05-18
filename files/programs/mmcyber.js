/*
  CYBERSECURITY ONLINE
  Paulo Alvim 11/04/2022
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
  
 Padrão API Pública https://firstcode-tst.appspot.com/api/SalasChat/monitoraSalaChat/publico?user=correa1&turmaid=4fe5a390-e0ba-11ea-9fea-9720730dc092&salaChatId=testegabriel&accessToken=eQtOntNnx3EbfFFiaGYOlCMUWDEmv0Hxh2pgbM4jK2ifBNgelLdjic3xRFTFL43P&ultimaDataHoraRecebidaAAMMDDHHmmSS=2020-08-28T17%3A30%3A00.081Z 
  
*/
const VERSAO="3"

// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var sala_registrado = '1';
var estacao_registrado = '';

var code = ""
var currentAngle=0;  // para frente
var eConfig=true;

const request = require('request')
var modoRegistro = false;


const express = require('express');
const app = express();
const router = express.Router();
const cors = require('cors');

app.use(cors())

// Permite que página da aplicação Mind Makers acesse este servidor local
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    next();
});

// PING
app.get('/ping', (request, response) => {


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


// Registra tipo de jogo e situacao='r' (rodando), 'p' (em pausa)
// ANTERIOR: /jogoconfig?msg=<tipo>@@<situacao> ou /jogoconfig?msg=CYBER-1@@r
// NOVO: /msg, situacao, escola, sala
app.get('/jogoconfig', (request, response) => {

   console.log('entrou para configurar '+request.query.msg);

   if (request.query.msg && request.query.msg!=null) {
     console.log('vai configurar jogo='+jogoCorrente+ ' com situação '+situacaoJogoCorrente);
     var retorno = request.query.msg.split('@@');
     jogoCorrente = retorno[0];
	 
	 // Inicia/Retoma ou Pausa um Jogo
     situacaoJogoCorrente = retorno[1];
    }

   console.log('jogo corrente='+jogoCorrente+ ' com situação '+situacaoJogoCorrente);

   response.json({
        jogo:jogoCorrente,
        situacao:situacaoJogoCorrente})

})



var pontos = new Map();
pontos.set('personal',0);
pontos.set('company',0);
pontos.set('bank',0);

var jogoCorrente="CYBER-1";
var situacaoJogoCorrente="r";

var senha = new Map();

// devolve a estacao corrente do servidor e pontos do usuario em cada app virtual
app.get('/usrxtml111kkkxxvyi812902134lk', (request, response) => {

  // Se enviou pontos, soma
   if (request.query.xtml111kkkxxv!=null && request.query.xtml111kkkxxv != 'zera' && request.query.xtml111kkkxxv.indexOf('$')>-1) {
     var pontosRetorno = request.query.xtml111kkkxxv.split('$');
     console.log('vai setar '+pontosRetorno[1]+' pontos para ' + pontosRetorno[0]);
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
    bank:pontos.get('bank'),
    versao:VERSAO})


})


// devolve a sala e a estacao corrente.
app.get('/id', (request, response) => {

  response.json({
    estacao:estacao_registrado,
    sala:sala_registrado,
    versao:VERSAO})

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
               resposta = resposta + " SPAM "+(i+1)+" descartado pelo usuário sem clicar;";
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

          // retira o indice apos o titulo

          if (resposta.lastIndexOf(')')==(resposta.length-1)) {
              resposta = resposta.substring(0,resposta.lastIndexOf('('));
          }

        console.log('vai retornar '+resposta);
          response.json({
          status:"OK",
          msg:resposta,
          jogo:jogoCorrente,
          situacao:situacaoJogoCorrente})
      } else {
        response.json({
        status:"SEM_SPAMS",
          jogo:jogoCorrente,
          situacao:situacaoJogoCorrente
        })
      }

    } else {

      response.json({
        status:"SEM_SPAMS",
          jogo:jogoCorrente,
          situacao:situacaoJogoCorrente
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

     var msg = spam.get(hackerSeq);
     var dadosMsg = msg.split("$$$");

     console.log('vai atualizar mensagem de '+hackerSeq+" para situacao "+situacao+" com titulo "+dadosMsg[4]);

     msgFinal = "desprezada pelo usuário";
     if (situacao=="SPAM_CLICOU") {
        if (senha.size>0)
          msgFinal = "clicada pelo usuário. Senha(s) obtida(s): "+senhasFormatadas(senha)+". Experimente usar nos vários sites para hackear.";
        else
          msgFinal = "clicada pelo usuário, mas ele ainda não tem nenhuma senha definida!";
     }

     enviaMsgParaTodosClientes("hacker:"+hackerSeq+"@@"+"Sua mensagem '"+dadosMsg[4]+"' foi "+msgFinal);

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
           registrado:"NAO",
           estacao:estacao_registrado});

         if (request.query.status!=null)
            situacaoJogoCorrente=request.query.status;

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

       if (senha.size>0)
                 enviaMsgParaTodosClientes("hacker:"+request.query.user+"@@"+
                "Sua mensagem de spoofing e site falso enganaram o usuário. Senhas obtidas: "+senhasFormatadas(senha));
        else
                enviaMsgParaTodosClientes("hacker:"+request.query.user+"@@"+
                "Sua mensagem de spoofing e site falso enganaram o usuário. Mas ele ainda não possui senhas definidas!");



    }
})

function senhasFormatadas(senhaMap) {

  var senhas="";
  for (var key of senhaMap.keys()) {
    senhas = senhas + senhaMap.get(key)+ " ";
  }
  return senhas;
}

app.listen(80, function () {
      console.log('---------------------------------------------------------------');
    console.log('            '+(new Date().toLocaleString()) + ' Webserver ouvindo na porta 80');
    console.log('---------------------------------------------------------------');
  })



var server = http.createServer(function(request, response) {
   // console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

//var estacaoInstrutor = verificaInstrutor();

function originIsAllowed(origin) {
  //  console.log('entrou para permitir origin');
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
