#!/bin/bash

pi="$(sudo grep -w "Pi:" /home/mindmakers/school.info | sed 's/.*: //')" 
sd="$(sudo grep -w "SD:" /home/mindmakers/school.info | sed 's/.*: //')"  

echo pi=$pi \& sd=$sd

run(){
        echo "Imagem não registrada, registre-a para realizar este teste."
        return 0
}
if [ -e /home/mindmakers/school.info ]
  then
  
  if [ "$pi" = '' ]
    then
  
    run;
  
  elif [ "$pi"  = 'Não registrado' ]
    then
  
    run;
  
  else
    if [ "$(sudo cat /sys/class/net/eth0/operstate)" = 'up' ]
      then
    
        lxterminal -e vnstat -l
    elif [ "$(sudo cat /sys/class/net/wlan0/operstate)" = 'up' ]
      then
    
        lxterminal -e vnstat -l -i wlan0
    fi
    
    chromium-browser https://mindmakers.cc/instrutor/#/testar-sala-list?pi=$pi\&sd=$sd --incognito
  

  fi
  
else

  echo "Imagem não contem arquivo school.info"
  run;
  
fi

$SHELL
