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

// Informado
var idescola_informado='';

// Registrado em disco
var escolainfo=''
var escolaid='';
var escolanome='';

// Recuperados
var escolanome_recuperado='';

fs.readFile('/home/mindmakers/school.info', function(err,data)
        {
          if (err)
              console.log(err);
          else {

              escolainfo = data.toString();
              console.log('--------------------------------------------------');
              console.log('--- Alocação de Disco para Escola. Registro Atual:');

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
              sprkIni = escolainfo.indexOf('Sphero:')+7
              sprk_registrado= escolainfo.substring(sprkIni,escolainfo.indexOf('||',sprkIni)).trim();
              //console.log(sprk_registrado);
              salaIni = escolainfo.indexOf('Sala:')+5
              sala_registrado= escolainfo.substring(salaIni,escolainfo.indexOf('||',salaIni)).trim();
              //console.log(sala_registrado);
              estacaoIni = escolainfo.indexOf('Estação:')+8
              estacao_registrado= escolainfo.substring(estacaoIni,escolainfo.indexOf('||',estacaoIni)).trim();
              //console.log(estacao_registrado);

            console.log('');
            console.log(escolainfo.replace(/\|\|/g,''));
            console.log('');


            rotinaAlocacao();

          }
        });


var questions = [
  {
    type: 'confirm',
    name: 'opcao',
    message: "Deseja alocar este disco para uma Escola?"
  },
  {
    type: 'input',
    name: 'idescola',
    message: "Digite ou cole o código da escola (solicite à Mind Makers se não possuir):",
    when: function (answers) {
      return answers.opcao;
    }
  },
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário Mind Makers:",
    when: function (answers) {
      return answers.opcao;
    }
  },
  {
    type: 'password',
    name: 'senha',
    message: "Informe sua senha:",
    when: function (answers) {
      return answers.opcao;
    }
  }

];


function rotinaAlocacao() {

  inquirer.prompt(questions).then(answers => {

        if (answers.opcao) {

          // Testa se imagem está configurada
          obtemVersaoImagemDisco();

          idescola_informado=answers.idescola;

          recuperaNomeEscola(answers);

        }

  });

}



/* FUNÇÕES QUE CONSULTAM INFORMAÇṌES NA PLATAFORMA*/

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

// Recupera imagem da escola - pendente de implementações futuras.
function recuperaImagemEscola(resposta) {

       request('https://mindmakers.cc/api/Escolas/logo/publico?id='+resposta.idescola,
            function(error, response, body) {

                if (!body.success) {
                   console.log('Erro ao recuperar logo: '+JSON.stringify(body.err));
                   console.log(body);
                } else {

                    // Salva logotipo da escola

                    console.log('Vai salvar logotipo da escola');
                }
            }
        );


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

  if (escolanome_recuperado != null && escolanome_recuperado!='') {

     escolaid=idescola_informado;
     escolanome=escolanome_recuperado;

  }

    // Cria Registry para escola
    gcloudRegistry.criaIoTRegistry(escolaid);

    escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
                         "Cód.: "+escolaid+"||\n"+
                         "Nome: "+escolanome+"||\n"+
                         "Pi: Não registrado||\n"+
                         "SD: Não registrado||\n"+
                         "Sphero: ||\n"+
                         "Sala: ||\n"+
                         "Estação: ||\n"+
                         "--------------------------------------------";

  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err,data)
        {
          if (err) {
              console.log('Erro ao gravar arquivo de alocação: '+err);
              // Encerra com falha
              process.exit(1);
          } else {
            console.log('------------- Alocação OK! ------------------');
            console.log('---------------------------------------------');
            console.log(escolainfoatualizada.replace(/\|\|/g,''));
            // Encerra com sucesso


          }

        }
        );

}

function obtemVersaoImagemDisco() {

  var existeEmPortugues = statPath('/home/pi/Área de Trabalho/mindmakers.desktop');

  if (existeEmPortugues) {

    atalho_mm_conteudo= fs.readFileSync('/home/pi/Área de Trabalho/releasenotes.desktop')+'';

  } else {

    // versão em ingles
    atalho_mm_conteudo= fs.readFileSync('/home/pi/Desktop/releasenotes.desktop')+'';

  }

   // obtém versão
   var inicial = atalho_mm_conteudo.indexOf('Name[pt_BR]=')+12;

   var final = atalho_mm_conteudo.indexOf('Type')-1;


   if (inicial == -1 || final == -1) {
       console.err('Não foi possível identificar a versão da imagem do disco investigando o atalho padrão de notas de liberação');
       console.err('Para alocar uma imagem de disco a uma escola, ela precisa estar corretamente configurada.');
       console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
       // Encerra com falha
       process.exit(1);
   }

   var versaoImagemDisco = atalho_mm_conteudo.substring(inicial,final);

   console.log('Identificada a versão da imagem de disco como '+versaoImagemDisco);

   return versaoImagemDisco;

}
