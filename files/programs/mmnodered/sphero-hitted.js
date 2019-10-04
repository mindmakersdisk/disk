module.exports = function(RED) {


  const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

  console.log('##### mind-makers nodered-sphero-hitted instalado');

  ipc.config.id = 'nodered-sphero-hitted';
  ipc.config.retry = 1500;
  ipc.config.maxRetries = 10;
  ipc.config.silent = true;

  var momentoUltimaBatida = 0;

  function SpheroHittedInput(config) {

    RED.nodes.createNode(this, config);
    var node = this;
    node.status({
      fill: "red",
      shape: "ring",
      text: "desconectado"
    });
    ipc.log('##### mind-makers nodered-sphero-hitted configurado');

    ipc.connectToNet(
      'sphero',
      function() {

        ipc.of.sphero.on(
          'connect',
          function() {
            ipc.log('## Conectado a sphero ##', ipc.config.delay);
            node.status({
              fill: "green",
              shape: "dot",
              text: "conectado"
            });
          }
        );

        ipc.of.sphero.on(
          'disconnect',
          function() {
            node.status({
              fill: "red",
              shape: "ring",
              text: "desconectado"
            });
            ipc.log('## Desconectado de sphero');
          }
        );

        ipc.of.sphero.on(
          'sphero.desconectado',
          function() {
            ipc.log('## sphero desconectado');
            node.status({
              fill: "red",
              shape: "ring",
              text: "desconectado"
            });
          }
        );

        ipc.of.sphero.on(
          'sphero.conectado',
          function() {
            ipc.log('## sphero conectado');
            node.status({
              fill: "green",
              shape: "dot",
              text: "conectado"
            });
          }
        );


        function passouPeriodoMinimo(momentoBatidaAtual, momentoUltimaBatida) {

          var timeDiff = momentoBatidaAtual - momentoUltimaBatida;

          const INTERVALO_SEGS = 1;

          timeDiff /= 1000;

          return Math.round(timeDiff % 60) >= INTERVALO_SEGS;

        }


        ipc.of.sphero.on(
          'sphero.hitted',
          function(data) {
            ipc.log('Recebeu uma mensagem de sphero : ', data.message);
            node.status({
              fill: "green",
              shape: "dot",
              text: "conectado"
            });

            // evita enviar múltiplas colisõ em 1 seg

            var momentoBatidaAtual = new Date();

            if (passouPeriodoMinimo(momentoBatidaAtual, momentoUltimaBatida)) {

              // Apenas repassa
              var msg = {
                payload: data.message
              };
              node.send(msg);

              momentoUltimaBatida = momentoBatidaAtual;

            }
          }
        );

        ipc.of.sphero.on(
          'kill.connection',
          function(data) {
            ipc.log('sphero requisitou kill.connection');
            ipc.disconnect('sphero');
          }
        );

      });


  }




  RED.nodes.registerType("sphero-hitted", SpheroHittedInput);
}
