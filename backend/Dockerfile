FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
