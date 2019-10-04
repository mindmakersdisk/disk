/*
  Serviço Node para controle de sala de aula IoT por protocolo MQTT
  Paulo Alvim 04/2019

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

var http = require('http');
const request = require('request');
const express = require('express');
const app = express();

var bodyParser = require('body-parser');

var escolaMap = new Map();
var salaMap;
var estacaoMap;

// Todas as requisições recebidas em JSON e com encoding corretos
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Procedimentos iniciais
app.use(function(req, res, next) {

  recuperaEscolaPiMap();

  next();
});

// Apenas indica funcionamento - TODO retirar
app.get('/', (request, response) => {

  response.json({
    status: 'ok'
  })
})

// Comandos
const DESLIGA = 'off';
const DESLIGA_MONITOR = 'monitoroff';
const LIGA_MONITOR = 'monitoron';
const OBTEM_INFO = 'oi';
const EXIBE_IMAGEM = 'img';
const EXECUTA_URL = 'url';
const COMANDOS_VALIDOS = [OBTEM_INFO, DESLIGA, DESLIGA_MONITOR, LIGA_MONITOR, EXIBE_IMAGEM, EXECUTA_URL];

// Macros
const DEMO1 = 'demo1';
const DEMO2 = 'demo2';
const DEMO3 = 'demo3';
const TESTE = 'teste';
const MACROS_VALIDAS = [DEMO1, DEMO2, DEMO3, TESTE];


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
const ROBOGODES = [ORIGINAL, O_3D, BASQUETE, BOX, ENGENHEIRO, EXPLORADOR, FAZENDEIRO, GARI, LENHADOR,
  MARATONISTA, MARINHEIRO, MARINHEIRO, MUSICO, NEVE, PAPERCRAFT, POLICIAL, SOCIAL, TURISTA
];

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
const ROBOLADIES = [A_ORIGINAL, A_3D, A_ARTISTA, A_BAILARINA, A_CABELOAFRO, A_CABELOAZUL, A_CABELOROXO, A_COZINHEIRA, A_ENGENHEIRA,
  A_ESPORTISTA, A_EXPLORADORA, A_FAZENDEIRA, A_MUSICA, A_NADADORA, A_NEVE, A_POLICIAL, A_SOCIAL, A_TURISTA
];

const MINDMAKERS = ['m', 'i', 'n', 'd', 'm', 'a', 'k', 'e', 'r', 's'];

/************************************************************
 *          SERVIÇOS DE AUTOMAÇÃO DE SALA IoT               *
 *
 *  comando
 *  complemento (opcional, ex: nome de imagem em comando 'img')
 *  login
 *  senha
 *  idescola
 *  sala (opcional, assume 1)
 *  estacao (opcional, assume comando coletivo para sala)
 *  incluiistrutor='S' se desejar incluir estacao do instrutor em comandos coletivos.
 *
 * *********************************************************/
app.post('/api/E/comando', (req, resp) => {

  comando = req.body.comando

  validaComando(comando);

  complemento = null;
  if (req.body.complemento)
    complemento = req.body.complemento;

  login = req.body.login
  senha = req.body.senha
  // TODO Validar autenticação

  idEscola = req.body.escola
  // TODO Validar autorização - se é instrutor da escola, escola, relacionamento ou administrador.

  // Sala - opcional se escola tem apenas uma sala
  sala = 1
  if (req.body.sala != null && req.body.sala != '')
    sala = req.body.sala;
  // Estação opcional, quando não passada, faz para todos.

  estacao = null;
  if (req.body.estacao != null && req.body.estacao != '')
    estacao = req.body.estacao;

  incluiInstrutor = false;
  if (req.body.incluiinstrutor != null && req.body.incluiinstrutor == 'S')
    incluiInstrutor = true;

  enviarComandoComputadoresSala(comando, complemento, idEscola, sala, incluiInstrutor, estacao);

  resp.json({
    msg: 'Executou comando'
  })
})

