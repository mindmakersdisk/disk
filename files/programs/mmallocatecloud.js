/* Módulo Node.js para criar IoT Registry e Device no GCloud automaticamente, 
 * em tempo de alocação e ativação, respectivamente. */
 
var serviceJSON = "/home/mindmakers/programs/mmiotsrv.json";

/**************************************************************************************************
 *                                      CRIA REGISTRY                                              *
 * ***********************************************************************************************/ 

const {google} = require('googleapis');
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

  console.log('Entrou para cadastrar escola como Registry no GCloud, se não existir com cód. '+codEscola);
  var registryId="mm"+codEscola;
  
  
  var requisicao={
      parent: parentName,
      resource: {
        eventNotificationConfigs: [
          {
            pubsubTopicName: pubsubTopic,
          },
        ],
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

exports.criaIoTDevice = function(codEscola,pi,sala,estacao) {
	
  console.log('Entrou para cadastrar estação como Device de um Registry no GCloud, se não existir, '+
				'ou realocar se mudou de escola. Cód. escola: '+codEscola+' pi:'+pi);	
	
}


// Client retrieved in callback
// getClient(serviceAccountJson, function(client) {...});
// const cloudRegion = 'us-central1';
// const deviceId = 'my-rsa-device';
// const projectId = 'adjective-noun-123';
// const registryId = 'my-registry';
//const parentName = `projects/${projectId}/locations/${cloudRegion}`;
//const registryName = `${parentName}/registries/${registryId}`;
/*
const body = {
  id: deviceId,
  credentials: [
    {
      publicKey: {
        format: 'RSA_X509_PEM',
        key: fs.readFileSync(rsaCertificateFile).toString(),
      },
    },
  ],
};

const request = {
  parent: registryName,
  resource: body,
};

console.log(JSON.stringify(request));

client.projects.locations.registries.devices.create(request, (err, res) => {
  if (err) {
    console.log('Could not create device');
    console.log(err);
  } else {
    console.log('Created device');
    console.log(res.data);
  }
});
*/

