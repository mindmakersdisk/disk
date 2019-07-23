#!/bin/bash

raspip=$(hostname -I | awk -F'.' '{print $1,$2}' OFS='.')

pergunta(){
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
caminho=/home/pi/Pictures

if [ "$(sudo vcgencmd get_camera | sed 's/supported=1 detected=//')" = '1' ]
then

  raspistill -t 7000 -o  $caminho/$data.jpg -w 500 -h 300
  echo $caminho/$data.jpg 2>&1

else

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
       if [ -e /tmp/ipwebcam.txt ] && [ $(cat /tmp/ipwebcam.txt | wc -m ) -gt 1 ]
       then
         export resposta=`cat /tmp/ipwebcam.txt`
       else
         pergunta;
       fi
    fi
  fi
  echo ""
  echo "Buscando o arquivo de foto em: "
  echo $resposta | sudo tee /tmp/ipwebcam.txt
  #echo $resposta > /tmp/ipwebcam.txt

  if [ -n "$resposta" ]
  then
    #sudo wget -q --show-progress --progress=dot:mega -O /tmp/$data.jpg "$resposta/photoaf.jpg"
    sudo wget -q --show-progress -O /tmp/$data.jpg "$resposta/photoaf.jpg" 

    if [ -s /tmp/$data.jpg ]
    then

    convert -quiet "/tmp/$data.jpg" -resize 720x480 "$caminho/$data.jpg" > /dev/null
    echo ""
    echo "Arquivo salvo em: "
    echo $caminho/$data.jpg 2>&1
    sleep 5

    else
    
      echo "Erro ao fazer download da foto."
      echo "Favor tentar novamente, caso o erro persista Reinicie o Raspberry e tente novamente."
      
    fi

  else
    echo "Nenhum caminho informado, tente novamente informando um IP válido!"
    run;
  fi

fi
