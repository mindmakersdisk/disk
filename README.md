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
- _Conferir na mensagem final do terminal se todas as tarefas do ANSIBLE executaram sem falhas, checando se "failed=0"...
- _...ou se foi criado um atalho na área de trabalho com rótulo "Ambiente v9.9" (ou Environment v9.9, para versão em ingês). Esta é a última tarefa da rotina, realizada apenas quando todas as demais finalizaram com sucesso._ 

### 5. Validar a nova configuração do Desktop

5.1. Reiniciar o computador acessando o menu e opção "Shutdown" ou usando o comando no terminal "reboot".

5.2. Consultar as notas de liberação, para conhecer as principais modificações na versão da imagem padrão, clicando no atalho da Área de Trabalho instalado com nome "Ambiente v9.9" ((ou Environment v9.9, para versão em ingês).

_**Como verificar sucesso do novo disco padrão?**_ 
- _Conferir se o Raspberry PI inicia na resolução de 1.366 x 768 (DMT MODE 81)_
- _Acessar alguns atalhos para confirmar a correta abertura das aplicações_

## B. Orientações para gerar imagens para uma escola específica

### 1. Alocar o disco padrão para uma escola específica.

1.1. Obter o código da escola com a Mind Makers através do suporte@mindmakers.cc ou SAC.

1.2. Abrir o terminal e alterar o diretório corrente com "cd /home/mindmakers/programs"

1.3. Executar a linha de comando "sudo nodejs mmallocate.js" e aguardar pela mensagem de sucesso, conferindo se o nome correto da escola é exibido.

_**Como verificar sucesso dessa etapa?**_ 
- _Para dupla-conferência, clicar no atalho da Área de Trabalho com rótulo "Ativação" e confirmar que o código e nome da escola são exibidos no registro de "Ativação de Desktop Mind Makers" que aparece no início da rotina (cancelar o restante da ativação por hora, com control+C)_

### 2. Replicar a imagem de disco padrão da escola para todas as estações

Utilizar alguma técnica para copiar imagens de discos SD, como a utilizada no passo XX, através do programa "Win32 Disk Imager", no caso de SO Windows, exemplificado abaixo:

2.1. Copiar a imagem do disco padrão gerado no passo B.1 para um computador central utilizado para intermediar as cópias, com espaço em disco suficiente, utilizando o "Win32 Disk Imager".

2.1.1. Selecionar o drive correto em "Device"; 
2.1.2. No campo Image File, selecionar um diretório de destino e dar um nome como "imagem_padrao_escola.img"; 
2.1.3. Clicar em Read.

2.2. Copiar a imagem padrão do computador central para os novos cartões SD.

2.2.1. Formatar um novo cartão SD conforme instruções em A.1;
2.2.2. Incluir o cartão no slot do computador central;
2.2.3. No "Win32 Disk Manager", selecionar o arquivo "imagem_padrao_escola.img" (ou nome definido no passo anterior);
2.2.4. Selecionar o drive correto de destino no campo "Device"; 
2.2.5. Clicar em "Write".

2.3. Repetir o processo acima, para o número de estações Desktop da escola.

_**Como verificar sucesso dessa etapa?**_ 
- _A conferência de cada cópia será realizada na próxima atividade, de Ativação dos Desktops_

### 3. Instalar o gerenciador de configuração Ansible TODO

3.1. TODO

_**Como verificar sucesso dessa etapa?**_ 
- _Digitar no terminal "sudo ansible-pull" de qualquer diretório e conferir se a resposta é TODO_

## Apêndice. Orientações para atualizar uma versão de disco padrão existente - para instrutores e/ou responsáveis técnicos de escolas

### 1. TODO

