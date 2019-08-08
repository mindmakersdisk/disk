#!/bin/bash


echo "Do you wish to install this program?"

# seleção 1) Yes 2) No... e somente aceita esses valores de 1 ou 2 como resposta.
select yn in "Yes" "No"; do
    case $yn in
        Yes ) echo "yes"; break;;
        No ) echo "no"; break;;
    esac
done


# nessa parte de baixo já sugere um caminho padrão.
read -e -p "Enter the path to the file: " -i "/usr/local/etc/" FILEPATH
echo $FILEPATH
