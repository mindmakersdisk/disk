/*
  Inventário e Ativação Automatizada de Ativos 
   
  1. Aproxime um Sphero se desajar ativar junto, ou seja, alterar o atalho de execução e registrar o SPRK no inventário da escola (opcional)
  2. Execute com o atalho adequado ou de terminal do diretório /home/mindmakers/programas -> "sudo node mmactivate.js". 

  Paulo Alvim 03/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')  
//const si = require('systeminformation')
var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');
var gcloudRegistry = require('./mmallocatecloud');

// Este serviço foi concebido para rodar local, por isso o uso de variáveis globais
var global_jsondevicelist=[];

// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var sprk_registrado='';
var pi_registrado='';
var sd_registrado='';
var sala_registrado = '1';
var estacao_registrado = '';

// Identificados
var sprk_identificado='';
var pi_identificado=''
var sd_identificado=''
var versaoImagemDisco='';

// Informados
var idescola_informado='';
var sala_informado='';
var estacao_informado='';

// Recuperados
var escolanome_recuperado='';

var numeroScans=0;
var modoregistro=false;

// Semáforo para sinalizar finalização dos serviços assincronos
var totalAcessosPlataformaPendentes=-1;
var servicoRecorrente;
var tentativas=0;

fs.readFile('/home/mindmakers/school.info', function(err,data) 
        {
          if (err) {
              console.log(err);
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
            console.log('--- Identificação automática de ativos');
            getSDSerialNumber();
            getPiSerial();  
            
            // Verifica se está configurado e se está alocado (pré-requisitos para ativação)
            
            obtemVersaoImagemDisco();
            
            if (escolaid==null || escolaid=='' || escolaid.toString().toLowerCase().indexOf('não')>-1) {
               console.log('');
               console.error('\x1b[31m','Não foi possível identificar uma escola para a qual esse disco foi alocado');
               console.error('\x1b[31m','Para ativar uma estação ela precisa estar previamente alocada para uma escola.');
               console.error('\x1b[31m','Reexecute a alocação ou contate suporte@mindmakers.cc para obter apoio.');
               console.log('');
               process.exit(1);
      
            }
            
                     
            noble.on('stateChange', function(state) {
              if (state === 'poweredOn') {
                console.log('Procurando por Sphero SPRK+ a menos de 20cm...');
                noble.startScanning();
              } else {
               console.log('Encerrando procura');
                noble.stopScanning();
              }
            });
            
          }
        });

noble.on('discover', function(peripheral) {
  
  numeroScans++;
  
  //console.log('Encontrou dispositivos bluetooth low energy (BLE). Scan no. '+numeroScans);
  
  if (peripheral.rssi>-65  && (
            (''+peripheral.advertisement.localName).indexOf('SK') == 0 || 
            (''+peripheral.advertisement.localName).indexOf('Sphero')==0)) {
    
      console.log('Sphero SPRK+:'+peripheral.address + ' [Nome:'+peripheral.advertisement.localName +
                ', Conectável:' + peripheral.connectable + ', RSSI:' + peripheral.rssi+']');
      console.log('');
      
      
      global_jsondevicelist.push({"address":peripheral.address,
 				"localname":peripheral.advertisement.localName,
				"rssi":peripheral.rssi, 
				"manufacter":JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))});

      // registro completo se houver alguma diferença
      sprk_identificado = peripheral.address+'';
      
      executaRegistros();
  
  } 

  if (numeroScans>=4 && global_jsondevicelist.length==0) {
    
    if (!modoregistro) {
        
       console.log('Não localizei um Sphero SPRK+ próximo. Se desejar registrar,aproxime uma unidade a menos de 20cm para identificação automática.');
       console.log('');
     
       executaRegistros();
    }

  }


});

var questions = [
  {
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar essa estação?"
  },
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:",
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
  },
  {
    type: 'list',
    name: 'loginSimplificado',
    message: "Selecione a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar','1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
                    '2. Configurar Login Padrão (exige do aluno informar sua senha)'],
    when: function (answers) {
      return answers.opcao;
    }
  },
  {
    type: 'input',
    name: 'numeroSalas',
    message: "Quantas turmas simultâneas de Mind Makers pode ter a escola?",
    default: 1,
    when: function (answers) {
      return (answers.opcao && answers.loginSimplificado.toString().indexOf('Login Simplificado')>-1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala, atribua um código numérico inteiro para esta (atual:"+sala_registrado+")",
    default: 1,
    when: function (answers) {
      return answers.opcao;
    },
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)>=1 && parseInt(valor)<=10;
    },
  },
  {
    type: 'number',
    name: 'codigo',
    message: "Atribua um código numérico inteiro para identificar essa estação, de 1 a 20 (atual:"+estacao_registrado,
    default: 1,
    when: function (answers) {
      return answers.opcao;
    },
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)>=1 && parseInt(valor)<=20;
    },
  }

];

var questionsHeadless = [
  {
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar essa estação?"
  },
  {
    type: 'input',
    name: 'login',
    message: "Informe seu usuário na plataforma Mind Makers:",
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


var questionsSphero = [
  {
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar o Sphero acima identificado para uso nessa estação?"

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
    message: "Senha:",
    when: function (answers) {
      return answers.opcao;
    }   
  }

];

var questionsLoginSimplificado = [
  {
    type: 'list',
    name: 'loginSimplificado',
    message: "Deseja modificar a opção de uso de login no atalho Mind Makers.",
    choices: ['0. Não modificar','1. Configurar Login Simplificado (permite ao aluno selecionar sua senha)',
                    '2. Configurar Login Padrão (exige do aluno informar sua senha)']
  },
  {
    type: 'input',
    name: 'numeroSalas',
    default: 1,
    message: "Quantas turmas simultâneas de Pensamento Computacional pode ter a escola?",
    when: function (answers) {
      return (answers.loginSimplificado.toString().indexOf('Login Simplificado')>-1);
    }
  },
  {
    type: 'number',
    name: 'sala',
    message: "Se possuir mais de uma sala, atribua um código numérico inteiro para esta (atual:"+sala_registrado+")",
    default: 1,
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)>=1 && parseInt(valor)<=10;
    },
  },
  {
    type: 'number',
    name: 'codigo',
    message: "Atribua um código numérico inteiro para identificar essa estação, de 1 a 20 (atual:"+estacao_registrado+")",
    default: 1,
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)>=1 && parseInt(valor)<=20;
    },
  }

];



function getSDSerialNumber() {

  var content = fs.readFileSync('/proc/cpuinfo', 'utf8');

   var cont_array = content.split("\n");

   var serial_line = cont_array[cont_array.length-2];

   var serial = serial_line.split(":");
   
   pi_identificado=(serial[1].slice(1)+'').trim();

   console.log('PI Serial:'+serial[1].slice(1));
  
  
}

function getPiSerial(){

   var SDSerial = fs.readFileSync('/sys/block/mmcblk0/device/serial');
  
  // Também pode ser usado no futuro, identifica o modelo.
  // var SDCID = fs.readFileSync('/sys/block/mmcblk0/device/cid');
   
   sd_identificado=(SDSerial+'').trim();

   console.log('SD Serial: '+SDSerial /*+ ' CID='+ SDCID */);

}

