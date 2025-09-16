FROM node:20.17

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx next telemetry disable
RUN npm run build

# Expose the port (Cloud Run uses PORT env var)
EXPOSE $PORT

# Use PORT environment variable for Cloud Run compatibility (defaults to 8080)
CMD ["sh", "-c", "npm run start -- -p ${PORT:-8080}"]

