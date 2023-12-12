/*
  Alocação de Imagem de Disco para Escola

  1. Obter o código da escola disponível para colar, obtido da Mind Makers através do suporte@mindmakers.cc ou SAC
  2. Abrir o terminal mudar o diretório corrente com 'cd /home/mindmakers/programs'
  3. Executar a alocação com "sudo node mmallocate.js".

  Paulo Alvim 03/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
var gcloudRegistry = require('./mmallocatecloud');
var shell = require('shelljs');

// Informado
var idescola_informado = '';

var lista_escolas = [];

// Registrado em disco
var escolainfo = ''
var escolaid = '';
var escolanome = '';
var pi_registrado = '';
var sd_registrado = '';
var sala_registrado = '1';
var estacao_registrado = '';
var sphero_registrado = '';
var littlebits_registrado = '';
var mbot_registrado = '';
var microbit_registrado = '';

// Recuperados
var escolanome_recuperado = '';

fs.readFile('/home/mindmakers/school.info', function(err, data) {
  if (err)
    console.log(err);
  else {

    escolainfo = data.toString();
    console.log('--------------------------------------------------');
    console.log('--- Alocação de Disco para Escola. Registro Atual:');

    escolaidIni = escolainfo.indexOf('Cód.:') + 5;
    escolaid = escolainfo.substring(escolaidIni, escolainfo.indexOf('||'), escolaidIni).trim();
    //console.log(escolaid);
    escolanomeIni = escolainfo.indexOf('Nome:') + 5;
    escolanome = escolainfo.substring(escolanomeIni, escolainfo.indexOf('||', escolanomeIni)).trim();
    //console.log(escolanome);
    piIni = escolainfo.indexOf('Pi:') + 3;
    pi_registrado = escolainfo.substring(piIni, escolainfo.indexOf('||', piIni)).trim();
    //console.log(pi_registrado);
    sdIni = escolainfo.indexOf('SD:') + 3;
    sd_registrado = escolainfo.substring(sdIni, escolainfo.indexOf('||', sdIni)).trim();
    //console.log(sd_registrado);
    salaIni = escolainfo.indexOf('Sala:') + 5
    sala_registrado = escolainfo.substring(salaIni, escolainfo.indexOf('||', salaIni)).trim();
    //console.log(sala_registrado);
    estacaoIni = escolainfo.indexOf('Estação:') + 8
    estacao_registrado = escolainfo.substring(estacaoIni, escolainfo.indexOf('||', estacaoIni)).trim();
    //console.log(estacao_registrado);

    spheroIni = escolainfo.indexOf('Sphero:') + 7
    if (spheroIni == 6)
      spheroIni = '';
    else
      sphero_registrado = escolainfo.substring(spheroIni, escolainfo.indexOf('||', spheroIni)).trim();

    littlebitsIni = escolainfo.indexOf('littlebits:') + 11
    if (littlebitsIni == 10)
      littlebits_registrado = '';
    else
      littlebits_registrado = escolainfo.substring(littlebitsIni, escolainfo.indexOf('||', littlebitsIni)).trim();

    mbotIni = escolainfo.indexOf('mbot:') + 5
    if (mbotIni == 4)
      mbot_registrado = '';
    else
      mbot_registrado = escolainfo.substring(mbotIni, escolainfo.indexOf('||', mbotIni)).trim();

    microbitIni = escolainfo.indexOf('microbit:') + 9
    if (microbitIni == 8)
      microbit_registrado = '';
    else
      microbit_registrado = escolainfo.substring(microbitIni, escolainfo.indexOf('||', microbitIni)).trim();

    console.log('');
    console.log(escolainfo.replace(/\|\|/g, ''));
    console.log('');


    rotinaAlocacao();

  }
});


var questions = [{
    type: 'confirm',
    name: 'opcao',
    message: "Deseja alocar este disco para uma Escola?"
  },
  /*
  {
    type: 'input',
    name: 'idescola',
    message: "Digite ou cole o código da escola (solicite à Mind Makers se não possuir):",
    when: function (answers) {
      return answers.opcao;
    }
  },*/
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário Mind Makers:",
    when: function(answers) {
      return answers.opcao;
    }
  },
  {
    type: 'password',
    name: 'senha',
    message: "Informe sua senha:",
    when: function(answers) {
      return answers.opcao;
    }
  }

];

