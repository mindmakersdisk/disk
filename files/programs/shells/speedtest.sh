#!/bin/bash

i=0

string="{"

  for line in $(speedtest-cli --simple); do
      let i=$i+1
      if [ $i -eq 1 ]; then
        string+='"ping":'
      elif [ $i -eq 2 ]; then
        string+=" ${line}"
      elif [ $i -eq 3 ]; then
        string+=', "ping-un": '
        string+='"'
        string+="${line}"
        string+='"'
        string+=', '
      elif [ $i -eq 4 ]; then
        string+='"download":'
      elif [ $i -eq 5 ]; then
        string+=" ${line}"
      elif [ $i -eq 6 ]; then
        string+=', "download-un": '
        string+='"'
        string+="${line}"
        string+='"'
        string+=', '
      elif [ $i -eq 7 ]; then
        string+='"upload":'
      elif [ $i -eq 8 ]; then
        string+=" ${line}"
      elif [ $i -eq 9 ]; then
        string+=', "upload-un": '
        string+='"'
        string+="${line}"
        string+='"'
      fi
      
  done

string+=', "timestamp": '
string+="$(date +"%s")"
string+="}"

echo $string | sudo tee -a /home/mindmakers/speedtest.json
