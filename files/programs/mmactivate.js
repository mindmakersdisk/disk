/*
  Inventário e Ativação Automatizada de Ativos
  Paulo Alvim 03/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')
//const si = require('systeminformation')
var inquirer = require('inquirer');
var fs = require('fs');
var gcloudRegistry = require('./mmallocatecloud');
var shell = require('shelljs');

// Registrados
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

// Identificados
var pi_identificado = ''
var sd_identificado = ''
var versaoImagemDisco = '';

// Informados
var idescola_informado = '';
var sala_informado = '';
var estacao_informado = '';

// Calculados
var urlEstacao = '';

// Recuperados
var escolanome_recuperado = '';

var numeroScans = 0;
var modoregistro = false;

// Semáforo para sinalizar finalização dos serviços assincronos
var totalAcessosPlataformaPendentes = -1;
var servicoRecorrente;
var tentativas = 0;

fs.readFile('/home/mindmakers/school.info', function(err, data) {
  if (err) {
    console.log(err);
    process.exit(1);
  } else {

    escolainfo = data.toString();
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
    console.log('--- Identificação automática de ativos');
    getSDSerialNumber();
    getPiSerial();

    // Verifica se está configurado e se está alocado (pré-requisitos para ativação)

    obtemVersaoImagemDisco();

    if (escolaid == null || escolaid == '' || escolaid.toString().toLowerCase().indexOf('não') > -1) {
      console.log('');
      console.error('\x1b[31m', 'Não foi possível identificar uma escola para a qual esse disco foi alocado');
      console.error('\x1b[31m', 'Para ativar uma estação ela precisa estar previamente alocada para uma escola.');
      console.error('\x1b[31m', 'Reexecute a alocação ou contate suporte@mindmakers.cc para obter apoio.');
      console.log('');
      process.exit(1);

    }

    executaRegistros();
  }
});

var questions = [{
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar essa estação?"
  },
  /*
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:",
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
  },
  */
  {
    type: 'list',
    name: 'loginSimplificado',
    message: "Selecione a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar', '1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
      '2. Configurar Login Padrão (exige do aluno informar sua senha)'
    ],
    when: function(answers) {
      return answers.opcao;
    }
  },
  {
    type: 'input',
    name: 'numeroSalas',
    message: "Quantas salas virtuais simultâneas de Pensamento Computacional pode ter a escola?",
    default: 1,
    when: function(answers) {
      return (answers.opcao && answers.loginSimplificado.toString().indexOf('Login Simplificado') > -1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala virtual, atribua um código numérico inteiro para esta (atual:" + sala_registrado + ")",
    default: 1,
    when: function(answers) {
      return answers.opcao;
    },
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) >= 1 && parseInt(valor) <= 10;
    },
  },
  {
    type: 'input',
    name: 'codigo',
    message: "Atribua um código numérico inteiro para identificar essa estação, de 1 a 20 (atual:" + estacao_registrado + ")",
    default: 1,
    when: function(answers) {
      return answers.opcao;
    },
    validate: function(valor) {
      //console.log('valor='+valor);
      if (isNaN(valor)) {
        valor = valor + '';
        v = valor.toUpperCase();
        return v == 'A' || v == 'B' || v == 'C' || v == 'D' || v == 'E' || v == 'F' || v == 'G' || v == 'H';

      } else {
        return parseInt(valor) >= 1 && parseInt(valor) <= 22;

      }
    },
  }
];


