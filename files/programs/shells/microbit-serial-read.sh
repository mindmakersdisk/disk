#!/bin/bash

rm -f ~/Desktop/screenlog.0
cd ~/Desktop
screen -L /dev/ttyACM0 115200
sleep 120
screen -X kill
