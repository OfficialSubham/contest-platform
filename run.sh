#!/bin/sh

#This -e states that if any thing exit with a non zero exit code then return that exit code
# but this is not good for production cause it cannott handle signals/background process and multiple commands so u have to use exec 
set -e

cd /tmp

cat > main.js

echo "File size : "

wc -c main.js

echo "File content :"

cat -n "main.js"

# Using exec here states that this will run as process id 1
# PID 1 means that it will be as main container and return its exit code

exec /usr/bin/timeout 2 node main.js
