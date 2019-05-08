#!/bin/sh

sleep 30
NAME=mqttbot
if pgrep -f mmiotcli.py > /dev/null
then
  echo "$NAME já está rodando (via shell)"
else
  echo ''
  echo "Erro! Não consegui iniciar $NAME!"
  echo "tentando novamente(via shell)"
  sudo service mqttbot restart
fi
