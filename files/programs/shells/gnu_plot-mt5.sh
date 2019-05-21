#!/bin/bash

if [ "$(sudo cat screenlog.0 | grep -c ',')" -gt 0 ]
then
	sudo sed -i -e 's/set datafile separator " "/set datafile separator ","/g' /home/mindmakers/programs/shells/script-grafico.dat
else
	sudo sed -i -e 's/set datafile separator ","/set datafile separator " "/g' /home/mindmakers/programs/shells/script-grafico.dat
fi

sudo gnuplot -e "cd '/home/mindmakers/programs/shells/';load 'script-grafico.dat';exit"
