#!/bin/bash

pi="$(sudo grep -w "Pi:" /home/mindmakers/school.info | sed 's/.*: //' | sed 's/||//')"
sd="$(sudo grep -w "SD:" /home/mindmakers/school.info | sed 's/.*: //' | sed 's/||//')"
#lê arquivo school.info e identifica padrão passado (Pi:), substitui qualquer ciosa antes do : por '', retira || do final da linha e aloca na variável.

echo pi=$pi \& sd=$sd

#condição de saída, termina a execução mas o terminal continua aberto
run(){
    echo "Finalizando programa"
    return 0
}

#testa se o arquivo school.info existe
if [ -e /home/mindmakers/school.info ]
then

    #termina o programa se pi for vazio (geralmente alocado para escola mas não registrado)
    if [ "$pi" = '' ]
    then
        echo "Imagem não registrada, registre-a para realizar este teste."
        run;

        #termina o programa se pi for não registrado
elif [ "$pi"  = 'Não registrado' ]
    then
        echo "Imagem não registrada, registre-a para realizar este teste."
        run;

    else

        #se Pi registrado, e estiver ligado por cabo na rede (eth0), roda vnstat como eth0
        if [ "$(sudo cat /sys/class/net/eth0/operstate)" = 'up' ]
        then

            lxterminal -e vnstat -l

            #se Pi registrado, mas está ligado a rede por WiFi (wlan0), roda vnstat como wlan0
    elif [ "$(sudo cat /sys/class/net/wlan0/operstate)" = 'up' ]
        then

            lxterminal -e vnstat -l -i wlan0

        else
            echo "Nenhuma conexão de rede encontrada"
            run;

        fi

        #abre chromium browser em anónimo para o teste de sala e já passa o serial do Pi e do cartão SD como valores.
        chromium-browser https://mindmakers.cc/instrutor/#/testar-sala-list?pi=$pi\&sd=$sd --incognito

    fi

else
    #caso a imagem ainda não contiver arquivo school.info ou ele foi removido.
    echo "Imagem não contem arquivo school.info"
    run;

fi

sleep 5
