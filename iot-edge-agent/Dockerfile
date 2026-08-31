FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY sim ./sim
ENV NODE_ENV=production
ENV EDGE_STAY=true
CMD ["node", "src/index.mjs"]
