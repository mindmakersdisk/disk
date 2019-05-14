#!/bin/bash

sair(){
  echo "Finalizando programa"
  return 0
}

pergunta(){
  echo -n "deseja continuar? [sim|não] "
  local SURE
  read SURE
  resposta=$SURE
}

executa(){
	sudo nodejs /home/mindmakers/programs/mmmicrobit.js
}

if [ -d /media/pi/MICROBIT ]
then
  echo "Exite microbit conectado, copiando arquivo necessário para conexão para o microbit,"
  pergunta;
  if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
    echo "Copiando."
    sudo cp /home/mindmakers/programs/node_modules/bbc-microbit/firmware/node-bbc-microbit-v0.1.0.hex /media/pi/MICROBIT
    echo "Tentando conectar ao microbit,"
    sleep 5;
    pergunta;
    if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
    executa;
    else
    sair;
    fi
  else
    echo "Não vai copiar, tentando conectar"
    pergunta;
    if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
    executa;
    else
    sair;
    fi
  fi
  
else
  echo "Não exite microbit conectado, tentando conectar ao microbit,"
  pergunta;
  if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
    executa;
  else
    echo "Não vai conectar"
    sair;
  fi
  
fi

$SHELL
