FROM node:17-alpine

COPY . .

RUN npm install && \
    node ./staticSiteGenerator.js

EXPOSE 8080

ENTRYPOINT node ./index.js