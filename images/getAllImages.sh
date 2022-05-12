#!/bin/bash
START=1
END=81
for ((i=$START; i <= $END; i++))
do
  wget https://www.setgame.com/sites/all/modules/setgame_set/assets/images/new/$i.png
done

