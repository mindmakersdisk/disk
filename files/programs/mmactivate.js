/*
  Mind Makers Blockly.
  Serviço Node para seleção dos dispositivos bluetooth disponíveis. 
  Paulo Alvim 20/12/2016
 
  1. Certificar-se que o bluetooth do PI está ligado
  2. Rodar com "sudo node appble.js". 
  3. Testar abrindo o navegador e chamando http://localhost

  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/
const express = require('express')  
const request = require('request')  
const si = require('systeminformation')
const app = express()

var noble = require('/home/mindmakers/programs/node_modules/noble/index.js')
var inquirer = require('inquirer');
var fs = require('fs');

// Este servidor foi concebido para rodar local, por isso o uso de estado
// em variáveis globais
var global_jsondevicelist=[];

// Registrados
var escolainfo=''
var escolaid='';
var escolanome='';
var sprk_registrado='';
var pi_registrado='';
var sd_registrado='';

// Identificados
var sprk_identificado='';
var pi_identificado=''
var sd_identificado=''

// Recuperados
var escolanome_recuperado='';

var numeroScans=0;
var modoregistro=false

fs.readFile('/home/mindmakers/school.info', function(err,data) 
        {
          if (err)
              console.log(err);
          else {
          
              escolainfo = data.toString();
              escolaid= escolainfo.substring(escolainfo.indexOf('Cód.:')+5,escolainfo.indexOf('Nome:')-1).trim();
             // console.log(escolaid);
              escolanome= escolainfo.substring(escolainfo.indexOf('Nome:')+5,escolainfo.indexOf('Pi:',)-1).trim();
             // console.log(escolanome);
             pi_registrado= escolainfo.substring(escolainfo.indexOf('Pi:')+3,escolainfo.indexOf('SD:',)-1).trim();
             // console.log(pi);
             sd_registrado= escolainfo.substring(escolainfo.indexOf('SD:')+3,escolainfo.indexOf('Sphero:',)-1).trim();
             // console.log(sd);
             sprk_registrado= escolainfo.substring(escolainfo.indexOf('Sphero:')+7,escolainfo.indexOf('----',)-1).trim();
             // console.log(sprk_registrado);
            console.log('');
            console.log(escolainfo);
            
            console.log('--- Identificação automática de ativos');
            getSDSerialNumber();
            getPiSerial();  
                     
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

// Permite que página da aplicação Mind Makers acesse este servidor local
app.use((request, response, next) => {  
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  next()
})

app.get('/', (request, response) => {  
  response.json(global_jsondevicelist)
})

//app.listen(8080) 


noble.on('discover', function(peripheral) {
  
  numeroScans++;
  
 // console.log('Encontrou dispositivos bluetooth low energy (BLE). Scan no. '+numeroScans);
  
  if (peripheral.rssi>-50  && (
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

  if (numeroScans>=5 && global_jsondevicelist.length==0) {
    
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
    message: "Deseja ativar Escola, Pi, Cartao e Sphero"
  },
  {
    type: 'input',
    name: 'idescola',
    message: "Informe o código da escola (solicie à Mind Makers se não possuir):",
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
    message: "Senha:",
    when: function (answers) {
      return answers.opcao;
    }
  }

];

var questionsEscola = [
  {
    type: 'confirm',
    name: 'opcao',
    message: "Deseja ativar Escola, Pi e/ou Cartão SD?"
  },
  {
    type: 'input',
    name: 'idescola',
    message: "Informe o código da escola (solicie à Mind Makers se não possuir):",
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
    message: "Senha:",
    when: function (answers) {
      return answers.opcao;
    }
  }

];

var questionsSphero = [
  {
    type: 'confirm',
    name: 'confirma',
    message: "Deseja ativar o Sphero acima"

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


function getSDSerialNumber() {
  
  /*
  si.diskLayout().then(data => {
    console.log('SD Serial:');    
    console.log(data);
    
    })
  */
  var content = fs.readFileSync('/proc/cpuinfo', 'utf8');

   var cont_array = content.split("\n");

   var serial_line = cont_array[cont_array.length-2];

   var serial = serial_line.split(":");
   
   pi_identificado=(serial[1].slice(1)+'').trim();

   console.log('PI Serial:'+serial[1].slice(1));
  
  
}

function getPiSerial(){

   var SDSerial = fs.readFileSync('/sys/block/mmcblk0/device/serial');
   var SDCID = fs.readFileSync('/sys/block/mmcblk0/device/cid');
   
   sd_identificado=(SDCID+'').trim();

   console.log('SD Serial: '+SDSerial /*+ ' CID='+ SDCID */);

}

function executaRegistros() {
  
   if (tudoEmConformidade()) {
   
      console.log('Todos os ativos identificados já estão corretamente registrados')
   
   } else if (soSpheroPendente()) {
     // Faz registro somente do Sphero
   
      modoregistro=true;
      inquirer.prompt(questionsSphero).then(answers => {
        console.log(JSON.stringify(answers, null, '  '));
        if (answers.opcao) {
          atualizaAtalhoSphero();
          registraSpheroPlataforma(answers);
          atualizaSchoolInfo(answers);
        }
        modoregistro=false;
      });        
   
   } else if (soEscolaPendente()) {
     // Faz registro basico
        
      modoregistro=true;
      inquirer.prompt(questionsEscola).then(answers => {
        console.log(JSON.stringify(answers, null, '  '));
        if (answers.opcao) {
          registraAtivosEscolaPlataforma(answers);
          atualizaSchoolInfo(answers);
        }
        modoregistro=false;
      });        
 
     
   } else {
      // Faz registro geral
        
      modoregistro=true;
      inquirer.prompt(questions).then(answers => {
        console.log(JSON.stringify(answers, null, '  '));
        if (answers.opcao) {
          registraAtivosEscolaPlataforma(answers);
          atualizaAtalhoLoginSimplificadoEscola();
          atualizaAtalhoSphero();
          atualizaSchoolInfo(answers);        
        }
        modoregistro=false;
      });   
  }
}