function executaRegistros() {


   if (soSpheroPendente()) {
     // Faz registro somente do Sphero
         
      modoregistro=true;
      inquirer.prompt(questionsSphero).then(answers => {
        if (answers.opcao) {
          atualizaAtalhoSphero();
          registraSpheroPlataforma(answers);
          totalAcessosPlataformaPendentes=1;
          servicoRecorrente=setInterval(monitoraAcessosAssincronosPlataforma,2000);
        }
        modoregistro=false;
      });        
   
   } else if (tudoOk()) {
     
      // Opção de Login Simplificao apenas     
      modoregistro=true;

      console.log('-------------------------------------------------------');     
      console.log('--- Todas as configurações de ativação já estão ok! ---');
      console.log('-------------------------------------------------------');
      console.log('');
      
      if (!existeAtalhoMindMakers()) {
          // Então é headless
          return;
      }
      
      inquirer.prompt(questionsLoginSimplificado).then(answers => {
                  
            if (answers.loginSimplificado!=null && answers.loginSimplificado.toString().indexOf('Não')==-1) {
              
                atualizaAtalhoLoginSimplificadoEscola(answers);
            
            } 
                
            sala_informado=answers.sala;
          
            estacao_informado=answers.codigo;
            
            salaInt = parseInt(sala_informado);
            estacaoInt = parseInt(estacao_informado);

            atualizaVersaoEstacao(escolaid,pi_identificado,sd_identificado,versaoImagemDisco,salaInt,estacaoInt); 

            totalAcessosPlataformaPendentes=0;
            servicoRecorrente=setInterval(monitoraAcessosAssincronosPlataforma,2000);                 
            
            modoregistro=false;
              
      });   
    
          
   } else {
     
      // Faz registro geral
      var perguntas = questions;
      
      if (!existeAtalhoMindMakers()) {
          // Então é headless
          perguntas=questionsHeadless;
      }
        
      modoregistro=true;
      inquirer.prompt(perguntas).then(answers => {
        
        if (answers.opcao) {
          
            idescola_informado=escolaid;
            escolanome_recuperado= escolanome;

            sala_informado=answers.sala;
            //console.log('sala = '+sala_informado);
            estacao_informado=answers.codigo;
            
            registraAtivosEscolaPlataforma(answers);
            atualizaAtalhoSphero();   
            
            if (perguntas===questions)   
                atualizaAtalhoLoginSimplificadoEscola(answers);
            
            totalAcessosPlataformaPendentes=2;
            servicoRecorrente=setInterval(monitoraAcessosAssincronosPlataforma,2000);  
 
        } else {
          console.log('');
          process.exit(0);
        }
        
        modoregistro=false;
            
      });   
  }
}


