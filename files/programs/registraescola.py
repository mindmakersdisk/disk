#!/usr/bin/python
# -*- coding: latin-1 -*-

# para instalar o modulo requests: baixar fonte do git + cd requests + pip install
import os, sys, requests
from PIL import Image
from io import BytesIO

print "Entre com o código da escola para registro nesta imagem de disco:"
codigo_escola = raw_input()
nome_escola = requests.get('https://mindmakers.cc/api/Escolas/nome/publico', params={'id':codigo_escola})

if nome_escola==''
	print "Não exise escola cadastrada para código: %s" % codigo_escola
	sys.exit(1)	

# registra link para login simplificado, se encontrou a escola
f = open('/home/mindmakers/schools/'+nome_escola)
conteudo = f.read()
print "Conteúdo: %s" % conteudo

# Aplica nome e código 


# grava imagem com logotipo da escola, se existir
logo_escola = requests.get('https://mindmakers.cc/api/Escolas/logo/publico', params={'id':codigo_escola})
imagem_logo_escola = Image.open(BytesIO(logo_escola.content))

# Salva logo em schools


# Usa logo em TODO


print "Escola com nome %s registrada com sucesso!" % nome_escola.content
