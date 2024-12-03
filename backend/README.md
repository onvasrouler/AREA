<h1 align="center">This is the V2 of my base of site </h1>

### 💼 Technologies and Tools:
<div align="center">

  <code><img height="80" src="https://github.com/aimeric44uwu/aimeric44uwu/blob/main/img/nodejs.png?raw=true" alt="nodejs"></code>
  <code><img height="80" src="https://github.com/aimeric44uwu/aimeric44uwu/blob/main/img/mongodb.png?raw=true" alt="mongodb"></code>
  <code><img height="80" src="https://github.com/aimeric44uwu/aimeric44uwu/blob/main/img/html.png?raw=true" alt="html"></code>
  <code><img height="80" src="https://github.com/aimeric44uwu/aimeric44uwu/blob/main/img/css.png?raw=true" alt="CSS"></code>
  <code><img height="80" src="https://github.com/aimeric44uwu/aimeric44uwu/blob/main/img/javascript.png?raw=true" alt="javascript"></code>
</div>

<br/>

## 👨‍💻 About This Project:
this is a simple site with a secure backend with a handmade authentification system / session manager
this project is build using [NodeJs](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/)

<br/>

## Installation
Use the package manager [npm]([https://pip.pypa.io/en/stable/](https://www.npmjs.com/)) to install required dependencies.
```bash
npm i
```
<br/>

setup [MongoDB](https://www.mongodb.com/) using the [Guide on their site](https://www.mongodb.com/docs/manual/installation/)

<br/>

if you want to use [nodemon](https://www.npmjs.com/package/nodemon) you'll have to install it globally:
```bash
npm install -g nodemon # or using yarn: yarn global add nodemon
```
You can also install [nodemon](https://www.npmjs.com/package/nodemon) as a development dependency:
```bash
npm install --save-dev nodemon # or using yarn: yarn add nodemon -D
```
<br/>

## Usage

possible commands are : 
```bash
# run with nodemon to auto reload the code
npm run dev

# run in production
npm run start

# check lint errors
npm run lint

# auto fix lint errors
npm run lintfix
```

## API Endpoints

### User Registration and Authentication

- **POST /fastregister**
  - **Description**: Register a new user quickly (for testing purposes).
  - **body**:
    ```json
    {
      "email": "email@example.com",
      "username": "username",
      "password": "password"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User registered successfully",
      "data": null,
      "error": null,
      "session": "session_token",
      "username": "username"
    }
    ```

- **POST /register**
  - **Description**: Register a new user.
  - **body**:
    ```json
    {
      "email": "email@example.com",
      "username": "username",
      "password": "password"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User registered successfully",
      "data": null,
      "error": null,
      "session": "session_token",
      "username": "username"
    }
    ```

- **POST /register/verify**
  - **Description**: Verify the user's email after registration.
  - **body**:
    ```json
    {
      "token": "verification_token"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Email verified successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /login**
  - **Description**: Log in a user.
  - **body**:
    ```json
    {
      "emailOrUsername": "email@example.com",
      "password": "password"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User logged in successfully",
      "data": null,
      "error": null,
      "session": "session_token",
      "username": "username"
    }
    ```

- **POST /auth/google**
  - **Description**: Authenticate a user using Google OAuth.
  - **body**: # let google library handle this
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User authenticated successfully",
      "data": null,
      "error": null,
      "session": "session_token",
      "username": "username"
    }
    ```

- **POST /logout**
  - **Description**: Log out the current user.
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User logged out successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /logouteverywhere**
  - **Description**: Log out the user from all sessions.
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User logged out from all sessions successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

### User Profile Management

- **DELETE /fastprofile**
  - **Description**: Delete the user profile quickly (for testing purposes).
  - **body**:
    ```json
    {
      "password": "password"
    }
    ```
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User profile deleted successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **DELETE /profile**
  - **Description**: Delete the user profile.
  - **body**:
    ```json
    {
      "password": "password"
    }
    ```
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User profile deleted successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **DELETE /profile/confirm**
  - **Description**: Confirm the deletion of the user profile.
  - **body**:
    ```json
    {
      "token": "confirmation_token"
    }
    ```
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "User profile deletion confirmed",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /profile_picture**
  - **Description**: Upload a profile picture.
  - **body**: `profilepicture` (file)
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Profile picture uploaded successfully",
      "data": {
        "fileName": "uploaded_file_name"
      },
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **GET /profile_picture**
  - **Description**: Get the profile picture.
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: The profile picture file.

- **DELETE /profile_picture**
  - **Description**: Delete the profile picture.
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Profile picture deleted successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

### Session Management

- **GET /sessions**
  - **Description**: Get all sessions of the user.
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Sessions retrieved successfully",
      "data": {
        "sessions": [
          {
            "session_id": "session_id",
            "session_type": "default",
            "expire": "expiration_date",
            "user_agent": "user_agent",
            "connexionIp": "ip_address"
          }
        ]
      },
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **DELETE /sessions**
  - **Description**: Delete specific sessions of the user.
  - **body**:
    ```json
    {
      "sessionsIds": ["session_id1", "session_id2"]
    }
    ```
  - **header**:
    ```json
    {
      "session": "xxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Sessions deleted successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

### Password Management

- **POST /forgotpassword**
  - **Description**: Initiate the forgot password process.
  - **body**:
    ```json
    {
      "email": "email@example.com"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Email sent successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /resetpassword**
  - **Description**: Reset the user's password.
  - **body**:
    ```json
    {
      "resetToken": "reset_token",
      "newPassword": "new_password"
    }
    ```
  - **Response**: 
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "Password reset successfully",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

## Data Format

All API responses will be returned in the following format:

```json
{
  "status": 200,
  "messageStatus": "success",
  "message": "Description of the result",
  "data": null,
  "error": null,
  "session": "session_token",
  "username": "username"
}
```

- **status**: HTTP status code of the response.
- **messageStatus**: A short status message.
- **message**: A detailed message about the result.
- **data**: Any additional data returned by the API.
- **error**: Any error message if an error occurred.
- **session**: The session token if applicable.
- **username**: The username if applicable.


## Possible Errors

### User Registration and Authentication

- **POST /fastregister**
  - **Status**: 401
  - **Message**: "unauthorised"
  - **Reason**: User is already logged in.

  - **Status**: 400
  - **Message**: "missing_informations"
  - **Reason**: Some of the information were not provided.

  - **Status**: 400
  - **Message**: "email_already_exist"
  - **Reason**: An account with the provided email already exists.

  - **Status**: 400
  - **Message**: "username_already_exist"
  - **Reason**: An account with the provided username already exists.

  - **Status**: 500
  - **Message**: "error"
  - **Reason**: Error while creating session or registering.

- **POST /register**
  - **Status**: 401
  - **Message**: "unauthorised"
  - **Reason**: User is already logged in.

  - **Status**: 400
  - **Message**: "missing_informations"
  - **Reason**: Some of the information were not provided.

  - **Status**: 400
  - **Message**: "email_already_exist"
  - **Reason**: An account with the provided email already exists.

  - **Status**: 400
  - **Message**: "username_already_exist"
  - **Reason**: An account with the provided username already exists.

  - **Status**: 500
  - **Message**: "error"
  - **Reason**: Error while registering.

- **POST /register/verify**
  - **Status**: 400
  - **Message**: "missing_informations"
  - **Reason**: No token was provided.

  - **Status**: 404
  - **Message**: "notfound"
  - **Reason**: The provided token doesn't exist or is expired.

  - **Status**: 404
  - **Message**: "notfound"
  - **Reason**: No user found with the provided token.

  - **Status**: 500
  - **Message**: "error"
  - **Reason**: Error while activating the account.

- **POST /login**
  - **Status**: 401
  - **Message**: "unauthorised"
  - **Reason**: User is already logged in.

  - **Status**: 400
  - **Message**: "missing_informations"
  - **Reason**: Some of the information were not provided.

  - **Status**: 404
  - **Message**: "notfound"
  - **Reason**: No user found with the provided email or username.

  - **Status**: 401
  - **Message**: "incorrect_password"
  - **Reason**: The provided password is incorrect.

  - **Status**: 500
  - **Message**: "error"
  - **Reason**: Error while trying to login.

- **POST /auth/google**
  - **Status**: 401
  - **Message**: "unauthorised"
  - **Reason**: User is already logged in.

  - **Status**: 500
  - **Message**: "errorOccured"
  - **Reason**: An error occurred while trying to register.

- **POST /logout**
  - **Status**: 500
  - **Message**: "errorOccured"
  - **Reason**: An error occurred while trying to logout.

- **POST /logouteverywhere**
  - **Status**: 500
  - **Message**: "errorOccured"
  - **Reason**: An error occurred while trying to logout everywhere.

### User Profile Management

- **DELETE /fastprofile**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

- **DELETE /profile**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

- **DELETE /profile/confirm**
  - **Status**: 400
  - **Message**: "Invalid token"
  - **Reason**: The confirmation token is invalid or expired.

- **POST /profile_picture**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

- **GET /profile_picture**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

- **DELETE /profile_picture**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

### Session Management

- **GET /sessions**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

- **DELETE /sessions**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

### Password Management

- **POST /forgotpassword**
  - **Status**: 400
  - **Message**: "Email not found"
  - **Reason**: The provided email is not registered.

- **POST /resetpassword**
  - **Status**: 400
  - **Message**: "Invalid token"
  - **Reason**: The reset token is invalid or expired.