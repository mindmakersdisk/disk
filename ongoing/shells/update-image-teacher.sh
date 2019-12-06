#!/bin/bash
cd /home/pi/ansible

pipenv shell sudo ansible-pull -U https://mindmakersdisk-school@github.com/mindmakersdisk/disk.git teacher.yml

$SHELL
