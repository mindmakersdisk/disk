#!/bin/bash
HOST_DIR=/home/pi/Pictures
DEVICE_DIR=/sdcard/DCIM/Camera
EXTENSION=".jpg"
i=0

pergunta(){
  echo "********************************************************************************"
  echo "*       Preparando para o download das fotos do celular Android via adb.       *"
  echo "*   Caso o diretório onde as fotos se encontram no celular seja diferente de   *"
  echo "*                             '/sdcard/DCIM/Camera'                            *"
  echo "*     favor executar a shell explicitando o caminho, como no exemplo abaixo    *"
  echo "*                  'adb-foto-download.sh /caminho/para/pasta'                   *"
  echo "********************************************************************************"
  echo ""
  echo -n "Quantas fotos desja recuperar? "
  echo ""
  while :; do
     local SURE
     read SURE
     if [[ $SURE =~ ^[0-9]{1,2}$ ]] && [ $SURE -gt 0 ];
     then
       resposta=$SURE && break
     else
       echo "Quantidade digitada não é um número, digite valores entre 1 e 99"
       echo ""
       echo -n ""
     fi
  done
}

#adb vai na pasta "DEVICE_DIR" e lista todos arquivos em ordem de mais novo para mais antigo

dir=$1

if [ -n "$dir" ]
then

  DEVICE_DIR=$dir

else

   if [ -e /var/log/adb-caminho.txt ] && [ $(cat /var/log/adb-caminho.txt | wc -m ) -gt 1 ]
   then
     export DEVICE_DIR=`cat /var/log/adb-caminho.txt`
   fi

fi

pergunta;

echo ""
echo "A pasta selecionada é: "
echo $DEVICE_DIR | sudo tee /var/log/adb-caminho.txt
echo ""

qt=$(adb shell ls -t $DEVICE_DIR | grep $EXTENSION'$'| wc -l)

if [ $qt -lt $resposta ] && [ $qt -gt 0 ]
then
  resposta=$qt
  echo "A pasta informada possúi '$qt' fotos."
  echo ""
fi

if [ $qt -gt 0 ]
then

  for file in $(adb shell ls -t $DEVICE_DIR | grep $EXTENSION'$')
  do
      #para cada arquivo listado enquanto i<=$resposta, puxa o arquivo para pasta \tmp e
      #converte para um tamanho menor gravando esse arquivo na pasta padrão "HOST_DIR"
      let i=$i+1
      if [ "$i" -le $resposta ]
      then
          sudo adb pull "$DEVICE_DIR/$file" "/tmp/$file";

          #comando abaixo retira metadados das fotos se descomentado
          #mogrify -quiet -strip "/tmp/$file"

          sudo convert -quiet "/tmp/$file" -resize 720x480 "$HOST_DIR/$file"
      fi

  done
  sleep 10
else

  echo "A pasta selecionada não possúi nenhum arquivo .jpg"
  echo "Encerrando o programa."
  sleep 10

fi
