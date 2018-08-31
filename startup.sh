#!/usr/bin/env bash

# create virtual midi ports
sudo modprobe snd-virmidi snd_index=1

#start up bitwig portal

USAGE="Run with 'clean' argument to erase previous Bitwig session info."
DIRECTORY="/home/showtime/.BitwigStudio/undo-history/"

load_bitwig () {
  nohup bitwig-studio /home/showtime/PortalJS/PortalBW/Portal.bwproject &>/dev/null & 
}

# start clean
if [[ "$1" == "clean" ]]
then
  echo "starting Bitwig cleanly"
  if [[ -d $DIRECTORY ]]
  then 
    rm -r $DIRECTORY
  fi
  load_bitwig  
elif [[ "$1" == "" ]]
then
  echo "starting Bitwig with last file info"
  load_bitwig
else
  echo $USAGE
  exit 1 
fi