/************************************************************
 *          SERVIÇOS DE AUTOMAÇÃO DE SALA IoT
 *          VIA PROGRAMAÇÃO DOS ALUNOS
 *
 *  acao (N,G,L)
 *  login (sem uso por hora)
 *  senha (sem uso por hora)
 *  id1 Id da Escola
 *  id2 Id da Sala (opcional, assume 1)
 *  numero Número de 1 a 20 a ser exibido
 *  estacao (opcional, assume numero)
 *
 * *********************************************************/
app.post('/iot/sala/code', (req, resp, next) => {

  comando = EXIBE_IMAGEM;

  const ACAO_NUMERO = "N";
  const ACAO_ROBOGODE = "G";
  const ACAO_ROBOLADY = "L";

  acao = req.body.acao;


  /* por enquanto não exige
  login = req.body.login
  senha = req.body.senha
  // TODO Validar autenticação
  */

  idEscola = req.body.id1

  // Sala - opcional se escola tem apenas uma sala
  sala = '1'
  if (req.body.id2 != null && req.body.id2 != '')
    sala = req.body.id2 + '';

  // Número a ser exibido
  var numero = req.body.numero;

  var estacao;

  // Estação opcional, quando não passada, assume número se este foi passado.
  if (req.body.estacao != null && req.body.estacao != '')
    estacao = req.body.estacao + '';
  else {
    if (numero != null && numero != '')
      estacao = numero + '';
  }


  // Validações
  if (acao == undefined) {
    console.log('vai retornar erro');
    resp.json({
      error: 'Ação deve ser informada'
    })
    return
  }


  if (acao == ACAO_NUMERO && numero == undefined && estacao == undefined) {
    throw new Error("Para enviar números informe a estação e o número desejado");
  }

  if (acao == ACAO_NUMERO && (numero == undefined || numero == null)) {
    throw new Error("Número para exibição não informado");
  }

  if (parseInt(numero) <= 0 || parseInt(numero) >= 20)
    throw new Error("Número para exibição tem que estar entre 1 e 20");

  // Cada escola/sala não pode receber mais que certa quantidade de chamadas por segundo, minuto e hora.
  if (limiteChamadasPorEscolaEstourado(idEscola, sala)) {
    throw new Error("Limite de envio de mensagens IoT para esta escola/sala estourado.");
  }


  // console.log('entrou 3  com '+idEscola+' s='+sala+' e='+estacao+' n='+numero);

  // Comando as ações
  if (acao == ACAO_NUMERO) {

    enviarComandoComputadoresSala(EXIBE_IMAGEM, numero + '', idEscola, sala, null, estacao);

  } else if (acao == ACAO_ROBOGODE) {

    robogodeIndice = Math.floor(Math.random() * 16);

    enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOGODES[robogodeIndice], idEscola, sala, null, estacao);

  } else if (acao == ACAO_ROBOLADY) {

    roboladyIndice = Math.floor(Math.random() * 17);

    enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOLADIES[roboladyIndice], idEscola, sala, null, estacao);

  }

  // console.log('final sucesso');

  resp.json({
    msg: 'Executou comando'
  })
})

// armazena o quantitativo de envio de comandos por escola-sala, para controlar limites que a turma pode programar
var controlaVolumeMap = new Map();
var controlaFrequenciaMap = new Map();