var questionsTeacher = [{
    type: 'confirm',
    name: 'opcao',
    message: "Estação de FACILITADOR: Deseja ativar essa estação"
  },
  /*
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:",
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
  },
  */
  {
    type: 'list',
    name: 'loginSimplificado',
    message: "Selecione a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar', '1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
      '2. Configurar Login Padrão (exige do aluno informar sua senha)'
    ],
    when: function(answers) {
      return answers.opcao;
    }
  },
  {
    type: 'input',
    name: 'numeroSalas',
    message: "Quantas salas virtuais simultâneas de Pensamento Computacional pode ter a escola?",
    default: 1,
    when: function(answers) {
      return (answers.opcao && answers.loginSimplificado.toString().indexOf('Login Simplificado') > -1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala virtual, atribua um código numérico inteiro para esta (atual:" + sala_registrado + ")",
    default: 1,
    when: function(answers) {
      return answers.opcao;
    },
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) >= 1 && parseInt(valor) <= 10;
    }
  },
  {
    type: 'number',
    name: 'codigo',
    message: "O código da estação de facilitadores é sempre zero. Sua estação será ativada com este código",
    default: 0,
    when: function(answers) {
      return answers.opcao;
    },
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) == 0;
    }
  }
];

var questionsHeadless = [{
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar essa estação?"
  },
  /*
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:",
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
  	*/
];

var questionsLoginSimplificado = [{
    type: 'list',
    name: 'loginSimplificado',
    message: "Deseja modificar a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar', '1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
      '2. Configurar Login Padrão (exige do aluno informar sua senha)'
    ]
  },
  {
    type: 'input',
    name: 'numeroSalas',
    default: 1,
    message: "Quantas salas virtuais simultâneas de Pensamento Computacional pode ter a escola?",
    when: function(answers) {
      return (answers.loginSimplificado.toString().indexOf('Login Simplificado') > -1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala virtual, atribua um código numérico inteiro para esta (atual:" + sala_registrado + ")",
    default: 1,
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) >= 1 && parseInt(valor) <= 10;
    },
  },
  {
    type: 'input',
    name: 'codigo',
    message: "Atribua um código numérico inteiro para identificar essa estação, de 1 a 20 (atual:" + estacao_registrado + ")",
    default: 1,
    validate: function(valor) {
      //console.log('valor='+valor);
      if (isNaN(valor)) {
        valor = valor + '';
        v = valor.toUpperCase();
        console.log('v=' + v);
        return v == 'A' || v == 'B' || v == 'C' || v == 'D' || v == 'E' || v == 'F' || v == 'G' || v == 'H';

      } else {
        return parseInt(valor) >= 1 && parseInt(valor) <= 21;

      }
    },
  }
];


var questionsLoginSimplificadoTeachers = [{
    type: 'list',
    name: 'loginSimplificado',
    message: "Estação de FACILITADOR: Deseja modificar a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar', '1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
      '2. Configurar Login Padrão (exige do aluno informar sua senha)'
    ]
  },
  {
    type: 'input',
    name: 'numeroSalas',
    default: 1,
    message: "Quantas turmas simultâneas de Pensamento Computacional pode ter a escola?",
    when: function(answers) {
      return (answers.loginSimplificado.toString().indexOf('Login Simplificado') > -1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala, atribua um código numérico inteiro para esta (atual:" + sala_registrado + ")",
    default: 1,
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) >= 1 && parseInt(valor) <= 10;
    }
  },
  {
    type: 'number',
    name: 'codigo',
    message: "O código da estação de facilitadores é sempre zero. Sua estação será ativada com este código",
    default: 0,
    when: function(answers) {
      return answers.opcao;
    },
    validate: function(valor) {
      return Number.isInteger(valor) && parseInt(valor) == 0;
    },
  }
];


function getSDSerialNumber() {
  var content = fs.readFileSync('/proc/cpuinfo', 'utf8');

  var cont_array = content.split("\n");

  //  var serial_line = cont_array[cont_array.length - 2];
  //mudança acomodar raspberry pi 4
  for (i = 0; i < cont_array.length; i++) {
    //console.log(cont_array[i]);
    if (cont_array[i].indexOf("Serial") > -1) {
      var serial_line = cont_array[i]
      //console.log(serial_line);
    }
  }

  var serial = serial_line.split(":");

  pi_identificado = (serial[1].slice(1) + '').trim();

  console.log('PI Serial: ' + serial[1].slice(1));

}

