FROM node:20.17

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx next telemetry disable
ARG API_URL
ENV API_URL=${API_URL}
RUN npm run build

# Respect Cloud Run's PORT env var
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npm run start -- -p ${PORT}"]

