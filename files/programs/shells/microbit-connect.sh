#!/bin/bash

executa(){
	sudo nodejs /home/mindmakers/programs/mmmicrobit.js
}

pergunta(){
	echo -n "Informe 'sim' para copiar o firmware que permite acessar o microbit por bluetooth. Ou enter para continuar sem copiar."
	local SURE
	read SURE
	resposta=$SURE
}

pergunta2(){
	echo -n "Se você viu uma 'carinha sorrindo' no mostrador, a calibragem foi efetuada com sucesso. Deseja utilizar o microbit? Recomece a rotina se houve problema."
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
	echo "Foi detectado que o microbit está conectado via cabo. Entrando em opção de cópia de firmware..."
	pergunta;
	if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || ["$resposta" = "SIM" ] || [ "$resposta" = "S" ]; then
		echo "Copiando..."
		sudo cp /home/mindmakers/programs/node_modules/bbc-microbit/firmware/node-bbc-microbit-v0.1.0.hex /media/pi/MICROBIT
		sleep 10;
		echo "Movimente o microbit para calibrá-lo, até desenhar um círculo em seu mostrador."
		
		pergunta2;
		if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || ["$resposta" = "SIM" ] || [ "$resposta" = "S" ]; then
			executa;
		else
			sair;
		fi

	else

		executa;

	fi

else
	executa;

fi
