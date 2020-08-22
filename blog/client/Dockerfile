# Specify our base image
FROM node:alpine

ENV CI=true

# Set working directory of container
WORKDIR ./app

# Install dependencies
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Specify start-up command
CMD ["npm", "start"]