function getPiSerial() {

  var SDSerial = fs.readFileSync('/sys/block/mmcblk0/device/serial');

  // Também pode ser usado no futuro, identifica o modelo.
  // var SDCID = fs.readFileSync('/sys/block/mmcblk0/device/cid');

  sd_identificado = (SDSerial + '').trim();

  console.log('SD Serial: ' + SDSerial /*+ ' CID='+ SDCID */ );

}

function executaRegistros() {

  if (tudoOk()) {

    // Opção de Login Simplificao apenas
    modoregistro = true;

    console.log('-------------------------------------------------------');
    console.log('--- Todas as configurações de ativação já estão ok! ---');
    console.log('-------------------------------------------------------');
    console.log('');

    if (!existeAtalhoMindMakers()) {
      // Então é headless
      return;
    }

    // Faz registro simplificado
    var perguntasCurtas = questionsLoginSimplificado;

    if (verificaInstrutor()) {
      perguntasCurtas = questionsLoginSimplificadoTeachers;
    }

    inquirer.prompt(perguntasCurtas)
      .then(answers => {

        if (answers.loginSimplificado != null && answers.loginSimplificado.toString().indexOf('Não') == -1) {

          atualizaAtalhoLoginSimplificadoEscola(answers);

        }

        sala_informado = answers.sala;

        if (isNaN(answers.codigo)) {
          answers.codigo = answers.codigo + '';
          estacao_informado = answers.codigo.toUpperCase() + answers.codigo.toUpperCase();
          estacaoInt = estacao_informado;
          //console.log('isNaN=true; codigo=' + answers.codigo + '; estacao_informado=' + estacao_informado)

        } else {
          estacao_informado = answers.codigo;
          estacaoInt = parseInt(estacao_informado);

          if (verificaInstrutor())
            estacao_informado = '0';

        }

        salaInt = parseInt(sala_informado);

        atualizaVersaoEstacao(escolaid, pi_identificado, sd_identificado, versaoImagemDisco, salaInt, estacaoInt, verificaInstrutor());

        totalAcessosPlataformaPendentes = 0;
        servicoRecorrente = setInterval(monitoraAcessosAssincronosPlataforma, 2000);

        modoregistro = false;

      });


  } else {

    // Faz registro geral
    var perguntas = questions;

    if (!existeAtalhoMindMakers()) {
      // Então é headless
      perguntas = questionsHeadless;
    } else if (verificaInstrutor()) {
      perguntas = questionsTeacher;
    }

    modoregistro = true;
    inquirer.prompt(perguntas)
      .then(answers => {

        if (answers.opcao) {

          idescola_informado = escolaid;
          escolanome_recuperado = escolanome;

          sala_informado = answers.sala;
          //console.log('sala = '+sala_informado);

          if (isNaN(answers.codigo)) {
            answers.codigo = answers.codigo + '';
            estacao_informado = answers.codigo.toUpperCase() + answers.codigo.toUpperCase();
            estacaoInt = estacao_informado;

          } else {
            estacao_informado = answers.codigo;
            estacaoInt = parseInt(estacao_informado);

            if (verificaInstrutor())
              estacao_informado = '0';

          }

          registraAtivosEscolaPlataforma(answers);

          if (perguntas === questions)
            atualizaAtalhoLoginSimplificadoEscola(answers);

        //  totalAcessosPlataformaPendentes = 2;
          servicoRecorrente = setInterval(monitoraAcessosAssincronosPlataforma, 2000);

        } else {
          console.log('');
          process.exit(0);
        }

        modoregistro = false;

      });
  }
}

function tudoOk() {

  return pi_identificado == pi_registrado &&
    sd_identificado == sd_registrado;

}


/* FUNÇÕES QUE CONSULTAM E ATUALIZAM INFORMAÇṌES NA PLATAFORMA*/

