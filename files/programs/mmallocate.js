/*
  Alocação de Imagem de Disco para Escola
   
  1. Obter o código da escola disponível para colar, obtido da Mind Makers através do suporte@mindmakers.cc ou SAC
  2. Abrir o terminal mudar o diretório corrente com 'cd /home/mindmakers/programs'
  3. Executar a alocação com "sudo node mmallocate.js". 

  Paulo Alvim 03/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request')  
var inquirer = require('inquirer');
var fs = require('fs');

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
       
          idescola_informado=answers.idescola.toLowerCase();
          
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
                   console.log('Erro ao recuperar logo: '+body.err);
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
  
  escolainfoatualizada = "----- Identificação de Desktop Mind Makers ------\n" +
                         "Cód.: "+escolaid+"\n"+
                         "Nome: "+escolanome+"\n"+
                         "Pi: Não registrado\n"+
                         "SD: Não registrado\n"+
                         "Sphero: Não registrado\n"+
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
            console.log(escolainfoatualizada);
            // Encerra com sucesso
            process.exit();
          
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

