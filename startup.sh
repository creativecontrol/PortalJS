#!/usr/bin/env bash

# create virtual midi ports
# modprobe snd-virmidi snd_index=1

# moved permanently to startup modules with:
# echo "snd-virmidi snd_index=1" |sudo tee -a /etc/modules

#start up bitwig portal

nohup bitwig-studio /home/showtime/PortalJS/PortalBW/Portal.bwproject &>/dev/null &