function registraAtivosEscolaPlataforma(resposta) {
  //console.log(resposta)
  // Registra PI
/*
  request({
      url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
      method: 'POST',
      json: {
        'username': resposta.login,
        'password': resposta.senha,
        'tipo': 'Raspberry',
        'alocadoescola': escolaid,
        'chaveNatural': pi_identificado,
        'acao': 'registrar',
        'observacao': 'ativação automática'
      },
	  strictSSL:false 
    },
    function(error, response, body) {
      if (!body.success || error) {
        if (!body.success) {
          console.log('Erro ao registrar PI: ' + JSON.stringify(body.err));
        } else {
          console.log('Erro ao registrar PI: ' + error);
        }

      } else {
        totalAcessosPlataformaPendentes = totalAcessosPlataformaPendentes - 1;
        console.log('PI registrado com sucesso! ');
      }

    });


  // Registra SD
  request({
      url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
      method: 'POST',
      json: {
        'username': resposta.login,
        'password': resposta.senha,
        'tipo': 'CartaoSD',
        'alocadoescola': escolaid,
        'chaveNatural': sd_identificado,
        'acao': 'registrar',
        'observacao': 'ativação automática'
      },
	  strictSSL:false
    },
    function(error, response, body) {
      if (!body.success || error) {
        if (!body.success) {
          console.log('Erro ao registrar SD: ' + JSON.stringify(body.err));
        } else {
          console.log('Erro ao registrar SD: ' + error);
        }

      } else {
        totalAcessosPlataformaPendentes = totalAcessosPlataformaPendentes - 1;
        console.log('Cartão SD registrado com sucesso! ');
      }

    });
*/
  // Registra Estação somente se está ativando para uma escola informada.
  console.log('PI registrado com sucesso! ');
  if (escolaid != null && escolaid != '') {

    salaInt = parseInt(sala_informado);
    estacaoInt = estacao_informado;
    //estacaoInt = parseInt(estacao_informado);
    // console.log('s='+salaInt+' estacao='+estacaoInt);

    atualizaEstacao(resposta.login, resposta.senha, pi_identificado, sd_identificado, escolaid, versaoImagemDisco, salaInt, estacaoInt, verificaInstrutor());

  }
}

function atualizaEstacao(login, senha, pi, sd, escolaid, versao, sala, estacao, indInstrutor) {

  //-- Jan-2020  --
  //Registro de estações para uso GPIO em sala.
  //Estações contem letras, porém no cassanda estações tem type number.
  //Definido que vão ser utilizados números negativos conforme abaixo.
  if (estacao == 'AA') {
    estacao = -1;
  } else if (estacao == 'BB') {
    estacao = -2;
  } else if (estacao == 'CC') {
    estacao = -3;
  } else if (estacao == 'DD') {
    estacao = -4;
  } else if (estacao == 'EE') {
    estacao = -5;
  } else if (estacao == 'FF') {
    estacao = -6;
  } else if (estacao == 'GG') {
    estacao = -7;
  } else if (estacao == 'HH') {
    estacao = -8;
  } else {
    estacao = parseInt(estacao);
  }
/*
  request({
      url: 'https://mindmakers.cc/api/Escolas/estacao/publico',
      method: 'POST',
      json: {
        'username': login,
        'password': senha,
        'computadorserial': pi,
        'discoserial': sd,
        'alocadoescola': escolaid,
        'versaoimagemdisco': versao,
        'sala': sala,
        'codigo': estacao,
        'indinstrutor': indInstrutor
      },
	  strictSSL:false
    },
    function(error, response, body) {
      if (!body.success || error) {
        if (!body.success) {
          console.log('Erro ao registrar Estacao: ' + JSON.stringify(body.err));
          console.log('');
          process.exit(1);
        } else {
          console.log('Erro ao registrar Estacao: ' + error);
          console.log('');
          process.exit(1);
        }

      } else {
        console.log('Estação registrada com sucesso!');
      }

    });
	*/
}

