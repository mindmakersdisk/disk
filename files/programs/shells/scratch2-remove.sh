#!/bin/bash

# Remove referencias ao Scratch2
# Importante: não remove a pasta raiz (pendencia conhecida)

sudo chattr -i -R /home/mindmakers/Scratch2

sudo rm -rf /home/mindmakers/Scratch2

if [ -e /home/pi/Desktop/scratch2_folder.desktop ]
then
sudo chattr -i -R /home/pi/Desktop/scratch2_folder.desktop
sudo rm /home/pi/Desktop/scratch2_folder.desktop
fi

if [ -e /home/pi/Desktop/scratch2.desktop ]
then
sudo chattr -i -R /home/pi/Desktop/scratch2.desktop
sudo rm /home/pi/Desktop/scratch2.desktop
fi

$SHELL
