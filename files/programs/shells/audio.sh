#!/bin/bash

pergunta(){
  echo -n "Qual o IP do smartphone, mostrado no aplicativo IpWebcam? (Ex.: 192.168.100.40:8080) "
  echo ""

  while :; do
     local SURE
     read SURE
     if [[ $SURE =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\:8080$ ]];
     then
       resposta=$SURE && break
     else
       echo "Endereço IP inválido, favor verificar se o endereço digitato tem o formato exemplificado"
       echo "Ex.: 192.168.100.40:8080"
       echo ""
       echo -n ""
     fi

  done
}

run(){
  echo "Finalizando programa"
  return 1
}

data=$(date +%d%b%Y-%T)
caminho=/home/pi/Music

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
    sudo -u pi cvlc "http://$resposta/audio.wav" --sout "file/wav:$caminho/$data.wav"

    #sleep 3
    #cvlc://quit
    echo $caminho/$data.wav 2>&1
  else
    echo "Nenhum caminho informado, tente novamente informando um IP válido!"
    run;
  fi
