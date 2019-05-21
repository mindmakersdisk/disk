#!/usr/bin/env node

const request = require('request');  
var fs = require('fs');


var key = "ea725de0-5b91-11e9-b242-711be4dcc8c1d059df47-e87a-417c-81a8-cc5f5beb752b";
var locationImg = "/home/pi/Desktop/imagem.jpg";

// Gets the contents of an image file to be sent to the
// machine learning model for classifying
function getImageFileData(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    //console.log('bitmap',bitmap);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// This function will pass your image to the machine learning model
// and return the top result with the highest confidence
function classify(imagefile){
	
    var URL_BASE = "https://machinelearningforkids.co.uk/api/scratch/";
    
			var jsonMsg = {"data" : getImageFileData(imagefile)};
                              
            //console.log('entrou para enviar msg',jsonMsg);
            
            request({url: URL_BASE+key+'/classify',
                    method: 'POST',
                      json: {"data" : getImageFileData(imagefile)}},    
                    function(error, response, body){ 
            //             console.log(body);             
                        if (error) {
                           console.log('Erro ao enviar comando - erro: ',error);  
                                                                        
                        } else if (body.error) {
                           console.log('Erro ao enviar comando - corpo do erro: ',body.error);                                             
                        } else {
                              //console.log('body ',body);
                              console.log('Resposta: ',body[0].class_name);
                              console.log('Confiança: ',+body[0].confidence,'%');
                            
                        }
                    }
                );

}

classify(locationImg);
