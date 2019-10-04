#!/bin/sh

run(){
    echo "Finalizando programa"
    return 0
}
#Run, força saída do programa

pi="$(sudo grep -w "Pi:" /home/mindmakers/school.info | sed 's/.*: //' | sed 's/||//')"

#termina o programa se pi for vazio ou Não registrado
if [ "$pi" = '' ] || [ "$pi"  = 'Não registrado' ]
then
    echo "Imagem não registrada, registre-a para utilizar este serviço."
    run;
fi

sleep 30
NAME=mqttbot
if pgrep -f mmiotcli.py > /dev/null
then
    echo "$NAME já está rodando (via shell)"

    if [ -e /tmp/restart-mqtt.txt ] && [ $(cat /tmp/restart-mqtt.txt | wc -m ) -gt 1 ]
    then
        echo 'já foi reiniciado'
    else
        echo 'mqtt vai reiniciar na primeira execução para garantir funcionamento'
        echo 'mqtt vai reiniciar na primeira execução para garantir funcionamento' > /tmp/restart-mqtt.txt
        sudo service mqttbot restart >/var/log/mqttbot.log
    fi

else
    echo ''
    echo "Erro! Não consegui iniciar $NAME!"
    echo "tentando novamente(via shell)"
    sudo service mqttbot restart >/var/log/mqttbot.log
fi
