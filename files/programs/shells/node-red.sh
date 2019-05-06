#!/bin/bash

bash /home/mindmakers/programs/shells/node-red-localhost.sh >> /dev/null 2>&1 &
sudo /usr/bin/node-red-start

$SHELL
