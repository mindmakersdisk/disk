#!/bin/bash

echo "O programa irá coletar dados do micro:bit por 1 minuto."
echo ""
echo "E, após este tempo, irá gravar o arquivo "
echo ""
echo "screenlog.0 no ~/Desktop com os valores coletados"
sleep 5
sudo bash /home/mindmakers/programs/shells/microbit-serial-kill.sh &
rm -f ~/Desktop/screenlog.0
cd ~/Desktop
screen -L screenlog.0 /dev/ttyACM0 115200

$SHELL
