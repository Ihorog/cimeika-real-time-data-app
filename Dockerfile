FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Allow setting the port at build time, defaulting to Hugging Face's 7860
ARG PORT=7860
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["node", "server.js"]