var questions2 = [{
    type: 'list',
    name: 'escola',
    message: "Selecione a escola",
    choices: function(answers) {
      return lista_escolas;
    }
  }

];


function rotinaAlocacao() {

  inquirer.prompt(questions).then(answers => {

    if (answers.opcao) {

      // Testa se imagem está configurada
      obtemVersaoImagemDisco();

      idescola_informado = answers.idescola;

      // recuperaNomeEscola(answers);
      recuperaCodigoNomeEscola(answers);

    }

  });
}

/* FUNÇÕES QUE CONSULTAM INFORMAÇṌES NA PLATAFORMA

function recuperaNomeEscola(resposta) {
 // console.log('vai recuperar escola:'+resposta.idescola);
       request('https://mindmakers.cc/api/Escolas/nome/publico?id='+resposta.idescola,
            function(error, response, body) {
                bodyJ=JSON.parse(body);
                if (!bodyJ.success) {
                  console.log('Erro ao recuperar escola: '+bodyJ.err);
                  console.log('Reconfira o código e sua conexão ou contate o suporte da Mind Makers em suporte@mindmakers.cc para obter apoio');
                  process.exit(1);
                } else {

                    escolaretorno=JSON.parse(body);
                    escolanome_recuperado=escolaretorno.nomeEscola;
                    console.log('Escola "'+escolanome_recuperado+'" recuperada com sucesso! ');

                    atualizaSchoolInfo();
                }
            }
        );

}
*/

/* FUNÇÕES QUE CONSULTAM INFORMAÇṌES NA PLATAFORMA*/

function recuperaCodigoNomeEscola(resposta) {
  // console.log('vai recuperar escola:'+resposta.idescola);
  request({
      url: 'https://mindmakers.cc/api/Escolas/listaEscolas/publico?username=${resposta.login}&password=${resposta.senha}',
      method: 'GET',
      strictSSL: false
    },
    function(error, response, body) {
      // Primeiro, verifique se houve um erro na solicitação
      if (error) {
        console.log('Erro na solicitação:', error);
        process.exit(1);
      }

      try {
        // Tenta analisar a resposta como JSON
        var bodyJ = JSON.parse(body);

        if (!bodyJ.success) {
          console.log('Erro ao recuperar escola: ' + bodyJ.err);
          console.log('Reconfira seu usuário/senha e sua conexão. Caso o problema persista contate o suporte da Mind Makers em suporte@mindmakers.cc para obter apoio');
          process.exit(1);
        } else {
          adaptaListaEscolas(bodyJ.listaEscolas);

          inquirer.prompt(questions2).then(answers => {
            configuraEscola(answers.escola);

            atualizaSchoolInfo();
            atualizaIconeAtalhos();
          });
        }
      } catch (e) {
        // Se ocorrer um erro no parse, presumivelmente por não ser um JSON válido, exibe o HTML
        console.log('Erro ao analisar resposta como JSON. Resposta HTML:', body);
        process.exit(1);
      }
    });
}

/*
function recuperaCodigoNomeEscola(resposta) {
  // console.log('vai recuperar escola:'+resposta.idescola);
  request({
      url: 'https://mindmakers.cc/api/Escolas/listaEscolas/publico',
      method: 'POST',
      form: {
        'username': resposta.login,
        'password': resposta.senha
      },
      strictSSL: false
    },
    function(error, response, body) {
      // Primeiro, verifique se houve um erro na solicitação
      if (error) {
        console.log('Erro na solicitação:', error);
        process.exit(1);
      }

      try {
        // Tenta analisar a resposta como JSON
        var bodyJ = JSON.parse(body);

        if (!bodyJ.success) {
          console.log('Erro ao recuperar escola: ' + bodyJ.err);
          console.log('Reconfira seu usuário/senha e sua conexão. Caso o problema persista contate o suporte da Mind Makers em suporte@mindmakers.cc para obter apoio');
          process.exit(1);
        } else {
          adaptaListaEscolas(bodyJ.listaEscolas);

          inquirer.prompt(questions2).then(answers => {
            configuraEscola(answers.escola);

            atualizaSchoolInfo();
            atualizaIconeAtalhos();
          });
        }
      } catch (e) {
        // Se ocorrer um erro no parse, presumivelmente por não ser um JSON válido, exibe o HTML
        console.log('Erro ao analisar resposta como JSON. Resposta HTML:', body);
        process.exit(1);
      }
    });
}
*/