function soSpheroPendente() {

//console.log('identificado='+sprk_identificado+ ' registrado = '+sprk_registrado);

  return (pi_identificado == pi_registrado) &&
        (sd_identificado == sd_registrado) &&
        (sprk_identificado!='' && sprk_identificado!=sprk_registrado);
  
}

function tudoOk() {

  return (pi_identificado == pi_registrado) &&
        (sd_identificado == sd_registrado) &&
        (sprk_identificado=='' || sprk_identificado==sprk_registrado);
  
}


/* FUNÇÕES QUE CONSULTAM E ATUALIZAM INFORMAÇṌES NA PLATAFORMA*/


function registraAtivosEscolaPlataforma(resposta) {
  //console.log(resposta)
  // Registra PI
  
     request({url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
            method: 'POST',
              json: {'username':resposta.login,'password':resposta.senha, 'tipo':'Raspberry','alocadoescola':escolaid, 
                           'chaveNatural':pi_identificado,'acao': 'registrar','observacao': 'ativação automática'}},    
            function(error, response, body){                
                if (!body.success || error) {
                  if (!body.success)
                    console.log('Erro ao registrar PI: '+body.err);
                  else
                    console.log('Erro ao registrar PI: '+error);                  
                } else {
                    totalAcessosPlataformaPendentes=totalAcessosPlataformaPendentes-1;
                    console.log('PI registrado com sucesso! ');
                }
            }
        );
    
  
  
  // Registra SD
  
     request({url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
            method: 'POST',
            json: {'username':resposta.login,'password':resposta.senha, 'tipo':'CartaoSD','alocadoescola':escolaid, 
                           'chaveNatural':sd_identificado,'acao': 'registrar',
              'observacao': 'ativação automática'}},                 
            function(error, response, body){
                if (!body.success || error) {
                    if (!body.sucess)
                        console.log('Erro ao registrar SD: '+body.err);
                    else
                        console.log('Erro ao registrar SD: '+error);  

                } else {
                    totalAcessosPlataformaPendentes=totalAcessosPlataformaPendentes-1;
                    console.log('Cartão SD registrado com sucesso! ');
                }
            }
        );
        

  // Registra Estação somente se está ativando para uma escola informada.
        
     if (escolaid!=null && escolaid!='') {
  
        salaInt = parseInt(sala_informado);
        estacaoInt = parseInt(estacao_informado);
       // console.log('s='+salaInt+' estacao='+estacaoInt);

        atualizaEstacao(resposta.login,resposta.senha,pi_identificado,sd_identificado,escolaid,versaoImagemDisco,salaInt,estacaoInt,verificaInstrutor());
        
        
      }  
      

}

function atualizaEstacao(login,senha,pi,sd,escolaid,versao,sala,estacao,indInstrutor) {
  
          request({url: 'https://mindmakers.cc/api/Escolas/estacao/publico',
            method: 'POST',
            json: {'username':login,'password':senha, 'computadorserial':pi,
                            'discoserial':sd, 'alocadoescola':escolaid, 
                           'versaoimagemdisco':versao,'sala':sala,'codigo':estacao,'indinstrutor':indInstrutor}},                 
            function(error, response, body){
                if (!body.success || error) {
                  if (!body.sucess)
                    console.log('Erro ao registrar Estacao: '+body.err);
                  else
                    console.log('Erro ao registrar Estacao: '+error);                    
                  console.log('');
                  process.exit(1);
                } else {
                    console.log('Estação registrada com sucesso!');
                }
            }
        );    
  
  
}

