#!/bin/bash

if [ -e /home/pi/Desktop/screenlog.0 ]
then
sed -i -r -e 's/([0-9]+)\s+?,?\s+?([0-9]+)\s+?/\1,\2,/' /home/pi/Desktop/screenlog.0

sudo gnuplot -e "cd '/home/mindmakers/programs/shells/';load 'script-grafico.dat';exit"

else
echo "Arquivo screenlog.0 não encontrado"
echo "Saindo do programa"
echo ""
sleep 5

fi
