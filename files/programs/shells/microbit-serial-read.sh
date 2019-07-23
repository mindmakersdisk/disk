#!/bin/bash

sair(){
  echo ""
  echo "Finalizando programa"
  sleep 5
  return 0
}
pergunta(){
  echo -n "Por quantos segundos os dados devem ser capturados? (Padrão: 30) "
  local SURE
  read SURE
  resposta=$SURE
}

echo "********************************************************************************"
echo "*                  O programa irá coletar dados do micro:bit.                  *"
echo "*                                                                              *"
echo "* Que devem estar em formato:                                                  *"
echo "* tempo1,luminosidade1                                                         *"
echo "* tempo2,luminosidade2                                                         *"
echo "* ...                                                                          *"
echo "*                                                                              *"
echo "*   O arquivo screenlog.0 será gravado no ~/Desktop com os valores coletados.  *"
echo "********************************************************************************"

pergunta;

if [ -e /dev/ttyACM0 ]
then

  sudo bash /home/mindmakers/programs/shells/microbit-serial-kill.sh $resposta &
  rm -f ~/Desktop/screenlog.0
  cd ~/Desktop
  screen -L -Logfile screenlog.0 /dev/ttyACM0 115200

  sleep 5

else

  echo ""
  echo ""
  echo "Microbit não conectado ao computador ou não configurado corretamente"
  sair;

fi
