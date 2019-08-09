#!/bin/bash

executa(){
	sudo nodejs /home/mindmakers/programs/mmmicrobit.js
}

pergunta(){
	echo -n "Informe '1' para copiar o firmware que permite acessar o microbit por bluetooth. Ou '2' para continuar sem copiar."
	echo ""
	#local SURE
	#read SURE
	#resposta=$SURE
	select SURE in "Sim" "Não"; do
	    case $yn in
	        Sim|Não ) resposta=$SURE; break;;
	        #Não ) echo "no"; break;;
	    esac
	done
}

pergunta2(){
	echo -n "Se você viu uma 'carinha sorrindo' no mostrador, a calibragem foi efetuada com sucesso. Deseja utilizar o microbit? Recomece a rotina se houve problema."
	echo ""
	#local SURE
	#read SURE
	#resposta=$SURE
	select SURE in "Sim" "Não"; do
	    case $yn in
	        Sim|Não ) resposta=$SURE; break;;
	        #Não ) echo "no"; break;;
	    esac
	done
}

sair(){
	echo "Finalizando programa"
	return 0
}

if [ -d /media/pi/MICROBIT ]
then
	echo "Foi detectado que o microbit está conectado via cabo. Entrando em opção de cópia de firmware..."
	pergunta;
	if [ "$resposta" = "Sim" ]; then
		echo "Copiando..."
		sudo cp /home/mindmakers/programs/node_modules/bbc-microbit/firmware/node-bbc-microbit-v0.1.0.hex /media/pi/MICROBIT
		sleep 10;
		echo "Movimente o microbit para calibrá-lo, até desenhar um círculo em seu mostrador."

		pergunta2;
		if [ "$resposta" = "Sim" ]; then
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
