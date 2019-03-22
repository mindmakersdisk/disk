#!/bin/bash
sudo fuser -k 80/tcp

echo "********************************************************************************" 
echo "*                                                                              *" 
echo "*      Ativa o Computador para Uso em Sala de Aula por uma Escola              *" 
echo "*                                                                              *" 
echo "********************************************************************************" 

cd '/home/mindmakers/programs'
sudo nodejs mmactivate.js

sudo fuser -k 80/tcp
