#!/bin/bash
HOST_DIR=/home/pi/Pictures
DEVICE_DIR=/sdcard/DCIM/Camera
EXTENSION=".jpg"
i=0

pergunta(){
  echo -n "quantas fotos quer recuperar? "
  echo ""
  local SURE
  read SURE
  resposta=$SURE
}

pergunta;

for file in $(adb shell ls -t $DEVICE_DIR | grep $EXTENSION'$')
do
    let i=$i+1
    if [ "$i" -le $resposta ]
    then   
        adb pull "$DEVICE_DIR/$file" "/tmp/$file";
        convert "/tmp/$file" -resize 720x480 "$HOST_DIR/$file"
    fi
    
done

