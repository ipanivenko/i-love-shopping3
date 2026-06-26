FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

RUN npm install

COPY . .

WORKDIR /app/frontend

EXPOSE 5173