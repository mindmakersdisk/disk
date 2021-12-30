#!/bin/bash
sudo fuser -k 80/tcp

echo "********************************************************************************"
echo "*                                                                              *"
echo "*                 Serviço de registro do Sphero BOLT!                          *"
echo "*                                                                              *"
echo "********************************************************************************"

sudo nodejs /home/mindmakers/programs/mmsphero-server-bolt.js

sudo fuser -k 80/tcp

$SHELL
