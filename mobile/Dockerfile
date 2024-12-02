# Use the latest Flutter image as a parent image
FROM ghcr.io/cirruslabs/flutter:3.24.5

# Set the working directory
WORKDIR /app

# Copy all the source code into the container's working directory
COPY . .

# Install the dependencies
RUN flutter pub get

# Run the app when the container launches
CMD ["flutter", "build", "apk", "--release", "--output=/shared/app-release.apk"]