function atualizaVersaoEstacao(escolaid, pi, sd, versao, sala, estacao, indInstrutor) {

  //-- Jan-2020  --
  //Registro de estações para uso GPIO em sala.
  //Estações contem letras, porém no cassanda estações tem type number.
  //Definido que vão ser utilizados números negativos conforme abaixo.
  if (estacao == 'AA') {
    estacao = -1;
  } else if (estacao == 'BB') {
    estacao = -2;
  } else if (estacao == 'CC') {
    estacao = -3;
  } else if (estacao == 'DD') {
    estacao = -4;
  } else if (estacao == 'EE') {
    estacao = -5;
  } else if (estacao == 'FF') {
    estacao = -6;
  } else if (estacao == 'GG') {
    estacao = -7;
  } else if (estacao == 'HH') {
    estacao = -8;
  } else {
    estacao = parseInt(estacao);
  }
/*
  request({
      url: 'https://mindmakers.cc/api/Escolas/atualizaVersaoEstacao/publico',
      method: 'POST',
      json: {
        'alocadoescola': escolaid,
        'computadorserial': pi,
        'discoserial': sd,
        'versaoimagemdisco': versao,
        'sala': sala,
        'codigo': estacao,
        'indinstrutor': indInstrutor
      },
	  strictSSL:false
    },
    function(error, response, body) {
      if (!body.success || error) {
        if (!body.success) {
          console.log('Erro ao atualizar versão da estação na plataforma: ' + JSON.stringify(body.err));
          console.log('');
          process.exit(1);
        } else {
          console.log('Erro ao atualizar versão da estação na plataforma: ' + error);
          console.log('');
          process.exit(1);
        }
      } else {
        console.log('Versão da estação atualizada na plataforma com sucesso! ');
      }

    });
	*/
}


/* FUNÇÕES QUE ATUALIZAM INFORMAÇṌES LOCAIS*/

function statPath(path) {

  try {
    return fs.statSync(path);

  } catch (ex) {
    return false;

  }

}

function atualizaAtalhoLoginSimplificadoEscola(resposta) {

  if (resposta.loginSimplificado.toString().indexOf('Não') > -1)
    return

  var atalho_mm_conteudo;

  var existeEmPortugues = statPath('/home/pi/Área de Trabalho/mindmakers.desktop');

  if (existeEmPortugues) {
    atalho_mm_conteudo = fs.readFileSync('/home/pi/Área de Trabalho/mindmakers.desktop') + '';

  } else {
    // versão em ingles
    atalho_mm_conteudo = fs.readFileSync('/home/pi/Desktop/mindmakers.desktop') + '';

  }

  // substitui URL
  var ponto_chave = atalho_mm_conteudo.indexOf('Exec=') + 5;

  conteudo_parteinicial = atalho_mm_conteudo.substring(0, ponto_chave);

  conteudo_partefinal = atalho_mm_conteudo.substring(atalho_mm_conteudo.indexOf('--allow-control-allow-origin'));

  // console.log(conteudo_parteinicial);
  //console.log(conteudo_partefinal);
  var msg_final = '';
  if (resposta.loginSimplificado.toString().indexOf('Login Simplificado') > -1) {
    conteudo_novo = conteudo_parteinicial + 'chromium-browser https://mindmakers.cc/login-simplificado?id=' + escolaid +
      '&quantSalas=' + resposta.numeroSalas + ' ' + conteudo_partefinal;

    msg_final = 'Configurou o atalho Mind Makers para usar Login Simplificado suportando ' + resposta.numeroSalas + ' turmas simultâneas (permite ao aluno selecionar sua senha)!';

  } else {
    conteudo_novo = conteudo_parteinicial + 'chromium-browser https://mindmakers.cc/login/' + ' ' + conteudo_partefinal;
    msg_final = 'Configurou o atalho Mind Makers para usar login padrão (exige do aluno informar sua senha)!';

  }

  // grava
  //console.log('conteudo_novo'+conteudo_novo);

  if (existeEmPortugues) {

    shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut.sh", function(code, output) {
      if (code != 0) {
        console.error('\x1b[31m', "Erro ao tentar desproteger arquivos de atalho ");
      } else {

        fs.writeFile('/home/pi/Área de Trabalho/mindmakers.desktop', conteudo_novo, function(err, data) {
          if (err)
            console.log(err);
          else {

            shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut2.sh", function(code, output) {
              if (code != 0) {
                console.error('\x1b[31m', "Erro ao tentar proteger arquivos de atalho ");
              } else {
                console.log(msg_final);
                console.log('');
              }

            });

          }
        });

      }
    });
  } else {

    shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut.sh", function(code, output) {
      if (code != 0) {
        console.error('\x1b[31m', "Erro ao tentar desproteger arquivos de atalho ");
      } else {

        fs.writeFile('/home/pi/Desktop/mindmakers.desktop', conteudo_novo, function(err, data) {
          if (err)
            console.log(err);
          else {

            shell.exec("sudo bash /home/mindmakers/programs/shells/change-shortcut2.sh", function(code, output) {
              if (code != 0) {
                console.error('\x1b[31m', "Erro ao tentar proteger arquivos de atalho ");
              } else {
                console.log(msg_final);
                console.log('');
              }

            });
          }

        });

      }
    });

  }
}

