#!/bin/bash

pergunta(){
	echo -n "Qual o ip do smartphone? (ex.: 192.168.100.44:8080) "
	local SURE
	read SURE
	resposta=$SURE
}

data=$(date +%d%b%Y-%T)
caminho=/home/pi/Pictures


# pega primeiro argumento (se existir e passa como resposta)
ip=$1
if [ -n "$ip" ]
then
	resposta=$ip
else
	pergunta;
fi

if [ -n "$resposta" ]
then
	sudo wget -O $caminho/$data.jpg "$resposta/photoaf.jpg"
	echo $caminho/$data.jpg 2>&1
else
	echo "Nenhum caminho informado, tente novamente informando um Ip válido!"
fi
