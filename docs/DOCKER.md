
# Docker Documentation for the Project

## Overview
This project uses **Docker** to containerize the application and simplify deployment and development. The project is structured with **Docker Compose** to manage multiple services: the server, client_web, client_mobile, and MongoDB.

The structure includes the following components:
1. **mongo**: MongoDB database container.
2. **server**: Backend service container.
3. **client_web**: Frontend web service container.
4. **client_mobile**: Mobile client build container for Flutter.

---

## `docker-compose.yml`

### General Structure
```yaml
name: area

services:

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  server:
    build:
      context: backend/
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    command: npm start
    depends_on:
      - mongo
    env_file:
      - ./backend/.env.docker

  client_mobile:
    build:
      context: ./mobile
    volumes:
      - shared-volume:/shared
    env_file:
      - ./mobile/.env.docker

  client_web:
    build:
      context: ./front
    ports:
      - "8081:8081"
    volumes:
      - shared-volume:/shared
    command: npm run dev
    depends_on:
      - client_mobile
      - server
    env_file:
      - ./front/.env.docker

volumes:
  shared-volume:
  mongo-data:
```

### Explanation of Each Service

#### **1. `mongo` Service**
- **Image**: Uses the official MongoDB image `mongo:6.0`.
- **Ports**: Exposes MongoDB on port `27017`.
- **Volumes**: Maps the container's database directory `/data/db` to a named volume `mongo-data` for persistent storage.

#### **2. `server` Service**
- **Build**:
  - Context: `backend/` directory where the backend Dockerfile is located.
- **Ports**: Maps the container's port `8080` to host port `8080`.
- **Volumes**: Maps the `./backend` folder (host) to `/app` in the container for live code updates.
- **Command**: Runs the backend service using `npm start`.
- **Depends_on**: Ensures the `mongo` service starts before the backend.
- **Environment File**: Loads environment variables from `./backend/.env.docker`.

#### **3. `client_web` Service**
- **Build**:
  - Context: `./front` directory where the frontend Dockerfile is located.
- **Ports**: Maps the container's port `8081` to host port `8081`.
- **Volumes**: Mounts `shared-volume` to `/shared` for shared data between services.
- **Command**: Runs the frontend service using `npm run dev`.
- **Depends_on**: Ensures the `server` and `client_mobile` services start before the frontend.
- **Environment File**: Loads environment variables from `./front/.env.docker`.

#### **4. `client_mobile` Service**
- **Build**:
  - Context: `./mobile` directory where the mobile Dockerfile is located.
- **Volumes**: Mounts `shared-volume` to `/shared` for output communication.
- **Command**: Builds the Flutter application APK and copies it to the shared volume.
- **Environment File**: Loads environment variables from `./mobile/.env.docker`.

#### **Volumes**
- `mongo-data`: Stores MongoDB data persistently.
- `shared-volume`: Provides a shared volume for communication between services.

---

## Backend Dockerfile

**Path**: `backend/Dockerfile`

```dockerfile
# Use the official image as a parent image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy the file from your host to your current location
COPY package.json /app

# Install the dependencies
RUN npm i

# Copy all the source code into the container's working directory
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the app when the container launches
CMD ["npm", "start"]
```

---

## Frontend Dockerfile

**Path**: `front/Dockerfile`

```dockerfile
# Use the official image as a parent image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy the file from your host to your current location
COPY package.json /app

# Install the dependencies
RUN npm i

# Copy all the source code into the container's working directory
COPY . .

# Make port 8081 available to the world outside this container
EXPOSE 8081

# Run the app when the container launches
CMD ["npm", "start"]
```

---

## Mobile Dockerfile

**Path**: `mobile/Dockerfile`

```dockerfile
# Use the latest Flutter image as a parent image
FROM ghcr.io/cirruslabs/flutter:3.24.5

# Set the working directory
WORKDIR /app

# Copy all the source code into the container's working directory
COPY . .

# Install the dependencies
RUN flutter pub get

# Build the APK and copy it to the shared volume
CMD flutter build apk --release && cp build/app/outputs/flutter-apk/app-release.apk /shared/client.apk
```

---

## Running the Project

### Prerequisites
- Docker and Docker Compose must be installed on your system.

### Build and Start the Containers
Run the following command from the root directory:
```bash
docker-compose up --build
```

### Stopping the Containers
To stop the containers, use:
```bash
docker-compose down
```

---

## Accessing the Services
1. **MongoDB**: Accessible at `localhost:27017`.
2. **Backend Server**: Accessible at `http://localhost:8080`.
3. **Frontend Client**: Accessible at `http://localhost:8081`.
4. **Mobile APK**: The built APK will be available in the shared volume or at `http://localhost:8081/client.apk`.

---

## Notes
- Ensure environment variables for `backend`, `mobile` and `front` are correctly configured in `.env.docker` files.
- Shared volume `shared-volume` is used for communication between `client_web` and `client_mobile`.
- The `client_mobile` service builds a release APK that is available in the shared volume.

---

## References
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**End of Documentation**