function limiteChamadasPorEscolaEstourado(idEscola, sala) {

  // Verifica se já existe, senão cria
  var totalMsgs = controlaVolumeMap.get(idEscola + '#' + sala);

  if (totalMsgs == null) {
    totalMsgs = 1;
    controlaVolumeMap.set(idEscola + '#' + sala, 1);
    controlaFrequenciaMap.set(idEscola + '#' + sala, new Date());
    return false;
  }

  momentoAtual = new Date();
  var momentoUltMsg = controlaFrequenciaMap.get(idEscola + '#' + sala);
  var tempoDecorridoMiliSegs = momentoAtual - momentoUltMsg;

  totalMsgs++;

  // Se existir, verifica limite por segundo (evita loops infinitos, por exemplo)
  if (tempoDecorridoMiliSegs <= 1000 && totalMsgs > 10) {
    setTimeout(reiniciaCreditoExecucaoEscolaSala, 10000, idEscola + '#' + sala);
    return true;
  }


  // Se existir, verifica limite por minuto (evita excesso de testes)
  if (tempoDecorridoMiliSegs <= 60000 && totalMsgs > 100) {
    setTimeout(reiniciaCreditoExecucaoEscolaSala, 60 * 3000, idEscola + '#' + sala);
    return true;

  }


  // Se existir, verifica limite por 40min, aproximadamente uma aula. Como pode haver aula a seguir de outra
  // turma, retorna este limite mais rapidamente.
  if (tempoDecorridoMiliSegs <= (40 * 60000) && totalMsgs > 500) {
    setTimeout(reiniciaCreditoExecucaoEscolaSala, 60 * 10000, idEscola + '#' + sala);
    return true;

  }

  // dentro da cota, então somente atualiza contador.
  controlaVolumeMap.set(idEscola + '#' + sala, totalMsgs);
  controlaFrequenciaMap.set(idEscola + '#' + sala, momentoAtual);

  return false;

}

function reiniciaCreditoExecucaoEscolaSala(idEscola, sala) {

  controlaVolumeMap.set(idEscola + '#' + sala, 0);
  controlaFrequenciaMap.set(idEscola + '#' + sala, new Date());

}


function validaComando(comando) {

  var i;
  for (i = 0; i < COMANDOS_VALIDOS.length; i++) {
    if (COMANDOS_VALIDOS[i] == comando)
      return
  }

  // Se chegou até aqui,não tem um comando válido
  throw new Error("Comando " + comando + " é inválido");


}



// Envia comandos para um, todos os computadores de uma sala
// ou todos os computadores de alunos. Para enviar para todos, omitir estacao.
function enviarComandoComputadoresSala(comando, complemento, idEscola, sala, incluiInstrutor, estacao) {

  //console.log('Vai enviar comandos para idEscola='+idEscola+ ' e sala = '+sala+' com comando: '+comando+' e complemento: '+complemento+' com estação: '+estacao);

  if (complemento != null) {

    if (comando == EXIBE_IMAGEM && complemento.indexOf('.') == -1)
      complemento = complemento + '.png';

    comando = comando + "-" + complemento;

  }

  var escola = escolaMap.get(idEscola);

  if (escola == null) {
    throw new Error("Não encontrou escola " + idEscola);
  }

  var estacoes = escola.get(sala);

  if (estacoes == null) {
    throw new Error("Não encontrou estações na sala " + sala + " da escola " + idEscola);
  }

  if (estacao != null) {

    //  console.log(estacoes);
    //  console.log(estacao);

    var pi = estacoes.get(estacao + '');

    if (pi == null) {
      throw new Error("Não encontrou estação " + estacao + " na sala " + sala + " da escola " + idEscola);
    }

    enviaComandosMQTT('mm' + idEscola, 'pi' + estacoes.get(estacao), comando)

  } else {

    for (var pi of estacoes.values()) {

      enviaComandosMQTT('mm' + idEscola, 'pi' + pi, comando)

    }

  }

}


/************************************************************
 *          MACROS DE AUTOMAÇÃO DE SALA IoT                 *
 *
 *  nomemacro = 'demo1', 'demo2', 'demo3', 'teste'
 *  login
 *  senha
 *  idescola
 *  sala (opcional, assume 1)
 *
 * *********************************************************/