function monitoraAcessosAssincronosPlataforma() {
  // console.log('entrou na monitoria')

  // Somente depois de todos os serviços de registro ocorrem ok, altera o nome na rede e o arquivo local.
  if (totalAcessosPlataformaPendentes <= 0) {

    if (isNaN(estacao_informado)) {
      //console.log('estacaoinformado isNaN');
      //url estação deve ter 5 caracteres
      urlEstacao = 's' + sala_informado + 'e' + estacao_informado;

    } else {
      // URL da Estação
      if (parseInt(estacao_informado) < 10)
        urlEstacao = 's' + sala_informado + 'e0' + estacao_informado;
      else
        urlEstacao = 's' + sala_informado + 'e' + estacao_informado;

    }

    atualizaNomeRede(urlEstacao);

    atualizaIconeAtalhos();

    clearInterval(servicoRecorrente);

  } else {
    tentativas++;
    if (tentativas > 5) {
      console.log('Registro não pode ser realizado com sucesso. ' +
        'Informações podem ter sido parcialmente configuradas. Cód: ' + totalAcessosPlataformaPendentes);
      clearInterval(servicoRecorrente);
      // Encerra com falha
      console.log('');
      process.exit(1);
    }

  }
}


/* Grava mudanças no arquivo de registro */
function atualizaSchoolInfo() {

  // Muda Pi?
  if (pi_registrado != pi_identificado) {
    pi_registrado = pi_identificado;
  }

  // Muda SD?
  if (sd_registrado != sd_identificado) {
    sd_registrado = sd_identificado;
  }

  // Muda Sala?
  if (sala_registrado != sala_informado && sala_informado != '') {
    sala_registrado = sala_informado;
  }

  // Muda Estacao?
  if (estacao_registrado != estacao_informado && estacao_informado != '') {
    estacao_registrado = estacao_informado;
  }

  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
    "Cód.: " + escolaid + "||\n" +
    "Nome: " + escolanome + "||\n" +
    "Pi: " + pi_registrado + "||\n" +
    "SD: " + sd_registrado + "||\n" +
    "Sala: " + sala_registrado + "||\n" +
    "Estação: " + estacao_registrado + "||\n" +
    "Sphero: " + sphero_registrado + "||\n" +
    "littlebits: " + littlebits_registrado + "||\n" +
    "mbot: " + mbot_registrado + "||\n" +
    "microbit: " + microbit_registrado + "||\n" +
    "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err, data) {
    if (err) {
      console.log(err);
      // Encerra com falha
      process.exit(1);
    } else {

      console.log('--------------- Ativação OK! --------------------');
      console.log('-------------------------------------------------');
      console.log(escolainfoatualizada.replace(/\|\|/g, ''));
      console.log(' URL Estação: ' + urlEstacao);
      console.log('');

      var fd =
        console.error('\x1b[32m', '-------------- Confira a Data/Hora do Sistema Abaixo ---------------');
      console.error('\x1b[0m\x1b[1m', '            ' + (new Date()).toString("yyyyMMddHHmmss").replace(/T/, ' ').replace(/\..+/, '').substring(4));
      console.error('\x1b[0m\x1b[32m', '-- Se não estiver atual, a porta NTP 123 pode estar bloqueada ------');
      console.error('\x1b[0m\x1b[32m', '-- Ela precisa ser liberada para sincronia do horário --------------');
      console.error('\x1b[0m\x1b[32m', '-- Havendo dúvidas, contate suporte@mindmakers.cc ------------------');
      console.log('');

    }

  //  gcloudRegistry.criaIoTDevice(escolaid, pi_registrado, sala_registrado, estacao_registrado);

  });
}


