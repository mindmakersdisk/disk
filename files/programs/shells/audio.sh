#!/bin/bash

raspip=$(hostname -I | awk -F'.' '{print $1,$2}' OFS='.')

pergunta(){
  echo ""
  echo -n "Qual o IP do smartphone, mostrado no aplicativo IpWebcam? (Ex.: 192.168.100.40:8080) "
  echo ""

  while :; do
     local SURE
     read SURE
     sureip=$(echo $SURE | awk -F'.' '{print $1,$2}' OFS='.')

     if [[ $SURE =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\:8080$ ]];
     then
       if [ "$raspip" = "$sureip" ]
       then
         resposta=$SURE && break
       else
         echo "O Smartphone não se encontra na mesma rede(WIFI) do Raspberry, "
         echo "certifique-se que eles estão na mesma rede e digite o ip novamente"
         echo ""
       fi

     else
       echo ""
       echo "Endereço IP inválido, favor verificar se o endereço digitato tem o formato exemplificado"
       echo "Ex.: 192.168.100.40:8080"
       echo ""
       echo -n ""
     fi

  done
}

run(){
  echo "Finalizando programa"
  sleep 5
  return 1
}

data=$(date +%d%b%Y-%T)
caminho=/home/pi/Music

  if [ "$(adb shell ip addr show wlan0 | grep "inet\s" | awk '{print $2}' | awk -F'/' '{print $1}' | wc -l )" = 1 ]
  then
    adbip=$(adb shell ip addr show wlan0 | grep "inet\s" | awk '{print $2}' | awk -F'.' '{print $1,$2}' OFS='.')
    if [ "$raspip" = "$adbip" ]
    then
      #se existir adb conectado pega o ip dele.
      resposta=$(adb shell ip addr show wlan0 | grep "inet\s" | awk '{print $2}' | awk -F'/' '{print $1}')
      resposta="$resposta:8080"
    else
      echo "O Smartphone não se encontra na mesma rede(WIFI) do Raspberry, "
      echo "certifique-se que eles estão na mesma rede e tente novamente"
      echo ""
      run;
    fi

  else
    #caso não tenha adb conectado, pede pro usuário.
    # pega primeiro argumento (se existir e passa como resposta)
    ip=$1

    if [ -n "$ip" ]
    then
      resposta=$ip
    else
       if [ -e /tmp/ipwebcam.txt ] && [ $(sudo cat /tmp/ipwebcam.txt | wc -m ) -gt 1 ]
       then
         export resposta=`sudo cat /tmp/ipwebcam.txt`
       else
         pergunta;
       fi
    fi
  fi
  echo ""
  echo "Tentando acessar dispositivo de áudio em : "
  echo $resposta | sudo tee /tmp/ipwebcam.txt

  if [ -n "$resposta" ]
  then
    sudo -u pi cvlc "http://$resposta/audio.wav" --sout "file/wav:$caminho/$data.wav"

    #sleep 3
    #cvlc://quit
    if [ -s  $caminho/$data.wav ]
    then
      echo $caminho/$data.wav 2>&1
    else
      echo ""
      echo "Erro ao fazer download do arquivo"
      echo "Favor tentar novamente, caso o erro persista Reinicie o Raspberry e tente novamente."
    fi

  else
    echo "Nenhum caminho informado, tente novamente informando um IP válido!"
    run;
  fi