function adaptaListaEscolas(listaEscolasRecuperada) {

  lista_escolas = [];

  for (i = 0; i < listaEscolasRecuperada.length; i++) {

    lista_escolas.push({
      'name': listaEscolasRecuperada[i].nome,
      'value': listaEscolasRecuperada[i].id,
      'short': listaEscolasRecuperada[i].nome
    });
  }

  lista_escolas.sort(compare);

}

function configuraEscola(idEscola) {

  console.log(idEscola)
  idescola_informado = idEscola;

  escolanome_recuperado = ''

  for (i = 0; i < lista_escolas.length; i++) {

    if (lista_escolas[i].value == idEscola) {
      escolanome_recuperado = lista_escolas[i].name;
      console.log(escolanome_recuperado);
      return
    }

  }
}

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  let comparison = 0;
  if (nameA > nameB) {
    comparison = 1;
  } else if (nameA < nameB) {
    comparison = -1;
  }

  return comparison;

}


// Recupera imagem da escola - pendente de implementações futuras.
function recuperaImagemEscola(resposta) {

  request('https://mindmakers.cc/api/Escolas/logo/publico?id=' + resposta.idescola,
    function(error, response, body) {

      if (body && !body.success) {
        console.log('Erro ao recuperar logo: ' + JSON.stringify(body.err));
        console.log(body);

      } else {
        // Salva logotipo da escola
        console.log('Vai salvar logotipo da escola');

      }

    });
}


/* FUNÇÕES QUE ATUALIZAM INFORMAÇṌES LOCAIS*/

function statPath(path) {

  try {
    return fs.statSync(path);

  } catch (ex) {
    return false;

  }
}

/* Grava mudanças no arquivo de registro */
function atualizaSchoolInfo() {

  if (escolanome_recuperado != null && escolanome_recuperado != '') {

    escolaid = idescola_informado;
    escolanome = escolanome_recuperado;

  }

  // Cria Registry para escola
 // gcloudRegistry.criaIoTRegistry(escolaid);

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
    "Cód.: " + escolaid + "||\n" +
    "Nome: " + escolanome + "||\n" +
    "Pi: Não registrado||\n" +
    "SD: Não registrado||\n" +
    "Sala: ||\n" +
    "Estação: ||\n" +
    "Sphero: ||\n" +
    "littlebits: ||\n" +
    "mbot: ||\n" +
    "microbit: ||\n" +
    "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err, data) {
    if (err) {
      console.log('Erro ao gravar arquivo de alocação: ' + err);
      // Encerra com falha
      process.exit(1);
    } else {
      console.log('');
      console.log('------------------ Alocação OK! ------------------');
      console.log('--------------------------------------------------');
      console.log(escolainfoatualizada.replace(/\|\|/g, ''));
      // Encerra com sucesso

    }

  });
}

function obtemVersaoImagemDisco() {

  var existeEmPortugues = statPath('/home/pi/Área de Trabalho/mindmakers.desktop');

  if (existeEmPortugues) {

    atalho_mm_conteudo = fs.readFileSync('/home/pi/Área de Trabalho/releasenotes.desktop') + '';

  } else {

    // versão em ingles
    atalho_mm_conteudo = fs.readFileSync('/home/pi/Desktop/releasenotes.desktop') + '';

  }

  // obtém versão
  var inicial = atalho_mm_conteudo.indexOf('Name[pt_BR]=') + 12;

  var final = atalho_mm_conteudo.indexOf('Type') - 1;


  if (inicial == -1 || final == -1) {
    console.err('Não foi possível identificar a versão da imagem do disco investigando o atalho padrão de notas de liberação');
    console.err('Para alocar uma imagem de disco a uma escola, ela precisa estar corretamente configurada.');
    console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
    // Encerra com falha
    process.exit(1);
  }

  var versaoImagemDisco = atalho_mm_conteudo.substring(inicial, final);

  console.log('Identificada a versão da imagem de disco como ' + versaoImagemDisco);

  return versaoImagemDisco;

}

