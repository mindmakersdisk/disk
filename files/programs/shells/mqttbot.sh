#!/bin/sh

sleep 30
NAME=mqttbot
if pgrep -f mmiotcli.py > /dev/null
then
  echo "$NAME já está rodando (via shell)"

  if [ -e /tmp/restart-mqtt.txt ] && [ $(cat /tmp/restart-mqtt.txt | wc -m ) -gt 1 ]
  then
    echo 'mqtt vai reiniciar na primeira execução para garantir funcionamento' > /tmp/restart-mqtt.txt
    sudo service mqttbot restart >/var/log/mqttbot.log
  fi

else
  echo ''
  echo "Erro! Não consegui iniciar $NAME!"
  echo "tentando novamente(via shell)"
  sudo service mqttbot restart >/var/log/mqttbot.log
fi