app.post('/api/Sala/macro', (req, resp) => {

  var nomeMacro;
  if (req.body.macro != null && req.body.macro != '')
    nomeMacro = req.body.macro;
  else
    throw new Error("Nome da macro é obrigatório");

  login = req.body.login;
  senha = req.body.senha;
  // TODO Validar autenticação

  idEscola = req.body.escola;
  // TODO Validar autorização - se é instrutor da escola, escola, relacionamento ou administrador.

  // Sala - opcional se escola tem apenas uma sala
  sala = '1';
  if (req.body.sala != null && req.body.sala != '')
    sala = req.body.sala;
  // Estação opcional, quando não passada, faz para todos.

  console.log(req.body);

  if (nomeMacro == DEMO1) {
    macroDemo1(idEscola, sala);
  } else if (nomeMacro == DEMO2) {
    macroDemo2(idEscola, sala);
  } else if (nomeMacro == DEMO3) {
    macroDemo3(idEscola, sala);
  } else if (nomeMacro == TESTE) {
    macroTeste(idEscola, sala);
  } else {

    throw new Error("Macro " + comando + " é inválida");

  }
  resp.json({
    msg: 'Executou macro'
  })
})

function macroDemo1(idEscola, sala) {

  console.log('sala ' + sala);

  var escola = escolaMap.get(idEscola);

  if (escola == null) {
    throw new Error("Não encontrou escola " + idEscola);
  }

  var estacoes = escola.get(sala);

  if (estacoes == null) {
    throw new Error("Não encontrou estações na sala " + sala + " da escola " + idEscola);
  }

  for (var estacao of estacoes.keys()) {

    enviarComandoComputadoresSala(EXIBE_IMAGEM, estacao, idEscola, sala, null, estacao);

  }

  // Se tiver máquina do instrutor corretamente configurada...
  estacaoInstrutor = salaMap.get(sala + ESTACAO_INSTRUTOR);

  // ...envia imagem diferente para máquina do instrutor
  if (estacaoInstrutor != null && estacaoInstrutor != '')
    enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOGODES[0], idEscola, sala, null, estacaoInstrutor);

  // 8 segundo depois, envia imagens dos robogodes e roboladies aleatoriamente para todos
  setTimeout(macroDemo1Submacro, 10000, idEscola, sala);

}

function macroDemo1Submacro(idEscola, sala) {

  console.log('entrou segunda etapa com idEscola=' + idEscola + ' e sala = ' + sala);

  var escola = escolaMap.get(idEscola);

  var estacoes = escola.get(sala);

  var cont = 0;

  for (var estacao of estacoes.keys()) {

    cont++;

    if (cont % 2 == 0) {

      robogodeIndice = Math.floor(Math.random() * 16);

      enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOGODES[robogodeIndice], idEscola, sala, null, estacao);

    } else {

      roboladyIndice = Math.floor(Math.random() * 17);

      enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOLADIES[roboladyIndice], idEscola, sala, null, estacao);

    }

  }

  // Envia imagem diferente para máquina do instrutor
  // TODO Acertar quando tiver configuração do instrutor
  enviarComandoComputadoresSala(EXIBE_IMAGEM, "t.jpg", idEscola, sala, null, "1");


}




function macroDemo2(idEscola, sala) {

  var escola = escolaMap.get(idEscola);

  if (escola == null) {
    throw new Error("Não encontrou escola " + idEscola);
  }

  var estacoes = escola.get(sala);

  if (estacoes == null) {
    throw new Error("Não encontrou estações na sala " + sala + " da escola " + idEscola);
  }

  var cont = 0;

  for (var estacao of estacoes.keys()) {

    cont++;

    if (cont <= 4) {

      enviarComandoComputadoresSala(EXIBE_IMAGEM, MINDMAKERS[cont - 1], idEscola, sala, null, estacao);

    } else if (cont >= 6 && cont <= 11) {

      enviarComandoComputadoresSala(EXIBE_IMAGEM, MINDMAKERS[cont - 2], idEscola, sala, null, estacao);

    }

  }


  // Se tiver máquina do instrutor corretamente configurada...
  estacaoInstrutor = salaMap.get(sala + ESTACAO_INSTRUTOR);

  // ...envia imagem diferente para máquina do instrutor
  if (estacaoInstrutor != null && estacaoInstrutor != '')
    enviarComandoComputadoresSala(EXIBE_IMAGEM, ROBOGODES[0], idEscola, sala, null, estacaoInstrutor);

}