function tudoEmConformidade() {

  return escolaid!='Escola não registrada' &&
        (sprk_identificado=='' || sprk_identificado==sprk_registrado) &&
        (pi_identificado == pi_registrado) &&
        (sd_identificado == sd_registrado);
  
}


function soSpheroPendente() {

  return escolaid!='Escola não registrada' &&
        (pi_identificado == pi_registrado) &&
        (sd_identificado == sd_registrado) &&
        (sprk_identificado!='' && sprk_identificado!=sprk_registrado);
  
}


function soEscolaPendente() {

  return (escolaid=='Escola não registrada' ||
         pi_identificado != pi_registrado ||
         sd_identificado != sd_registrado) &&
         (sprk_identificado=='' || sprk_identificado==sprk_registrado);
  
}

/* FUNÇÕES QUE CONSULTAM E ATUALIZAM INFORMAÇṌES NA PLATAFORMA*/

function recuperaNomeEscola(resposta) {
  
       request({url: 'https://mindmakers.cc/api/Escolas/nome/publico',
            method: 'GET',
            json: {'id':resposta.idescola}},
            function(error, response, body) {
                console.log(body);
                if (error) {
                  console.log(error);
                } else {
                    escolanome_recuperado=body;
                    console.log('Vai ativar para escola "'+escolanome_recuperado+'".');
                }
            }
        );
  
}

function recuperaImagemEscola(resposta) {
  
       request({url: 'https://mindmakers.cc/api/Escolas/logo/publico',
            method: 'GET',
            json: {'id':resposta.idescola}},
            function(error, response, body) {
                console.log(body);
                if (error) {
                  console.log(error);
                } else {
                    
                    // Salva logotipo da escola
                    
                    console.log('Vai salvar logotipo da escola');
                }
            }
        );
    
  
}

function registraAtivosEscolaPlataforma(resposta) {
  
  // Registra PI
  
     request({url: 'https://mindmakers.cc/api/Escolas/ativo',
            method: 'POST',
            json: {'User.login':resposta.login,'User.pwd':resposta.senha, tipo:'Raspberry',idEscola:resposta.escolaid, 
                chavenatural:pi_identificado}},
            function(error, response, body){
                if (error) {
                  console.log(error);
                } else {
                    console.log('PI registrado com sucesso!');
                }
            }
        );
    
  
  
  // Registra SD
  
     request({url: 'https://mindmakers.cc/api/Escolas/ativo',
            method: 'POST',
            json: {'User.login':resposta.login,'User.pwd':resposta.senha, tipo:'cartaoSD',idEscola:resposta.escolaid, 
                chavenatural:sd_identificado}},
            function(error, response, body){
                if (error) {
                  console.log(error);
                } else {
                    console.log('Cartão SD registrado com sucesso!');
                }
            }
        );

}


function registraSpheroPlataforma(resposta) {

    // Registra SPRK+

     request({url: 'https://mindmakers.cc/api/Escolas/ativo',
            method: 'POST',
            json: {'User.login':resposta.login,'User.pwd':resposta.senha, tipo:'SPRK+',idEscola:resposta.escolaid, chavenatural:sprk_identificado}},
            function(error, response, nome_escola){
                
                if (error) {
                  console.log(error);
                } else if (body) {
                    console.log('SPRK+ registrado com sucesso!');
                }
            }
        );
    
}




/* FUNÇÕES QUE ATUALIZAM INFORMAÇṌES LOCAIS*/

/* Atualiza atalho do servidor Sphero */
function atualizaAtalhoSphero() {
  
  
}

function atualizaAtalhoLoginSimplificadoEscola() {
  
  
}


/* Grava mudanças no arquivo de registro */
function atualizaSchoolInfo(resposta) {
  
  // Muda escola?
  if (escolaid!=resposta.idescola && resposta.idescola != null && resposta.idescola!='') {
     escolaid=resposta.idescola;
     escolanome=escolanome_recuperado;
  }
  
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
  
  escolainfoatualizada = "--- Ativação de Desktop Mind Makers ---\n" +
                         "Cód.: "+escolaid+"\n"+
                         "Nome: "+escolanome+"\n"+
                         "Pi: "+pi_registrado+"\n"+
                         "SD: "+sd_registrado+"\n"+
                         "Sphero: "+sprk_registrado+"\n"+
                         "---------------------------------------";  
  
  fs.writeFile('/home/mindmakers/school.info', escolainfoatualizada, function(err,data) 
        {
          if (err)
              console.log(err);
          else {
          
            console.log('Ativação de Desktop: registrou atalho de login simplificado e infs da escola');
            console.log('');
            console.log(escolainfoatualizada);
          }
        }
        );
        
}
