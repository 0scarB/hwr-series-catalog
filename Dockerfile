# Arbeit von Oscar
# ----------------
FROM node:17-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

ENTRYPOINT npm run build && npm run serve