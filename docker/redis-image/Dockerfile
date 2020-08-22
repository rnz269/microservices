# Use an existing docker image as a base
FROM alpine

# Download and install a dependency
RUN apk add --update redis

# image startup command
CMD ["redis-server"]