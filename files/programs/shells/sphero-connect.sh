#!/bin/bash

echo "********************************************************************************" 
echo "*                                                                              *" 
echo "*                 O seu Sphero será conectado!!!                               *" 
echo "*                                                                              *" 
echo "*               Você NÃO poderá fechar esta janela.                            *" 
echo "*                                                                              *" 
echo "*               Se fechar a janela, o Sphero poderá apresentar                 *" 
echo "*               comportamento indesejado na próxima conexão.                   *" 
echo "*                                                                              *" 
echo "********************************************************************************" 
echo "********************************************************************************" 
echo "*                                                                              *" 
echo "*                    Utilize o Desconecta Sphero                               *" 
echo "*                                                                              *" 
echo "*            para encerrar a conexão ao terminar as atividades ou              *"
echo "*                                                                              *"  
echo "*            em caso de mensagens de erro durante a utilização.                *" 
echo "*                                                                              *" 
echo "*                                                                              *" 
echo "********************************************************************************" 

sleep 5

echo -e 'discoverable on \n exit' | bluetoothctl

sudo modprobe rfcomm
sudo rfcomm bind rfcomm0 CD:09:66:4D:BD:24
# o '&' faz com que o servidor fique em background para que o chromium possa ser executado
sudo nodejs /home/mindmakers/programs/mmsphero-server.js /dev/rfcomm0 

#& chromium-browser http://mindmakers.cc/mmblockly --allow-running-insecure-content
