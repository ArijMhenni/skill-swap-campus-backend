FROM node:22-alpine AS development

WORKDIR /swapskill/src/app

COPY package*.json ./
RUN npm install

EXPOSE 3000 9229

CMD ["npm", "run", "start:dev"]