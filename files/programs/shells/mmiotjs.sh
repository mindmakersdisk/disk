#!/bin/sh

run(){
    echo "Finalizando programa"
    return 0
}
#Run, força saída do programa

#termina o programa se pi for vazio ou Não registrado
if [ "$(sudo grep -wc "#host-name" /etc/avahi/avahi-daemon.conf)" -gt 0 ]
then
  echo "Imagem não ativada, ative-a para utilizar este serviço."
  run;
fi

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
