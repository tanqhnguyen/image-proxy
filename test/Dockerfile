FROM node:12

RUN apt-get update && apt-get install postgresql-client dos2unix -y

RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm install

COPY ./test/.env .
COPY ./test/wait-for-it.sh .

RUN chmod +x /app/wait-for-it.sh
RUN dos2unix /app/wait-for-it.sh

COPY src ./src

COPY tsconfig.json .
COPY tsconfig.release.json .

RUN npm run build