function atualizaVersaoEstacao(escolaid,pi,sd,versao,sala,estacao) {
    
     request({url: 'https://mindmakers.cc/api/Escolas/atualizaVersaoEstacao/publico',
            method: 'POST',
            json: {
              'alocadoescola':escolaid,
              'computadorserial':pi,
              'discoserial':sd,
              'versaoimagemdisco':versao,
              'sala':sala,
              'codigo':estacao}
            },
            function(error, response, body){
                if (!body.success || error) {
                    if (!body.success)
                      console.log('Erro ao atualizar versão da estação na plataforma: '+body.err);
                    else
                      console.log('Erro ao atualizar versão da estação na plataforma: '+error);
                } else {               
                    console.log('Versão da estação atualizada na plataforma com sucesso! ');
                }
            }
        );
    
}



function registraSpheroPlataforma(resposta) {
  
    if (sprk_identificado=='')
       return;

    // Registra SPRK+
   // console.log('chave = '+sprk_identificado);
    
     request({url: 'https://mindmakers.cc/api/Escolas/ativo/publico',
            method: 'POST',
            json: {
              'username':resposta.login,
              'password':resposta.senha,
              'tipo':'SPRKPlus',
              'alocadoescola':escolaid, 
              'chaveNatural':sprk_identificado,
              'acao': 'registrar',
              'observacao': 'ativação automática'}
            },
            function(error, response, body){
               // console.log('ERROR ---------------------------');
               // console.log(error);      
             //   console.log('RESPONSE---------------------------');
             //   console.log(response);
              //  console.log('BODY---------------------------');
              //  console.log(body);       
                if (!body.success || error) {
                    if (!body.success)
                      console.log('Erro ao registrar SPRK+: '+body.err);
                    else
                      console.log('Erro ao registrar SPRK+: '+error);
                } else {
                    totalAcessosPlataformaPendentes=totalAcessosPlataformaPendentes-1;                 
                    console.log('SPRK+ registrado com sucesso! ');
                }
            }
        );
    
}




/* FUNÇÕES QUE ATUALIZAM INFORMAÇṌES LOCAIS*/