function obtemVersaoImagemDisco() {

  var ePortugues = statPath('/home/pi/Área de Trabalho');

  if (ePortugues) {

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
    console.err('Para ativar uma estação ela precisa estar usando uma imagem de disco corretamente configurada.');
    console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
    // Encerra com falha
    process.exit(1);
  }

  versaoImagemDisco = atalho_mm_conteudo.substring(inicial, final);

  console.log('Identificada a versão da imagem de disco como ' + versaoImagemDisco);
}

function verificaInstrutor() {

  var ePortugues = statPath('/home/pi/Área de Trabalho');

  var atalho_instrutor;

  if (ePortugues) {

    atalho_instrutor = fs.readFileSync('/home/pi/Área de Trabalho/update.desktop') + '';

  } else {

    // versão em ingles
    atalho_instrutor = fs.readFileSync('/home/pi/Desktop/update.desktop') + '';

  }

  // obtém versão
  return atalho_instrutor.indexOf('teacher.sh') > -1;
}

function existeAtalhoMindMakersPortugues() {

  try {
    var ret = statPath('/home/pi/Área de Trabalho/mindmakers.desktop');
    return ret;

  } catch (e) {
    return false;

  }

}

function existeAtalhoMindMakersIngles() {

  try {
    var ret = statPath('/home/pi/Desktop/mindmakers.desktop');
    return ret;

  } catch (e) {
    return false;

  }
}

function existeAtalhoMindMakers() {

  return existeAtalhoMindMakersPortugues() || existeAtalhoMindMakersIngles();

}


function atualizaNomeRede(urlEstacao) {

  if (!urlEstacao) {
    console.error('\x1b[31m', 'Não registrou URL da estação porque sua identificação chegou inválida. ' +
      'Ative novamente informando corretamente a sala e estação para ' +
      'que as funções de rede funcionem apropriadamente.');
    console.log('\x1b[32m', '');
    return
  }

  var conteudo = fs.readFileSync('/etc/avahi/avahi-daemon.conf') + '';

  // Se estiver comentado, remove
  conteudo = conteudo.replace('#host-name=', 'host-name=');

  // Substitui URL
  var ponto_inicial_url = conteudo.indexOf('host-name=') + 10;

  var conteudo_parteinicial = conteudo.substring(0, ponto_inicial_url);


  var ponto_inicial_fim_conteudo = ponto_inicial_url;
  var conteudo_partefinal = conteudo.substring(ponto_inicial_fim_conteudo);

  var ponto_inicial_fim_conteudo2 = conteudo_partefinal.indexOf('#domain-name=') - 1;

  conteudo_partefinal = conteudo_partefinal.substring(ponto_inicial_fim_conteudo2);
  //console.log("conteudo partefinal: "+conteudo_partefinal);

  var conteudo_novo = conteudo_parteinicial + urlEstacao + conteudo_partefinal;
  //console.log("conteudo novo: "+conteudo_novo);

  fs.writeFile('/etc/avahi/avahi-daemon.conf', conteudo_novo, function(err, data) {
    if (err)
      console.log(err);
    else {
      //console.log('Atualizou URL da estação para '+urlEstacao);
      atualizaSchoolInfo();
    }

  });
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

  var novoatalho_sala = "/usr/share/icons/" + sala_informado + ".png";

  var novoatalho_estacao = "/usr/share/icons/" + estacao_informado + ".png";
  // é estação do instrutor
  if (parseInt(estacao_informado + '') == 0)
    novoatalho_estacao = "/usr/share/icons/f.png";

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
