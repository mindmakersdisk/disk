module.exports = function(RED) {

  const ipc = require('/home/mindmakers/programs/node_modules/node-ipc');

  console.log('##### mind-makers nodered-prog-sphero instalado');

  ipc.config.id = 'nodered-progr-sphero';
  ipc.config.retry = 1500;
  ipc.config.maxRetries = 10;
  ipc.config.silent = false;

  function SpheroProgramOutput(config) {

    RED.nodes.createNode(this, config);
    var node = this;

    node.status({
      fill: "red",
      shape: "ring",
      text: "desconectado"
    });

    console.log(config);

    node.on('editsave', function() {

      //console.log('entrou aqui com '+ config.func);

    });


    ipc.log('##### mind-makers nodered-program-sphero configurado');

    ipc.connectToNet(
      'sphero',
      function() {
        ipc.of.sphero.on(
          'connect',
          function() {
            ipc.log('## sphero conectado##', ipc.config.delay);
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
        ipc.of.sphero.on(
          'kill.connection',
          function(data) {
            ipc.log('sphero  requested kill.connection');
            ipc.disconnect('sphero');
          }
        );
      }
    );



    node.on('input', function(msg) {

      console.log('nodered-prog-sphero entrou input', msg);
      console.log(config.func);

      node.status({
        fill: "green",
        shape: "dot",
        text: "conectado"
      });

      ipc.of.sphero.emit(
        'program.sphero.message', {
          id: ipc.config.id,
          message: config.func
        }
      );

    });

    node.on('start', function() {

      console.log('nodered-prog-sphero entrou start');

    });

  }


  RED.nodes.registerType("prog-sphero", SpheroProgramOutput);



}
