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
