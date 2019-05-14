#!/bin/bash


sair(){
  echo "Finalizando programa"
  return 0
}
pergunta(){
  echo -n "Pressione enter para continuar"
  local SURE
  read SURE
  resposta=$SURE
}

echo "O programa irá coletar dados do micro:bit por 1 minuto."
echo ""
echo "E, após este tempo, irá gravar o arquivo "
echo ""
echo "screenlog.0 no ~/Desktop com os valores coletados"

pergunta;
if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
  sudo bash /home/mindmakers/programs/shells/microbit-serial-kill.sh &
  rm -f ~/Desktop/screenlog.0
  cd ~/Desktop
  screen -L screenlog.0 /dev/ttyACM0 115200
else
  sair;
fi

$SHELL
