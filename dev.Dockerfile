FROM node:17-alpine

WORKDIR /app

VOLUME /app/

EXPOSE 8080

ENTRYPOINT npm install && npm run dev