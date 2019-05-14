#!/bin/bash

executa(){
	sudo nodejs /home/mindmakers/programs/mmmicrobit.js
}

pergunta(){
	echo -n "Deseja continuar? [sim|não] "
	local SURE
	read SURE
	resposta=$SURE
}

sair(){
	echo "Finalizando programa"
	return 0
}

if [ -d /media/pi/MICROBIT ]
then
	echo "Há microbit conectado... copiando arquivo necessário para conexão para o microbit..."
	pergunta;
	if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
		echo "Copiando."
		sudo cp /home/mindmakers/programs/node_modules/bbc-microbit/firmware/node-bbc-microbit-v0.1.0.hex /media/pi/MICROBIT
		sleep 10;
		echo "Tentando conectar ao microbit..."

		pergunta;
		if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
			executa;
		else
			sair;
		fi
	else
		echo "Tentando conectar ao microbit via BLE... "

		pergunta;
		if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "" ]; then
			executa;
		else
			sair;
		fi
	fi

else
	executa;

fi

$SHELL
