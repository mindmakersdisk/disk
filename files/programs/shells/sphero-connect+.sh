#!/bin/bash
sudo fuser -k 80/tcp

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

sudo node /home/mindmakers/programs/mmsphero-server.js F2:98:D7:D9:16:08  


sudo fuser -k 80/tcp
