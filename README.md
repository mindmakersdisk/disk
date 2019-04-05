# Imagem Padrão de Desktop para Salas de Aula da Mind Makers

## A. Orientações para criar uma imagem de 'disco-padrão-base' com automação de atualização
### 1. Formatar um cartão SD.

1.1. Formate para 16GB ou maior se o cartão permitir, utilizando orientações padrões da internet como em https://www.wikihow.com/Format-an-SD-Card

1.2. Como sugestão, informe um nome rótulo MM-IMAGEM-GLOBAL ou outro que identifique o cartão.

_**Como verificar sucesso dessa etapa?**_ 
- _Montar o cartão em um computador e conferir se espaço livre está acima de 14GB_

### 2. Instalar o Sistema Operacional Raspbian (Padrão para o Raspberry Pi, derivado do Debian)

2.1. Baixar o arquivo do Sistema Operacional "Raspbian Stretch with desktop and recommended software", de https://www.raspberrypi.org/downloads/raspbian/ para um computador central de controle (estação Windows, por exemplo). O link direto para download do arquivo ZIP com esta versão é: https://downloads.raspberrypi.org/raspbian_full_latest

Obs.: O último empacotamento de arquivo do Raspbian homologado pela Mind Makers em março/2019 tem versão 4.14 de 2018-11-13. Versões posteriores devem funcionar, mas caso o pacote seja superior, recomenda-se confirmar essa informação através do suporte@mindmakers.cc.

2.2. Copiar a imagem do SO baixada para o cartão SD formatado, utilizando um utilitário de cópia de imagens de disco como o "Win32 Disk Imager".

> 2.2.1. Selecionar o arquivo baixado em 2.1 no computador central;

> 2.2.2. Selecionar o drive correto de destino no campo "Device"; 

> 2.2.3. Clicar em "Write". 

2.3. Configurar o SO copiado. 

> 2.3.1. Montar o cartão em um Raspberry PI com monitor, teclado e mouse e cabo de rede conectados e ligar.

> 2.3.2. Seguir o tutorial de configuração, selecionando o país "Brazil", o Timezone apropriado e o idioma "Brazilian Portuguese". Para escolas que desejarem manter o Desktop em inglês (ex.: escolas bilíngues), selecionar um país de língua inglesa, porém preservando o Timezone do Brasil. 

> 2.3.3. Informar uma nova senha para o usuário "pi", lembrando de anotá-la para não correr o risco de esquecer. Obs.: Este usuário e senha não serão utilizado no dia a dia, mas alterar a senha padrão pode evitar modificações indevidas de algumas configurações por parte de alunos, por exemplo. 

> 2.3.4. Configurar a conexão para acesso à Internet via WiFi conforme solicitado.

> 2.3.5. Na opção "Update Software" clicar em "Skip" para evitar uma atualização desnecessária. Alguns softwares serão removidos e os que precisam ser atualizados o serão, nos próximos passos, via Ansible. 

> 2.3.6. Reinicie clicando em Reboot.

_**Como verificar sucesso dessa etapa?**_ 
- _Conferir se o Raspberry PI inicia com a interface gráfica (chamada LXDE)_
- _Conferir se os rótulos e menu estão no idioma correto, em inglês ou português, conforme o interesse específico_
- _Conferir se o Timezone está correto, abrindo o terminal e digitando "date", confirmando que a hora está correta para o Brasil_
- _Conferir se o mouse e teclado estão configurados ok. Para testar o teclado, digite um "ç" e um "ã" em uma janela de terminal com o teclado, confirmando que são corretamente exibidos.
- _Conferir se o monitor está corretamente configurado. Importante: não é relevante que o monitor siga a resolução padrão neste momento, pois ela será configurada automaticamente em passos posteriores. Confira apenas que a imagem é apresentada_
- _Conferir a versão corrente do SO digitando o comando "lsb_release -a" em uma janela de terminal, conferindo se Release é 9.4. Obs.: essa versão será atualizada em passos posteriores via Ansible_
- _Abrir o navegador Chromium e confirmar que a internet está sendo acessada corretamente_

### 3. Instalar o gerenciador automático de configuração Ansible

3.1. Abrir o terminal em qualquer diretório e executar a linha de comando "sudo apt-get install -y ansible".

3.2. Caso este a execução encerre com erro, executar a linha de comando 'sudo apt-get update' e após sua execução, repetir a execução do passo anterior.

_**Como verificar sucesso dessa etapa?**_ 
- _Digitar no terminal "ansible --version" de qualquer diretório e conferir se a resposta traz ansible 2.2.1.0 ou superior na primeira linha_

### 4. Disparar o restante da configuração automatizada via Ansible.

4.1. Obter uma senha para atualização de desktops padrões da Mind Makers, solicitando através do "suporte@mindmakers.cc" ou da funcionalidade de SAC na plataforma em https://mindmakers.cc.

4.2. Abrir o terminal e executar a linha de comando "sudo ansible-pull -U https://mindmakersdisk-school@github.com/mindmakersdisk/disk.git", informando a senha apropriada quando solicitado (dica: para uma perfeita leitura da senha, evite digitar muito rapidamente)

Na primeira vez, a atualização de versão do próprio Ansible irá gerar uma exceção no restante da rotina, pelo fato de uma versão do Ansible ter sido alterada em meio à execução. Isso é indicado pelo linha "failed=1" ao final e esperado.

Confirme a atualização de versão do Ansible digitando no terminal "ansible --version" e confirmando que a versão agora é "2.7.9 ou superior".

