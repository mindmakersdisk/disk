#!/bin/bash
sudo fuser -k 80/tcp

echo "********************************************************************************"
echo "*                                                                              *"
echo "*                 Serviço de configuração e conexão do Sphero!                 *" 
echo "*                                                                              *"
echo "********************************************************************************"

sudo nodejs /home/mindmakers/programs/mmsphero-server.js

sudo fuser -k 80/tcp
