#using the  base image of node alpine
#cause it is light weight
FROM node:20-alpine

#apk here is alpine package manager
#using apk to use timeout function

RUN apk add --no-cache coreutils


# Creating a non root user
# adduser makes a user
# -D take the default
RUN adduser -D runner

WORKDIR /app

COPY run.sh /app/run.sh

# #making the file executable
# RUN chmod +x /app/run.sh

USER runner

ENTRYPOINT [ "sh", "/app/run.sh" ]