4.3. Executar novamente a rotina de atualização automática, agora usando a versão atualizada do Ansible, repetindo o mesmo comando do item 4.2.

    DICAS IMPORTANTES => Podem ocorrer falhas esporádicas por casuísmos durante a execução da rotina tais como queda ou lentidão excessiva de conexão durante alguma atualização. 
    Essas falhas sempre geram um resultado "failed=1". Nestes casos:
    - Reinicie a execução, para que as tarefas que falharam sejam novamente executadas com sucesso;
    - Se o erro persistir, reinicia o Raspberry Pi e execute novamente. 

_**Como verificar sucesso do novo disco 'disco-padrão-base'?**_
- _Conferir na mensagem final do terminal se todas as tarefas do ANSIBLE executaram sem falhas, checando se "failed=0"..._
- _...ou se foi criado um atalho na área de trabalho com rótulo "Ambiente vX.X" (ou Environment vX.X, para versão em inglês), onde X.X é a versão e release da imagem padrão (ex: 2.2, 2.3)._ 

### 5. Validar a configuração do novo disco-padrão-base.

5.1. Reiniciar o computador acessando o menu e opção "Shutdown" ou usando o comando no terminal "reboot".

5.2. Consultar as notas de liberação, para conhecer as principais modificações na versão da imagem padrão, clicando no atalho da Área de Trabalho instalado com nome "Ambiente vX.X" ((ou Desktop vX.X, para versão em ingês).

5.3. Acessar alguns atalhos para confirmar a correta abertura das aplicações

5.4. Conferir se o Raspberry PI inicia na resolução de 1.366 x 768 (DMT MODE 81), acessando via menu "Preferências -> Raspberry Pi Configuration" e clicando em "Set Resolution" ou via comando de terminal "tvservice -s".

## B. Orientações para gerar uma imagem 'disco-padrão-escola', alocando 'disco-padrão-base' para uma escola específica

### 1. Alocar o disco padrão para uma escola específica, gerando um disco-padrão-escola.

1.1. Obter o código da escola com a Mind Makers através do suporte@mindmakers.cc ou SAC.

1.2. Abrir o terminal e alterar o diretório corrente com o comando "cd /home/mindmakers/programs"

1.3. Executar a linha de comando "sudo nodejs mmallocate.js", informar seu usuário e senha na plataforma da Mind Makers e aguardar pela mensagem de sucesso, conferindo se o nome correto da escola é exibido.

_**Como verificar sucesso dessa etapa?**_ 
- _Para dupla-conferência, clicar no atalho da Área de Trabalho com rótulo "Ativar" e confirmar que o código e nome da escola são exibidos no registro de "Ativação de Desktop Mind Makers" que aparece no início da rotina (cancelar o restante da ativação por hora, com control+C)_

### 2. Replicar a imagem do disco-padrão-escola para todas as estações

Utilizar alguma técnica para copiar imagens de discos SD, como a utilizada no passo (A) 2.2, através do programa "Win32 Disk Imager", no caso de SO Windows, exemplificado abaixo:

2.1. Copiar a imagem do disco padrão gerado no passo B.1 para um computador central utilizado para intermediar as cópias, com espaço em disco suficiente, utilizando o "Win32 Disk Imager".

> 2.1.1. Selecionar o drive correto em "Device"; 

> 2.1.2. No campo Image File, selecionar um diretório de destino e dar um nome como "imagem_padrao_escola.img"; 

> 2.1.3. Clicar em Read.

2.2. Copiar a imagem padrão do computador central para os novos cartões SD.

> 2.2.1. Formatar um novo cartão SD conforme instruções em A.1;

> 2.2.2. Incluir o cartão no slot do computador central;

> 2.2.3. No "Win32 Disk Manager", selecionar o arquivo "imagem_padrao_escola.img" (ou nome definido no passo anterior);

> 2.2.4. Selecionar o drive correto de destino no campo "Device"; 

> 2.2.5. Clicar em "Write".

2.3. Repetir o processo acima, para o número de estações Desktop da escola.

_**Como verificar sucesso das imagens de disco da escola?**_ 
- _A conferência de cada cópia será realizada na próxima atividade, de Ativação dos Desktops_

### 3. Ativar cada estação de trabalho. 

3.1. Montar cada cartão SD no computador Raspberry Pi definitivo em que ele será liberado.

3.2. Ligar o Pi

3.3. Se desejar configurar um robô Sphero SPRK+, basta deixá-lo próximo (menos de 20cm) do Pi, antes de ativar.

3.4. Clicar no atalho 'Ativar', informando seu login e senha da plataforma Mind Makers.

3.5. Se desejar utilizar o Login Simplificado, informe esta opção durante a ativação. 

_**Como verificar o sucesso da Ativação?**_ 
- _Conferir a mensagem de ativação OK_
- _Testar a conexão do Sphero, se ele foi configurado, clicando no atalho 'Conexão Sphero' e conferindo se a conexão é bem sucedida_
- _Testar o Login Simplificado, se ele foi configurado corretamente, clicando no atalho 'Mind Makers' e conferindo se a página exibe fotos dos alunos para seleção, no caso de haver uma turma em andamento com aulas recentes (importante: se não houver uma turma ou a última aula finalizou há mais de 24 horas, a página de login normal é exibida)_

## C. Orientações para atualizar versões de imagens de disco já configuradas.

TODO

## Apêndice. Orientações para atualizar uma versão de disco padrão existente - para instrutores e/ou responsáveis técnicos de escolas

### TODO

