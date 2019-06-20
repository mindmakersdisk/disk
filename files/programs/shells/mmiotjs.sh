#!/bin/sh

sleep 30
NAME=mmiotjs
if pgrep -f mmiotcli.js > /dev/null
then
  echo "$NAME já está rodando (via shell)"
else
  echo ''
  echo "Erro! Não consegui iniciar $NAME!"
  echo "tentando novamente(via shell)"
  sudo service mmiotjs restart >/var/log/mmiotjs.log
fi
