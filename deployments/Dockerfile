FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY src ./src
copy public ./public
COPY .env ./

CMD ["bun", "run", "start"]
