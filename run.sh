#!/bin/sh

#This -e states that if any thing exit with a non zero exit code then return that exit code
# but this is not good for production cause it cannott handle signals/background process and multiple commands so u have to use exec 
set -e

cd /tmp

#Reading all stdin at once
cat > payload.txt

# cat > main.js

# sed '/^__INPUT__$/,$d' payload.txt > main.js
# sed '1/^__INPUT__$/d' payload.txt > input.txt

awk '/^__INPUT__$/ {exit} {print}' payload.txt > main.js
awk 'found {print} /^__INPUT__$/ {found=1}' payload.txt > input.txt



# echo "File size : "

# wc -c main.js

# echo "File content :"

# cat -n "main.js"

# Using exec here states that this will run as process id 1
# PID 1 means that it will be as main container and return its exit code

exec /usr/bin/timeout 2 node main.js < input.txt
