#!/bin/bash

resposta=$1

if [ -n "$resposta" ]
then
	tempo=$resposta
else
	tempo=60
fi

sleep $tempo
#sudo lxterminal -e screen -X kill  #não está funcionando direito.
sudo pkill screen

$SHELL
