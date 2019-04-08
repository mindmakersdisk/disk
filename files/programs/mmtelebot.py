#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime  # Importing the datetime library
import telepot   # Importing the telepot library
from telepot.loop import MessageLoop    # Library function to communicate with telegram bot
import RPi.GPIO as GPIO     # Importing the GPIO library to use the GPIO pins of Raspberry pi
from time import sleep      # Importing the time library to provide the delays in program
from subprocess import call # Importa facilidade do SO

escolaid='Ainda não alocado'
escolanome='Ainda não alocado'
pi='Ainda não ativado'
sd='Ainda não ativado'
sphero='Sem Sphero associado'

red_led_pin = 21                # Initializing GPIO 21 for red led
green_led_pin = 20                # Initializing GPIO 20 for green led

GPIO.setmode(GPIO.BCM)      # Use Board pin numbering
GPIO.setup(red_led_pin, GPIO.OUT) # Declaring the GPIO 21 as output pin
GPIO.setup(green_led_pin, GPIO.OUT) # Declaring the GPIO 20 as output pin

now = datetime.datetime.now() # Getting date and time

f = open("/home/mindmakers/school.info","r")

f.readline()
escolaid=f.readline()
escolanome=f.readline()
if len(escolanome) > 5:
    escolanome = escolanome[5:-1]
pi=f.readline()[1:-1]
sd=f.readline()[1:-1]
sphero=f.readline()[1:-1]

computadorid=''
if len(pi) > 5:
    computadorid = pi[4]
    
# Identifica o Serial do PI local
fCPU = open("/proc/cpuinfo","r")
cpuContents = fCPU.read()
serialPosIni = cpuContents.index('Serial')
serialPosIni = cpuContents.index(':',serialPosIni)      
serialPosFim = cpuContents.index('\n',serialPosIni)    
piIdentificado = cpuContents[serialPosIni+1:serialPosFim]

def handle(msg):
    chat_id = msg['chat']['id'] # Receiving the message from telegram
    command = msg['text']   # Getting text from the message

    print ('Received:')
    print(command)

    # Comparing the incoming message to send a reply according to it
    if command == '/oi':
       bot.sendMessage (chat_id, str("Oi! Eu sou o computador "+piIdentificado+" da escola '"+escolanome+"'. Tenho a data/hora: "+ 
                                              str(now.day) + str("/") + str(now.month) + str("/") + str(now.year)+
                                              str(" ") + str(now.hour) + str(":") + str(now.minute) + str(":") + str(now.second)))
    elif command == '/off':
 #   desligar
       call("sudo nohup shutdown -h now",shell=True)
    elif command == '/monitoroff':
 #   desligar monitor
       call("sudo vcgencmd display_power 0",shell=True)
    elif command == '/monitoron':
 #   ligar monitor
       call("sudo vcgencmd display_power 1",shell=True)      
 #   elif command == '/red_1':
       
 #   elif command == '/red_0':
 #       bot.sendMessage(chat_id, str("Red led is OFF"))
 #       GPIO.output(red_led_pin, False)
 #   elif command == '/green_1':
 #       bot.sendMessage(chat_id, str("Green led is ON"))
 #       GPIO.output(green_led_pin, True)
 #   elif command == '/green_0':
 #       bot.sendMessage(chat_id, str("Green led is OFF"))
 #       GPIO.output(green_led_pin, False)

# Insert your telegram token below
bot = telepot.Bot('611887569:AAG2ke6zp4rVo5q3bMP5zm4MlxpHZjBCNG0')
print (bot.getMe())

# Start listening to the telegram bot and whenever a message is  received, the handle function will be called.
MessageLoop(bot, handle).run_as_thread()
print ('Ouvindo....')

while 1:
    sleep(10)
