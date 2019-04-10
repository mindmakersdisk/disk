/*
  Atualiza versão da estação após atualização de versão de imagem

  1. Obtém escola, pi, SD e versão, após atualização Ansible, e gravar na plataforma
  2. Executado automaticamente em /home/mindmakers/programas -> "sudo node mmversionupdate.js".

  Paulo Alvim 04/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')
//const si = require('systeminformation')
var fs = require('fs');


// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var pi_registrado='';
var sd_registrado='';

// Identificados
var versaoImagemDisco='';

fs.readFile('/home/mindmakers/school.info', function(err,data)
        {
          if (err) {
              console.log(err);
              process.exit(1);
          } else {
             escolainfo = data.toString();
             escolaidIni =escolainfo.indexOf('Cód.:')+5;
             escolaid= escolainfo.substring(escolaidIni,escolainfo.indexOf('||'),escolaidIni).trim();
             // console.log(escolaid);
             piIni = escolainfo.indexOf('Pi:')+3;
             pi_registrado= escolainfo.substring(piIni,escolainfo.indexOf('||',piIni)).trim();
             // console.log(pi_registrado);
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
            // Verifica se está configurado e se está alocado (pré-requisitos para ativação)

            obtemVersaoImagemDisco();

            if (escolaid==null || escolaid=='' || pi_registrado=='' || escolaid.toString().toLowerCase().indexOf('não')>-1 ) {
               console.log('');
               console.error('\x1b[31m','Como estação ainda não está ativada, não atualiza versão.');
               console.log('');
               process.exit(1);
      
            }

            atualizaVersaoEstacao();

          }
        });




/* FUNÇÕES QUE CONSULTAM E ATUALIZAM INFORMAÇṌES NA PLATAFORMA*/




function atualizaVersaoEstacao() {

     request({url: 'https://mindmakers.cc/api/Escolas/atualizaVersaoEstacao/publico',
            method: 'POST',
            json: {
              'alocadoescola':escolaid,
              'computadorserial':pi_registrado,
              'discoserial':sd_registrado,
              'versaoimagemdisco':versaoImagemDisco
              'sala':sala_registrado,
              'codigo':estacao_registrado}
            },
            function(error, response, body){
                if (!body.success || error) {
                    if (!body.success)
                      console.log('Erro ao atualizar versão da estação na plataforma: '+JSON.stringify(body.err));
                    else
                      console.log('Erro ao atualizar versão da estação na plataforma: '+error);
                } else {
                    console.log('Versão da estação atualizada na plataforma com sucesso! ');
                }
            }
        );

}



function statPath(path) {

  try {

    return fs.statSync(path);

  } catch (ex) {
      return false;
  }

}


function obtemVersaoImagemDisco() {

  var ePortugues = statPath('/home/pi/Área de Trabalho');

  if (ePortugues) {

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
       console.err('Para atualizar uma estação ela precisa estar usando uma imagem de disco corretamente configurada.');
       console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
       // Encerra com falha
       process.exit(1);
   }

   versaoImagemDisco = atalho_mm_conteudo.substring(inicial,final);

   console.log('Identificada a versão da imagem de disco como '+versaoImagemDisco);


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
    var ret =  statPath('/home/pi/Desktop/mindmakers.desktop');
    return ret;
  } catch (e) {
    return false;
  }

}

function existeAtalhoMindMakers() {

    return existeAtalhoMindMakersPortugues() || existeAtalhoMindMakersIngles();

}
