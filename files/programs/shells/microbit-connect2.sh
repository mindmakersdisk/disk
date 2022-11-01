#!/bin/bash

executa(){
	sudo nodejs /home/mindmakers/programs/mmmicrobit.js
}

pergunta(){
	echo -n "Informe 'sim' para copiar o firmware que permite acessar o microbit por bluetooth. Ou enter para continuar sem copiar."
	echo ""
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
	if [ "$resposta" = "sim" ] || [ "$resposta" = "s" ] || [ "$resposta" = "yes" ] || [ "$resposta" = "y" ] || [ "$resposta" = "SIM" ] || [ "$resposta" = "S" ]; then
		echo "Copiando..."
		sudo cp /home/mindmakers/programs/ble-open-microbit-universal.hex /media/pi/MICROBIT
		sleep 10;
		
		executa;

	else

		executa;

	fi

else
	executa;

fi

$SHELL
