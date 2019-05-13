#!/bin/bash

data=$(date +%d%b%Y-%T)

Exec= raspistill -t 5000 -o  /home/pi/Desktop/imagem.jpg -w 500 -h 300
