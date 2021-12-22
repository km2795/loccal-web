FROM node:alpine
EXPOSE 7903
COPY ./ ./app/
CMD cd ./app/ && npm install && npm start
