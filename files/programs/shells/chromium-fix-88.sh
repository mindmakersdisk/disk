#!/bin/bash
# Fix para bug introduzido a partir da release 92.* do Google Chromium, que impede o Scratch3 online de funcionar por problema de Web GL
# A Mind Makers estará acompanhando o progresso da correção para, quando oportuno, homologar release mais atual.
# Caso essa atualização via shell esteja demorando muito: experimente baixar os dois arquivos diretamente pelo browser e, em seguida, executar o último comando a partir do diretório de download.

sudo wget  "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-browser_88.0.4324.187-rpt1_armhf.deb"
sudo wget "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-codecs-ffmpeg-extra_88.0.4324.187-rpt1_armhf.deb"
sudo apt install --no-install-recommends --allow-downgrades --allow-change-held-packages ./chromium-browser_88.0.4324.187-rpt1_armhf.deb ./chromium-codecs-ffmpeg-extra_88.0.4324.187-rpt1_armhf.deb -y

$SHELL
