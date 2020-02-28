FROM node:10
EXPOSE 8080
# install dependencies
WORKDIR /node_api
COPY package.json package-lock.json* ./
RUN npm install

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . .

CMD [ "npm", "run", "start" ]
