#!/bin/bash

sair(){
  echo "Finalizando programa"
  return 0
}
pergunta(){
  echo -n "Por quantos segundos os dados devem ser capturados? (Padrão: 30) "
  local SURE
  read SURE
  resposta=$SURE
}

echo "O programa irá coletar dados do micro:bit."
echo ""
echo "Que devem estar em formato [tempo, luminosidade] "
echo ""
echo "O arquivo screenlog.0 será gravado no ~/Desktop com os valores coletados."
echo ""
pergunta;

sudo bash /home/mindmakers/programs/shells/microbit-serial-kill.sh $resposta &
rm -f ~/Desktop/screenlog.0
cd ~/Desktop
screen -L -Logfile screenlog.0 /dev/ttyACM0 115200

sleep 5