function atualizaIconeAtalhos() {

  var existeEmPortugues = statPath('/home/pi/Área de Trabalho/classroom_test.desktop');

  var atalho_mm_sala = '';
  var atalho_mm_estacao = '';

  if (existeEmPortugues) {

    atalho_mm_sala = "/home/pi/Área de Trabalho/classroom_test.desktop";
    atalho_mm_estacao = "/home/pi/Área de Trabalho/activate.desktop";

  } else {

    // versão em ingles
    atalho_mm_sala = '/home/pi/Desktop/classroom_test.desktop';
    atalho_mm_estacao = '/home/pi/Desktop/activate.desktop';

  }

  atalho_mm_sala_conteudo = fs.readFileSync(atalho_mm_sala) + '';
  atalho_mm_estacao_conteudo = fs.readFileSync(atalho_mm_estacao) + '';


  // obtém versão
  var inicial_sala = atalho_mm_sala_conteudo.indexOf('Icon=') + 5;
  var inicial_estacao = atalho_mm_estacao_conteudo.indexOf('Icon=') + 5;

  var final_sala = atalho_mm_sala_conteudo.indexOf('Exec=') - 1;
  var final_estacao = atalho_mm_estacao_conteudo.indexOf('Exec=') - 1;

  if (inicial_sala == -1 || final_sala == -1) {
    console.err('Não foi possível encontrar o atalho de teste de sala de aula para configurar o icone com o número da sala');
    console.err('Para alocar uma imagem de disco a uma escola, ela precisa estar corretamente configurada.');
    console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
    // Encerra com falha
    process.exit(1);
  }

  var novoatalho_sala = "/usr/share/icons/classroom_test.jpg";

  var novoatalho_estacao = "/usr/share/icons/activate.png";

  // grava novo conteúdo sala

  shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut.sh", function(code, output) {

    if (code != 0) {
      console.error('\x1b[31m', "Erro ao tentar desproteger arquivos de atalho ");
    } else {

      var novo_conteudo_sala = atalho_mm_sala_conteudo.substring(0, inicial_sala) + novoatalho_sala + atalho_mm_sala_conteudo.substring(final_sala);
      //  console.log(novo_conteudo_sala);

      gravaAtalhoSala(atalho_mm_sala, novo_conteudo_sala);

      var novo_conteudo_estacao = atalho_mm_estacao_conteudo.substring(0, inicial_estacao) + novoatalho_estacao + atalho_mm_estacao_conteudo.substring(final_estacao);
      //console.log(novo_conteudo_estacao);

      gravaAtalhoEstacao(atalho_mm_estacao, novo_conteudo_estacao);

    }
  });
}

function gravaAtalhoSala(atalho_mm_sala, novo_conteudo_sala) {

  fs.writeFile(atalho_mm_sala, novo_conteudo_sala, function(err, data) {

    if (err) {
      console.log('\x1b[31m', 'Erro ao gravar arquivo de atalho de ativação de sala: ' + err);
      // Encerra com falha

      process.exit(1);
    }

  });
}

function gravaAtalhoEstacao(atalho_mm_estacao, novo_conteudo_estacao) {
  // grava novo conteúdo estação
  fs.writeFile(atalho_mm_estacao, novo_conteudo_estacao, function(err, data) {
    shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut2.sh", function(code, output) {
      if (code != 0) {
        console.error('\x1b[31m', "Erro ao tentar proteger arquivos de atalho ");
      }
    });

    if (err) {
      console.log('\x1b[31m', 'Erro ao gravar arquivo de atalho de ativação de estação: ' + err);
      // Encerra com falha
      process.exit(1);
    }

  });
}
