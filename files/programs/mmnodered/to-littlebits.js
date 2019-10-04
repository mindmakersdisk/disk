module.exports = function(RED) {

  const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

  console.log('##### mind-makers nodered-to-littlebits instalado');

  ipc.config.id = 'nodered-to-littlebits';
  ipc.config.retry = 1500;
  ipc.config.maxRetries = 10;
  ipc.config.silent = true;

  function LittleBitsBLEOutput(config) {

    RED.nodes.createNode(this, config);
    var node = this;

    node.status({
      fill: "red",
      shape: "ring",
      text: "desconectado"
    });

    ipc.log('##### mind-makers nodered-to-littlebits configurado');


    ipc.connectToNet(
      'littlebits',
      function() {
        ipc.of.littlebits.on(
          'connect',
          function() {
            ipc.log('## littlebits conectado##', ipc.config.delay);
            node.status({
              fill: "green",
              shape: "dot",
              text: "conectado"
            });
          }
        );
        ipc.of.littlebits.on(
          'disconnect',
          function() {
            ipc.log('## littlebits desconectado');
            node.status({
              fill: "red",
              shape: "ring",
              text: "desconectado"
            });
          }
        );


        ipc.of.littlebits.on(
          'littlebits.conectado',
          function() {
            ipc.log('## littlebits conectado');
            node.status({
              fill: "green",
              shape: "dot",
              text: "conectado"
            });
          }
        );

        ipc.of.littlebits.on(
          'littlebits.desconectado',
          function() {
            ipc.log('## littlebits desconectado');
            node.status({
              fill: "red",
              shape: "ring",
              text: "desconectado"
            });
          }
        );

        ipc.of.littlebits.on(
          'error.message',
          function(data) {
            console.log('Erro: ', data.message);
            node.status({
              fill: "red",
              shape: "ring",
              text: "desconectado"
            });
          }
        );
        ipc.of.littlebits.on(
          'kill.connection',
          function(data) {
            ipc.log('littlebits requested kill.connection');
            ipc.disconnect('littlebits');
          }
        );
      }
    );



    node.on('input', function(msg) {

      // console.log('nodered-to-littlebits entrou input',msg);

      node.status({
        fill: "green",
        shape: "dot",
        text: "conectado"
      });

      ipc.of.littlebits.emit(
        'to.message', {
          id: ipc.config.id,
          message: msg.payload
        }
      );

    });

  }

  RED.nodes.registerType("to-littlebits", LittleBitsBLEOutput);

}
