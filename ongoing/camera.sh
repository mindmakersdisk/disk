#!/bin/bash

data=$(date +%d%b%Y-%T)

Exec= raspistill -t 10000 -o  /home/pi/Desktop/Fotos/$data.png -w 640 -h 480
