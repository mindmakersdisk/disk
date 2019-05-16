#!/bin/bash

data=$(date +%d%b%Y-%T)
caminho=/home/pi/Pictures

echo $caminho/$data.jpg 2>&1

Exec= raspistill -t 7000 -o  $caminho/$data.jpg -w 500 -h 300
