# Use the official Node.js image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy only package.json and install dependencies
COPY package.json /app
RUN npm install --legacy-peer-deps

# Copy the application source code
COPY . .

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["npm", "start"]
