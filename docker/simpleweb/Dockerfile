# Specify a base image
FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Copy package.json to container
COPY ./package.json ./

# Run some commands to install additional programs
RUN npm install

# Copy rest of files to container (split COPY step => npm install not rerun on src code change)
COPY ./ ./


# Specify a command to run on container startup
CMD ["npm", "start"]