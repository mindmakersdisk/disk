/* Módulo Node.js para criar IoT Registry e Device no GCloud automaticamente,
 * em tempo de alocação e ativação, respectivamente. */

const serviceJSON = "/home/mindmakers/programs/mmiotsrv.json";
const rsaCertificateFile = "/home/mindmakers/programs/mmiotdev.pem";

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"

/**************************************************************************************************
 *                                      CRIA REGISTRY                                              *
 * ***********************************************************************************************/

const {
  google
} = require('googleapis');
var fs = require('fs');
const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

const cloudRegion = 'us-central1';
const projectId = 'mind-makers';
const pubsubTopicId = 'gcr.io.%2Fmind-makers';

//function errCb = lookupRegistry; // Lookup registry if already exists.
const parentName = `projects/${projectId}/locations/${cloudRegion}`;
const pubsubTopic = `projects/${projectId}/topics/${pubsubTopicId}`;

function getClient(serviceAccountJson, cb) {
  // the getClient method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
  // environment variables if serviceAccountJson is not passed in

  google.auth.getClient({
      keyFilename: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    .then(authClient => {
      const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

      google.options({
        auth: authClient,
      });

      google.discoverAPI(discoveryUrl).then(client => {

          cb(client);
        })
        .catch(err => {
          console.log('Error during API discovery.', err);
        });
    });

}

exports.criaIoTRegistry = function(codEscola) {

  var registryId = "mm" + codEscola;

  var requisicao = {
    parent: parentName,
    resource: {
      eventNotificationConfigs: [{
        pubsubTopicName: pubsubTopic,
      }, ],
      id: registryId,
    },
  };


  // Client retrieved in callback
  getClient(serviceJSON, function(client) {

    client.projects.locations.registries.create(requisicao, (err, res) => {
      if (err) {
        if (err.code === 409) {
          // Já existe
          //console.log("Registro IoT já existe");
        } else {
          console.log('Não pode criar registro IoT');
          console.log(err);
        }
      } else {
        console.log('----- Criou registro IoT com sucesso! -----');
        // console.log(res.data);
      }
      process.exit();
    });

  });


}

/**************************************************************************************************
 *                                      CRIA DEVICES                                              *
 * ***********************************************************************************************/

exports.criaIoTDevice = function(codEscola, pi, salaId, estacaoId) {

  var registryId = "mm" + codEscola;
  var registryName = `${parentName}/registries/${registryId}`;
  var deviceId = "pi" + pi;
  var salaStr = salaId + ""
  var estacaoStr = estacaoId + ""

  var body = {
    id: deviceId,
    credentials: [{
      publicKey: {
        format: 'RSA_X509_PEM',
        key: fs.readFileSync(rsaCertificateFile).toString(),
      },
    }, ],
    metadata: {
      sala: salaStr,
      estacao: estacaoStr
    }
  };

  var requisicao = {
    parent: registryName,
    resource: body,
  };

  // Client retrieved in callback
  getClient(serviceJSON, function(client) {

    client.projects.locations.registries.devices.create(requisicao, (err, res) => {
      if (err && err.code === 409) {
        // Já existe então somente atualiza metadados

        client.projects.locations.registries.devices.patch(requisicao, (err, res) => {
          if (err) {
            console.log(FgRed, '---- Erro ao tentar atualizar dispositivo IoT para:', deviceId);
            console.log(FgRed, '---- Tente novamente ou informe ao suporte da Mind Makers ----');
            console.log(err);
          } else {
            console.log('---- Dispositivo IoT Atualizado com Sucesso! ----');
            //console.log(res.data);
          }
        });


      } else if (err) {
        console.log('');
        console.log(FgRed, '---- Não foi possível criar ou atualizar dispositivo IoT  ----');
        console.log(FgRed, '---- Tente novamente ou informe ao suporte da Mind Makers ----');
        console.log(err);
      } else {
        console.log(Reset, '---- Dispositivo IoT Criado com Sucesso! ----');
        // console.log(res.data);
      }
      // Encerra
      process.exit();
    });

  });

}
