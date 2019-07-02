#!/bin/bash

if [ -e /home/pi/Área\ de\ Trabalho/classroom_test.desktop ]
then

   sudo chattr -i /home/pi/Área\ de\ Trabalho/classroom_test.desktop
   sudo chattr -i /home/pi/Área\ de\ Trabalho/activate.desktop   
   sudo chattr -i /home/pi/Área\ de\ Trabalho/mindmakers.desktop

else

   sudo chattr -i /home/pi/Desktop/classroom_test.desktop
   sudo chattr -i /home/pi/Desktop/activate.desktop
   sudo chattr -i /home/pi/Desktop/mindmakers.desktop   

fi
