#!/bin/bash
HOST_DIR=/home/pi/Pictures
DEVICE_DIR=/sdcard/DCIM/Camera
EXTENSION=".jpg"
i=0

pergunta(){
  echo ""
  echo "Preparando para o download das fotos do celular via adb."
  echo -n "Quantas fotos desja recuperar? "
  echo ""
  local SURE
  read SURE
  resposta=$SURE
}

pergunta;

#adb vai na pasta "DEVICE_DIR" e lista todos arquivos em ordem de mais novo para mais antigo
for file in $(adb shell ls -t $DEVICE_DIR | grep $EXTENSION'$')
do
    #para cada arquivo listado enquanto i<=$resposta, puxa o arquivo para pasta \tmp e
    
    #converte para um tamanho menor gravando esse arquivo na pasta padrão "HOST_DIR"
    let i=$i+1
    if [ "$i" -le $resposta ]
    then
        adb pull "$DEVICE_DIR/$file" "/tmp/$file";
        
        #comando abaixo retira metadados das fotos se descomentado
        #mogrify -quiet -strip "/tmp/$file"
        
        convert -quiet "/tmp/$file" -resize 720x480 "$HOST_DIR/$file"
    fi

done
