#!/bin/bash

raspistill -t 5000 -o  /home/pi/Desktop/imagem.jpg -w 500 -h 300

sudo python /home/mindmakers/programs/ML4K.py