function macroDemo3(idEscola, sala) {

}

function macroTeste(idEscola, sala) {

}

app.listen(80)

const ESTACAO_INSTRUTOR = "instrutor";

// Carrega códigos de todas as escolas.
function recuperaEscolaPiMap() {

  // TODO Recuperar escolas ativas e organizar neste mapa de salas e estações.

  /* ESCOLA TESTE MAX */
  estacaoMap = new Map();
  estacaoMap.set('1', '000000000ac7721a');
  //estacaoMap.set('2','000000008fbf32b1');
  estacaoMap.set('2', '000000009eff7df5');

  salaMap = new Map();
  salaMap.set('1', estacaoMap);

  estacaoMap = new Map();
  estacaoMap.set('1', '000000009eff7df5');

  salaMap.set('2', estacaoMap);

  // Convenção para indicar a estacao do instrutor de uma sala (opcional, pois o instrutor pode usar notebook próprio)
  salaMap.set('2' + ESTACAO_INSTRUTOR, '1');

  escolaMap.set('861127b0-0465-11e9-960e-d5e2953c462d', salaMap);



  /* ESCOLA BH SAVASSI */

  estacaoMap = new Map();
  estacaoMap.set('11', '00000000bb7d91ba');
  estacaoMap.set('1', '00000000972868d9');
  estacaoMap.set('2', '000000001b6aa9b3');
  estacaoMap.set('3', '00000000edee082e');
  estacaoMap.set('4', '0000000042f983b7');
  estacaoMap.set('5', '0000000009cc2d0d');
  estacaoMap.set('6', '00000000bbc36a97');
  estacaoMap.set('7', '00000000f5fb7ef2');
  estacaoMap.set('8', '0000000046391710');
  estacaoMap.set('9', '0000000071413bc3');
  estacaoMap.set('10', '000000003c5f2d0d');
  estacaoMap.set('12', '000000005ea200f4');

  salaMap = new Map();
  salaMap.set('1', estacaoMap);

  escolaMap.set('57e45040-60e4-11e7-a9f2-ab454d3cfcf4', salaMap);

  console.log(escolaMap);

}


/*---------------------- GOOGLE CLOUD APIS DAQUI EM DIANTE ------------------------
 * -------------------------------------------------------------------------------*/

const {
  google
} = require('googleapis');
const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';
const serviceJSON = "/home/mindmakers/programs/mmiotsrv.json";
const rsaCertificateFile = "/home/mindmakers/programs/mmiotdev.pem";
const cloudRegion = 'us-central1';
const projectId = 'mind-makers';
const pubsubTopicId = 'gcr.io.%2Fmind-makers';

//function errCb = lookupRegistry; // Lookup registry if already exists.


function getClient(serviceAccountJson, cb) {
  // the getClient method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
  // environment variables if serviceAccountJson is not passed in

  google.auth.getClient({
      keyFilename: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    .then(authClient => {
      const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

      google.options({
        auth: authClient,
      });

      google.discoverAPI(discoveryUrl).then(client => {

          cb(client);
        })
        .catch(err => {
          console.log('Erro durante a descoberta da API GCloud.', err);
        });
    });

}



/*
 Envia comando MQTT para um dispositivo
*/
function enviaComandosMQTT(registryId, deviceId, commandMessage) {

  const binaryData = Buffer.from(commandMessage).toString('base64');

  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  // NOTE: The device must be subscribed to the wildcard subfolder
  // or you should pass a subfolder
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    binaryData: binaryData,
    //subfolder: <your-subfolder>
  };



  // Client retrieved in callback
  getClient(serviceJSON, function(client) {

    client.projects.locations.registries.devices.sendCommandToDevice(
      request,
      (err, data) => {
        if (err) {
          console.log('Não pode enviar comando:', request);
          console.log('Erro: ', err);
        } else {
          console.log('Sucesso:', data.status);
        }
      }
    );

  });


}
