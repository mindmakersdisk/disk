#!/bin/bash

data=$(date +%d%b%Y-%T)

Exec= raspistill -t 7000 -o  /home/pi/Desktop/imagem-teste.jpg -w 480 -h 480
