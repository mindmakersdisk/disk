#!/bin/sh

sleep 30
NAME=mqttbot
if pgrep -f mmiotcli.py > /dev/null
then
  echo "$NAME is now running"
else
  echo ''
  echo "Error! Could not start $NAME!"
  echo "trying again"
  sudo service mqttbot restart
fi
