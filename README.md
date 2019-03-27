# Imagem Padrão de Desktop para Salas de Aula da Mind Makers

## A. Orientações para criar uma nova imagem de disco padrão para escolas.

### 1. Formatar um cartão SD.

1.1. Formate para 16GB ou maior se o cartão permitir, utilizando orientações padrões da internet como em https://www.wikihow.com/Format-an-SD-Card

1.2. Como sugestão, informe um nome rótulo MM-IMAGEM-GLOBAL ou outro que identifique o cartão.

_**Como verificar sucesso dessa etapa?**_ 
- _Montar o cartão em um computador e conferir se espaço livre está acima de 14GB_

### 2. Instalar o Sistema Operacional Raspbian (Padrão para o Raspberry Pi, derivado do Debian)

2.1. Instalar o Sistema Operacional "Raspbian Stretch with desktop and recommended software", baixando de https://www.raspberrypi.org/downloads/raspbian/. O link direto para download do arquivo ZIP com esta versão é: https://downloads.raspberrypi.org/raspbian_full_latest

Obs.: O último empacotamento de arquivo do Raspbian homologado pela Mind Makers em março/2019 tem versão 4.14 de 2018-11-13. Versões posteriores devem funcionar, mas caso o pacote seja superior, recomenda-se confirmar essa informação através do suporte@mindmakers.cc.

2.2. Durante a instalação, selecionar idioma "Português" se for de interesse instalar um Desktop para aulas em português. Ou idioma "Inglês" se for de interesse instalar um Destop para aulas em inglês (ex.: escolas bilíngues).

2.3. Configurar o teclado, mouse e monitor conforme orientações padrões da instalação. 

_**Como verificar sucesso dessa etapa?**_ 
- _Conferir se o Raspberry PI inicia com a interface gráfica (chamada LXDE)_
- _Conferir se configuração está no idioma correto, em inglês ou português, conforme o interesse específico_
- _Conferir se mouse, teclado e monitor estão corretamente configurados. Importante: não é relevante que o monitor siga a resolução padrão neste momento, pois ela será configurada automaticamente em passos posteriores. Confira apenas que a imagem é apresentada_
- _Conferir a versão corrente do SO digitando o comando "lsb_release -a" em uma janela de terminal, conferindo se Release é 9.8._

### 3. Instalar o gerenciador automático de configuração Ansible

3.1. Baixar o arquivo "ansible.zip" a partir do link "https://github.com/mindmakersdisk/disk/raw/master/ansible.zip"

3.2. Extrair os arquivos para o diretório "/home/pi/Downloads".

3.3. Clicar no executável "instala".

_**Como verificar sucesso dessa etapa?**_ 
- _Digitar no terminal "sudo ansible-pull --version" de qualquer diretório e conferir se a resposta traz ansible 2.7.9 ou superior na primeira linha_

### 4. Disparar a configuração automatizada via Ansible.

4.1. Obter uma senha para atualização de desktops padrões da Mind Makers, solicitando através do "suporte@mindmakers.cc" ou da funcionalidade de SAC na plataforma em https://mindmakers.cc.

4.2. Abrir o terminal e executar a linha de comando "sudo ansible-pull https://mindmakersdisk-school@github.com/mindmakersdisk/disk.git", informando a senha apropriada quando solicitado (dica: para uma perfeita leitura da senha, evite digitar muito rapidamente)

_**Como verificar sucesso do novo disco padrão?**_ 
- _Conferir na mensagem final do terminal se a execução de todas as tarefas do ANSIBLE ocorreram sem falhas (TODO GABRIEL)...
- _...ou que o rótulo de versão do atalho de "Ambiente v9.9" (ou Environment v9.9) foi atualizado para a nova versão._ 

### 5. Atualizar as Notas de Liberação, informando um resumo do que foi atualizado.

5.1. Abrir o arquivo TODO e incluir uma nova seção ao final, com as mudanças feitas na imagem de base, em resumo

_**Como verificar sucesso do novo disco padrão?**_ 
- _Conferir se o Raspberry PI inicia na resolução de 1.366 x 768 (DMT MODE 81)_
- _Em uma amostra de 1 para cada 16 imagens, realizar os testes nos aplicativos chaves, definidos em TODO_
- _Conferir se foi descrito o resumo do que foi modificado nas Notas de Liberação

## B. Orientações para criar um novo disco padrão de escola - para administradores da Mind Makers

### 1. Fazer uma cópia da imagem MM-IMAGEM-GLOBAL para uma imagem da escola MM-IMAGEM-ESCOLA 

1.1. Copiar o disco.

1.2. Abrir o terminal e executar a linha de comando "sudo nodejs /home/mindmakers/programs/registraescola.js"



_**Como verificar sucesso dessa etapa?**_ 
- _Conferir se espaço livre está acima de 14GB_

### 2. Instalar o Sistema Operacional

2.1. Instalar o Sistema Operacional "Raspbian Stretch with desktop and recommended software", baixada de https://www.raspberrypi.org/downloads/raspbian/, versão 4.14 de 2018-11-13 (TODO Ver se é prudente copiarmos para drive próprio)

_**Como verificar sucesso dessa etapa?**_ 
- _Conferir se o Raspberry PI inicia com a interface gráfica (chamada LXDE)_
- _Conferir se configuração está no idioma correto, em inglês ou português, conforme o interesse específico_
- _Conferir se mouse, teclado e monitor estão corretamente configurados_

### 3. Instalar o gerenciador de configuração Ansible TODO

3.1. TODO

_**Como verificar sucesso dessa etapa?**_ 
- _Digitar no terminal "sudo ansible-pull" de qualquer diretório e conferir se a resposta é TODO_

## Apêndice. Orientações para atualizar uma versão de disco padrão existente - para instrutores e/ou responsáveis técnicos de escolas

### 1. TODO

