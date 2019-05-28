#!/bin/bash

pergunta(){
  echo -n "Qual o ip do smartphone? (ex.: 192.168.100.40:8080) "
  echo ""
  local SURE
  read SURE
  resposta=$SURE
}
run(){
  echo "Finalizando programa"
  return 1
}

data=$(date +%d%b%Y-%T)
caminho=/home/pi/Pictures

if [ "$(sudo vcgencmd get_camera | sed 's/supported=1 detected=//')" = '1' ]
then

  raspistill -t 7000 -o  $caminho/$data.jpg -w 500 -h 300
  echo $caminho/$data.jpg 2>&1

else

  if [ "$(adb shell ip addr show wlan0 | grep "inet\s" | awk '{print $2}' | awk -F'/' '{print $1}' | wc -l )" = 1 ]
  then
    #se existir adb conectado pega o ip dele.
    resposta=$(adb shell ip addr show wlan0 | grep "inet\s" | awk '{print $2}' | awk -F'/' '{print $1}')
    resposta="$resposta:8080"
  else
    #caso não tenha adb conectado, pede pro usuário.
    # pega primeiro argumento (se existir e passa como resposta)
    ip=$1

    if [ -n "$ip" ]
    then
      resposta=$ip
    else
       if [ -e /tmp/ipwebcam.txt ] && [ $(cat /tmp/ipwebcam.txt | wc -m ) -gt 1 ]
       then
         export resposta=`cat /tmp/ipwebcam.txt`
       else
         pergunta;
       fi 
    fi
  fi
  
  echo $resposta > /tmp/ipwebcam.txt
  
  if [ -n "$resposta" ]
  then
    sudo wget -O /tmp/$data.jpg "$resposta/photoaf.jpg"
    convert "/tmp/$data.jpg" -resize 720x480 "$caminho/$data.jpg"
    echo $caminho/$data.jpg 2>&1
  else
    echo "Nenhum caminho informado, tente novamente informando um Ip válido!"
    run;
  fi

fi
