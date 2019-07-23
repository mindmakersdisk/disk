#!/bin/bash

if [ -e /home/pi/Desktop/screenlog.0 ]
then
  #Valida formato csv para duas colunas de dados, conforme requerido pelo exercício
  sed -i -r -e 's/([0-9]+)\s+?,?\s+?([0-9]+)\s+?,?\s+?/\1,\2 /' /home/pi/Desktop/screenlog.0

  #Gera o gráfico a partir dos dados fornecidos em screenlog.0
  sudo gnuplot -e "cd '/home/mindmakers/programs/shells/';load 'script-grafico.dat';exit"

else

  echo "Arquivo screenlog.0 não encontrado"
  echo "Saindo do programa"
  echo ""
  sleep 5

fi
