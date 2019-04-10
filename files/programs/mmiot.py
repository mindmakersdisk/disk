#!/usr/bin/python
# -*- coding: utf-8 -*-
###
 # Copyright 2017, Google, Inc.
 # Licensed under the Apache License, Version 2.0 (the `License`);
 # you may not use this file except in compliance with the License.
 # You may obtain a copy of the License at
 # 
 #    http://www.apache.org/licenses/LICENSE-2.0
 # 
 # Unless required by applicable law or agreed to in writing, software
 # distributed under the License is distributed on an `AS IS` BASIS,
 # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 # See the License for the specific language governing permissions and
 # limitations under the License.
### 

#from sense_hat import SenseHat
import datetime
import time
import jwt
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO     # Importing the GPIO library to use the GPIO pins of Raspberry pi
from subprocess import call # Importa facilidade do SO

# IDENTIFICA ESSE ATIVO
# em especial a escola, sala e estacao
f = open("/home/mindmakers/school.info","r")

escolaid='Ainda não alocado'
escolanome='Ainda não alocado'
pi='Ainda não ativado'
sd='Ainda não ativado'
sphero='Sem Sphero associado'

f.readline()
escolaid=f.readline()[6:-3].strip()
escolanome=f.readline()[6:-3].strip()
pi=f.readline()[3:-3].strip()
sd=f.readline()[3:-3].strip()
sphero=f.readline()[8:-3].strip()
sala=f.readline()[6:-3].strip()
estacao=f.readline()[10:-3].strip()

# TODO Abortar se não estiver ativado

# TODO Analisar se podemos reusar, inclusive o certificado.
ssl_private_key_filepath = '/home/mindmakers/programs/mm_private.pem'
ssl_algorithm = 'RS256' 
root_cert_filepath = '/home/mindmakers/programs/roots.pem'
project_id = 'mind-makers'
gcp_location = 'us-central1'
registry_id = 'mm'+escolaid
device_id = 'pi'+pi

# end of user-variables

cur_time = datetime.datetime.utcnow()

def create_jwt():
  token = {
      'iat': cur_time,
      'exp': cur_time + datetime.timedelta(minutes=60),
      'aud': project_id
  }

  with open(ssl_private_key_filepath, 'r') as f:
    private_key = f.read()

  return jwt.encode(token, private_key, ssl_algorithm)

_CLIENT_ID = 'projects/{}/locations/{}/registries/{}/devices/{}'.format(project_id, gcp_location, registry_id, device_id)

# topico padrão para receber comandos!
_MQTT_COMMANDS_TOPIC = '/devices/{}/commands/#'.format(device_id)

_MQTT_CONFIG_TOPIC = '/devices/{}/config'.format(device_id)


client = mqtt.Client(client_id=_CLIENT_ID)
# authorization is handled purely with JWT, no user/pass, so username can be whatever
client.username_pw_set(
    username='unused',
    password=create_jwt())

def error_str(rc):
    return '{}: {}'.format(rc, mqtt.error_string(rc))

def on_connect(unusued_client, unused_userdata, unused_flags, rc):
    print('Ao conectar', error_str(rc))

def on_publish(unused_client, unused_userdata, unused_mid):
    print('Publicou com sucesso')
    
now = datetime.datetime.now() # Getting date and time

def sendInfo():
    print('entrou')
    payload = '{{ "ts": {}, "escola": {}, "sala": {}, "estacao": {} }}'.format( (str(now.day) + str("/") + str(now.month) + str("/") + str(now.year)+
                                       str(" ") + str(now.hour) + str(":") + str(now.minute) + str(":") + str(now.second)), escolanome, sala, estacao )
    client.publish(_MQTT_CONFIG_TOPIC, payload, qos=1)
    print("{}\n".format(payload))
    time.sleep(1)    

# Recebe mensagens
# Method which handles parsing the text message coming back from the Cloud
# This is where you could add your own messages to play with different
# actions based on messages coming back from the Cloud
def respondToMsg(msg):
    print(msg)
    if msg == "oi":
        sendInfo()
    elif msg == "off":
       call("sudo nohup shutdown -h now",shell=True)
    elif msg == "monitoroff":
         call("sudo vcgencmd display_power 0",shell=True)
    elif msg == "monitoron":
       call("sudo vcgencmd display_power 1",shell=True) 
    elif msg == "temp":
        print(msg)
    else:
        print(msg)

def on_message(unused_client, unused_userdata, message):
    payload = str(message.payload)
    print('Recebeu mensagem \'{}\' on topic \'{}\''.format(payload, message.topic))
    respondToMsg(payload)

client.on_connect = on_connect
client.on_publish = on_publish
client.on_message = on_message

client.tls_set(ca_certs=root_cert_filepath) # Replace this with 3rd party cert if that was used when creating registry
client.connect('mqtt.googleapis.com', 8883)
client.subscribe(_MQTT_COMMANDS_TOPIC, qos=1)
client.loop_start()

# Could set this granularity to whatever we want based on device, monitoring needs, etc



#red_led_pin = 21                # Initializing GPIO 21 for red led
#green_led_pin = 20                # Initializing GPIO 20 for green led

#GPIO.setmode(GPIO.BCM)      # Use Board pin numbering
#GPIO.setup(red_led_pin, GPIO.OUT) # Declaring the GPIO 21 as output pin
#GPIO.setup(green_led_pin, GPIO.OUT) # Declaring the GPIO 20 as output pin


#sendInfo()

time.sleep(999)

client.loop_stop()