/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoSphero() {
  
  if (sprk_identificado=='') {
     console.log('Não modificou o atalho do Sphero pois não encontrou nenhum SPRK+ próximo');
       return;
  }
  
  var sprkshell = fs.readFileSync('/home/mindmakers/programs/shells/sphero-connect+.sh')+'';
   
   // substitui macaddress
   var ponto_chave = sprkshell.indexOf('.js')+3;
   
    sprkshell_parteinicial=sprkshell.substring(0,ponto_chave);
    
    sprkshell_partefinal=sprkshell.substring(sprkshell.indexOf('sudo fuser',ponto_chave)-1);
   
    sprkshell_novo=sprkshell_parteinicial+' '+sprk_identificado+'\n'+sprkshell_partefinal;
   
   // grava
  
  fs.writeFile('/home/mindmakers/programs/shells/sphero-connect+.sh', sprkshell_novo, function(err,data) 
        {
          if (err)
              console.log(err);
          else {
          
            console.log('Alterou a configuração para usar o Sphero '+sprk_identificado+' neste computador!');

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

function atualizaAtalhoLoginSimplificadoEscola(resposta) {
  
  if (resposta.loginSimplificado.toString().indexOf('Não')>-1) 
     return
  
  var atalho_mm_conteudo;
  
  var existeEmPortugues = statPath('/home/pi/Área de Trabalho/mindmakers.desktop');
  
  if (existeEmPortugues) {
    
    atalho_mm_conteudo= fs.readFileSync('/home/pi/Área de Trabalho/mindmakers.desktop')+'';
    
  } else {
    
    // versão em ingles
    atalho_mm_conteudo= fs.readFileSync('/home/pi/Desktop/mindmakers.desktop')+'';    
  
  }
   
   // substitui URL
   var ponto_chave = atalho_mm_conteudo.indexOf('Exec=')+5;
   
    conteudo_parteinicial=atalho_mm_conteudo.substring(0,ponto_chave);
    
    conteudo_partefinal=atalho_mm_conteudo.substring(atalho_mm_conteudo.indexOf('--allow-control-allow-origin'));
    
   // console.log(conteudo_parteinicial);
   //console.log(conteudo_partefinal);    
    var msg_final='';
    if (resposta.loginSimplificado.toString().indexOf('Login Simplificado')>-1) {
        conteudo_novo=conteudo_parteinicial+'chromium-browser https://mindmakers.cc/login-simplificado?id='+escolaid+
                            '&quantSalas='+resposta.numeroSalas+' '+conteudo_partefinal;
                            
        msg_final='Configurou o atalho Mind Makers para usar Login Simplificado suportando '+resposta.numeroSalas+' turmas simultâneas (permite ao aluno selecionar sua senha)!';
        
    } else { 
        conteudo_novo=conteudo_parteinicial+'chromium-browser https://mindmakers.cc/login/'+' '+conteudo_partefinal;
        msg_final='Configurou o atalho Mind Makers para usar login padrão (exige do aluno informar sua senha)!';      
    }
    
   // grava
   //console.log('conteudo_novo'+conteudo_novo);
   
   if (existeEmPortugues) {
    
      fs.writeFile('/home/pi/Área de Trabalho/mindmakers.desktop', conteudo_novo, function(err,data) 
        {
          if (err)
              console.log(err);
          else {
            console.log(msg_final);
            console.log('');
          }
        }
        );
    
  } else {
    
      fs.writeFile('/home/pi/Desktop/mindmakers.desktop', conteudo_novo, function(err,data) 
        {
          if (err)
              console.log(err);
          else {
          
            console.log(msg_final);
            console.log('');

          }
        }
        );
  
  }
  
}

function monitoraAcessosAssincronosPlataforma() {
  
 // console.log('entrou na monitoria')
  
  // Somente depois de todos os serviços de registro ocorrem ok, alterar o arquivo local.
  if (totalAcessosPlataformaPendentes<=0) {
    
    atualizaSchoolInfo();

    clearInterval(servicoRecorrente);
    
  } else {
      tentativas++;
      if (tentativas>5) {
        console.log('Registro não pode ser realizado com sucesso. '+
        'Informações podem ter sido parcialmente configuradas. Cód: '+totalAcessosPlataformaPendentes);
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
  if (pi_registrado!=pi_identificado) {
     pi_registrado=pi_identificado;
  }
  
  // Muda SD?
  if (sd_registrado!=sd_identificado) {
     sd_registrado=sd_identificado;
  }

  // Muda Sphero?
  if (sprk_registrado!=sprk_identificado && sprk_identificado!='') {
     sprk_registrado=sprk_identificado;
  }
  
  // Muda Sala?
  if (sala_registrado!=sala_informado && sala_informado!='') {
     sala_registrado=sala_informado;
  }

  // Muda Estacao?
  if (estacao_registrado!=estacao_informado && estacao_informado!='') {
     estacao_registrado=estacao_informado;
  }
  
  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
                         "Cód.: "+escolaid+"||\n"+
                         "Nome: "+escolanome+"||\n"+
                         "Pi: "+pi_registrado+"||\n"+
                         "SD: "+sd_registrado+"||\n"+
                         "Sphero: "+sprk_registrado+"||\n"+
                         "Sala: "+sala_registrado+"||\n"+
                         "Estação: "+estacao_registrado+"||\n"+
                         "--------------------------------------------";  
  
  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err,data) 
        {
          if (err) {
              console.log(err);
              // Encerra com falha
              process.exit(1);
          } else {
          
            console.log('------------- Ativação OK! ------------------');
            console.log('---------------------------------------------');
            console.log(escolainfoatualizada.replace(/\|\|/g,''));
            console.log('');

            var fd = 
            console.error('\x1b[32m','-------------- Confira a Data/Hora do Sistema Abaixo ---------------');
            console.error('\x1b[0m\x1b[1m','            '+(new Date()).toString("yyyyMMddHHmmss").replace(/T/,' ').replace(/\..+/,'').substring(4));
            console.error('\x1b[0m\x1b[32m','-- Se não estiver atual, a porta NTP 123 pode estar bloqueada ------');
            console.error('\x1b[0m\x1b[32m','-- Ela precisa ser liberada para sincronia do horário --------------');
            console.error('\x1b[0m\x1b[32m','-- Havendo dúvidas, contate suporte@mindmakers.cc ------------------');
            console.log('');
          
          }
          
           gcloudRegistry.criaIoTDevice(escolaid,pi_registrado,sala_registrado,estacao_registrado);
        
        }
        );
        
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
       console.err('Para ativar uma estação ela precisa estar usando uma imagem de disco corretamente configurada.');
       console.err('Reexecute a configuração automatizada ou contate suporte@mindmakers.cc para obter apoio.');
       // Encerra com falha
       process.exit(1);
   }
   
   versaoImagemDisco = atalho_mm_conteudo.substring(inicial,final);
   
   console.log('Identificada a versão da imagem de disco como '+versaoImagemDisco);

  
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
