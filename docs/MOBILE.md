
# AREA Project

## Overview
AREA is a android application built with Flutter. It leverages modern libraries to deliver a seamless and responsive user experience.

## Technologies Used
(more documentation can on this subject can be found in the [docs](../docs) folder)
- **Languages:**
  ![Flutter](https://skillicons.dev/icons?i=react)

## How to Run the Project
1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   flutter pub get
   ```
4. Setup your environment variables:
   - Create a `.env` file in the root of the project.
   - Add the environment variables like in `.en.example` file:
  
5. Start the development server:
   ```bash
   flutter run
   ```
6. Open you android emulator or your real phone and download the app.

## Project Structure
```
AREA/
├── analysis_options.yaml
├── android
│   ├── app
│   │   ├── build.gradle
│   │   └── src
│   │       ├── main
│   │       │   ├── AndroidManifest.xml
│   │       │   ├── java
│   │       │   ├── kotlin
│   │       │   └── res
│   │       └── profile
│   ├── area_android.iml
│   ├── build.gradle
│   ├── gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── local.properties
│   └── settings.gradle
├── area.iml
├── assets
│   ├── Discord.png
│   ├── Github.png
│   ├── g-logo.png
│   ├── gmail-new.png
│   ├── spotify.png
│   ├── twitch.png
│   └── Weather.png
├── Dockerfile
├── lib
│   ├── auth
│   │   ├── email_check.dart
│   │   ├── forgot_password.dart
│   │   ├── login.dart
│   │   ├── register.dart
│   │   └── reset_password.dart
│   ├── constant
│   │   └── constant.dart
│   ├── error
│   │   └── error.dart
│   ├── main.dart
│   ├── pages
│   │   ├── menu.dart
│   │   └── subpages
│   │       ├── action.dart
│   │       ├── delete_user.dart
│   │       ├── discord
│   │       │   ├── channel.dart
│   │       │   └── server.dart
│   │       ├── fail.dart
│   │       ├── profile_menu.dart
│   │       ├── reaction.dart
│   │       ├── select_area_name.dart
│   │       ├── send_mail.dart
│   │       ├── service_reaction.dart
│   │       ├── success.dart
│   │       └── your_area.dart
│   └── provider
│       ├── action.service.dart
│       ├── auth.service.dart
│       └── user.service.dart
├── pubspec.lock
├── pubspec.yaml
├── README.md
└── test
    └── widget_test.dart
```

## Contributors
- [Baptiste Moreau](https://github.com/Neiluge)
