# Use the official image as a parent image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy the file from your host to your current location
COPY package.json /app
COPY package-lock.json /app

# Install the dependencies
RUN npm i

# Copy all the source code into the container's working directory
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the app when the container launches
CMD ["npm", "start"]
