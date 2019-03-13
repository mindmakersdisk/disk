# Imagem Padrão de Desktop para Salas de Aula da Mind Makers

## Orientações para criar um novo disco padrão - para administradores da Mind Makers

### 1. Formatar um cartão SD para 16MB, utilizando TODO

1.1. TODO

_Como verificar sucesso deste passo? 
- _Conferir se espaço livre está acima de 14GB_

### 2. Instalar o Sistema Operacional "Raspbian Stretch with desktop and recommended software", baixada de https://www.raspberrypi.org/downloads/raspbian/, versão 4.14 de 2018-11-13 (TODO Ver se é prudente copiarmos para drive próprio)

2.1. TODO

_**Como verificar sucesso deste passo?**_ 
- _Conferir se o Raspberry PI inicia com a interface gráfica (chamada LXDE)_
- _Conferir se configuração está no idioma correto, em inglês ou português, conforme o interesse específico_
- _Conferir se mouse, teclado e monitor estão corretamente configurados_

### 3. Instalar o gerenciador de configuração Ansible TODO

3.1. TODO

_**Como verificar sucesso deste passo?**_ 
- _Digitar no terminal "sudo ansible-pull" de qualquer diretório e conferir se a resposta é TODO_

### 4. Disparar o restante da configuração automatizada via Ansible.

4.1. Abrir o terminal e executar a linha de comando "sudo ansible-pull https://mindmakersdisk@github.com/mindmakersdisk/disk.git", informando a senha apropriada

_**Como verificar sucesso deste passo?**_ 
- _Conferir se o Raspberry PI inicia na resolução de 1.366 x 768 (DMT MODE 81)_
- _Em uma amostra de 1 para cada 16 imagens, realizar os testes nos aplicativos chaves, definidos em TODO_

## Apêndice. Orientações para atualizar uma versão de disco padrão existente - para instrutores e/ou responsáveis técnicos da escola

### 1. 

