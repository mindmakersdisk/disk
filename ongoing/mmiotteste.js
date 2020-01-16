/*
 * Testa serviços de automação de sala de aula
  Paulo Alvim 03/2019
  Copyright(c) Mind Makers Editora Educacional Ltda. Todos os direitos reservados
*/

const request = require('request');
var inquirer = require('inquirer');

// Comandos
const DESLIGA = 'off';
const DESLIGA_MONITOR = 'monitoroff';
const LIGA_MONITOR = 'monitoron';
const OBTEM_INFO = 'oi';
const EXIBE_IMAGEM = 'img';
const EXECUTA_URL = 'url';
const COMANDOS_VALIDOS = [OBTEM_INFO,DESLIGA,DESLIGA_MONITOR,LIGA_MONITOR,EXIBE_IMAGEM,EXECUTA_URL];

// Macros
const DEMO1 = 'demo1';
const DEMO2 = 'demo2';
const DEMO3 = 'demo3';
const TESTE = 'teste';
const MACROS_VALIDAS = [DEMO1,DEMO2,DEMO3,TESTE];

var questions = [
  {
    type: 'input',
    name: 'escolaId',
    message: "Digite ou cole o código da escola (solicite à Mind Makers se não possuir):"
  },
  {
    type: 'list',
    name: 'opcao',
    message: "Selecione a opção de teste",
    choices: [DEMO1,DEMO2,DEMO3,TESTE,'Comando para Sala','Comando para Estação','Sair']
  },
  {
    type: 'number',
    name: 'salaId',
    message: "Identifique a sala (no teste, de 1 a 2)",
    default: 1,
    when: function (answers) {
      return answers.opcao!='Sair';
    },
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)>=1 && parseInt(valor)<=2;
    },
  },
  {
    type: 'list',
    name: 'comando',
    message: "Selecione um comando",
    choices: [DESLIGA_MONITOR,LIGA_MONITOR,DESLIGA,EXIBE_IMAGEM,EXECUTA_URL],
    when: function (answers) {
      return answers.opcao=='Comando para Sala' || answers.opcao=='Comando para Estação';
    },
  },
  {
    type: 'input',
    name: 'complemento',
    message: "Informe o nome da imagem sem sufixo ou URL",
    when: function (answers) {
      return answers.comando==EXIBE_IMAGEM || answers.comando==EXECUTA_URL;
    }
  },
  {
    type: 'number',
    name: 'estacaoId',
    message: "Informe o número da estação (no teste, de 1 a 12)",
    default: 1,
    when: function (answers) {
      return answers.opcao=='Comando para Estação';
    },
    validate: function (valor) {
      return Number.isInteger(valor) && parseInt(valor)<=12;
    },
  }
];


inquirer.prompt(questions).then(answers => {

      if (answers.escolaId==null || answers.escolaId=='' || answers.opcao=='Sair')
          return

      var macro;
      var comando;

      if (answers.opcao==DEMO1 || answers.opcao==DEMO2 || answers.opcao==DEMO3 || answers.opcao==TESTE ) {

          testaMacros(answers.escolaId,answers.salaId+'',answers.opcao);

      } else {

          estacaoIdStr =answers.estacaoId
          if (estacaoIdStr != null)
              estacaoIdStr=estacaoIdStr+''

          testaComandos(answers.escolaId,answers.salaId+'',estacaoIdStr,answers.comando,answers.complemento);
      }



});

const URL_BASE='http://localhost/api/Sala';

// Consome serviços Node.js que interagem com MQTT.
function testaMacros(escolaId,salaId,macro) {

  console.log('entrou para executar macro');

    request({url: URL_BASE+'/macro',
            method: 'POST',
              json: {'login':'fulano','senha':'senha1', 'escola':escolaId,'sala':salaId,'macro':macro}},
            function(error, response, body){
                if (error) {
                    console.log('Erro tentar executar macro: '+error);
                } else {
                    console.log('Macro executada com sucesso! ');
                    console.log(body);
                }
            }
        );


}

// Consome serviços Node.js que interagem com MQTT.
function testaComandos(escolaId,salaId,estacaoId,comando,complemento)  {

    console.log('entrou para executar comando');

   request({url: URL_BASE+'/comando',
            method: 'POST',
              json: {'login':'fulano','senha':'senha1', 'escola':escolaId,'sala':salaId,'estacao':estacaoId,'comando':comando,
                'complemento':complemento}},
            function(error, response, body){
                if (error) {
                    console.log('Erro tentar executar macro: '+error);
                } else {
                    console.log('Macro executada com sucesso! ');
                }
            }
        );

}
