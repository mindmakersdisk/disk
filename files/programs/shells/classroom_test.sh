#!/bin/bash

pi="$(sudo grep -w "Pi:" /home/mindmakers/school.info | sed 's/.*: //')" 
sd="$(sudo grep -w "SD:" /home/mindmakers/school.info | sed 's/.*: //')"  

echo pi=$pi\&sd=$sd

run(){
        echo "this is run"
        return 0
}

if [ "$pi" = '' ]
  then
  echo "Imagem não registrada, registre a imagem para realizar este teste."
  run;
elif [ "$pi"  = 'Não registrado' ]
  then
  echo "Imagem não registrada, registre a imagem para realizar este teste."
  run;
else
  if [ "$(sudo cat /sys/class/net/eth0/operstate)" = 'up' ]
    then
      lxterminal -e vnstat -l
  elif [ "$(sudo cat /sys/class/net/wlan0/operstate)" = 'up' ]
    then
      lxterminal -e vnstat -l -i wlan0
  fi

  chromium-browser https://mindmakers.cc/instrutor/#/testar-sala-list?pi=$pi\&sd=$sd
fi

$SHELL
