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

## AREA examples 

- **USAGE**:
    ```json 
    {
      "action": {
        "service": "discord",
        "arguments": {
          "on": [
            "/repo",
            "/pr",
            "/issue",
            "/commit"
          ],
          "userId": "*"
        }
      },
      "reaction": {
        "service": "github",
        "arguments": {
          "content": [
            "issues",
            "pr",
            "commit",
            "repo"
          ],
          "prefix": "*"
        }
      }
    }
    ```
- **example**:
  ```json
  {
      "action": {
          "service": "discord",
          "arguments": {
              "on": "/repo",
              "userId": "431930188255854613"
          }
      },
      "reaction": {
          "service": "github",
          "arguments": {
              "content": "repo",
              "prefix": "here is your repos:"
          }
      }
  }
  ```
  - **explanation**
  - for action:
      first for action arguments on will be the command that trigger the action in this case it is /repo
      userId will link the action reaction to a specific discord user by default set your discord id
  - for reaction:
      we have the content, this define what will be returned in this case it will be the user's repo
      the prefix will be a message sent before every other

- **USAGE 2**:
  ```json
    {
      "action": {
          "service": [
              "github"
          ],
          "arguments": {
              "on": [
                  "new_issue",
                  "new_repo",
                  "new_commit",
                  "new_pr"
              ]
          }
      },
      "reaction": {
          "service": [
              "discord"
          ],
          "arguments": {
              "react": [
                  "message",
                  "private_message"
              ],
              "server": "*",
              "channel":"*",
              "userID": "*"
              "message": [
                  "A new PR has been opened!",
                  "A new issue has been opened!",
                  "A new commit has been pushed!",
                  "A new repo has been created!"
              ]
          }
      }
  }
  ```
- **example**:
  ```json
    {
        "action": {
            "service": "github",
            "arguments": {
                "on": "new_issue"
            }
        },
        "reaction": {
            "service": "discord",
            "arguments": {
                "react": "private_message",
                "userId": "431930188255854613",
                "message": "A new issue has been opened!"
            }
        }
    }
    ```
  - **explanation**
  - action
      in this example we define the argument on to new issue so the reaction will be triggered when a new issue is created
  - reaction
      here we define the argument so the bot will send a private message
      then we define the id of the user that will receive the message
      finally the message that will be sent
    
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

- **GET /profile_info**
  - **Description**: Return some infos about the user.
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
      "message": "you are authenticated",
      "data": {
            "username": "req.user.username",
            "email": "req.user.email",
            "account_type": "req.user.accountType",
            "logged_in_discord": "true : false",
            "logged_in_github": "true : false",
        },
      "error": null,
      "session": null,
      "username": null
    }
    ```

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

### OAuth Endpoints

- **POST /auth/callback/discord**
  - **Description**: Handle Discord OAuth callback.
  - **body**:
    ```json
    {
      "code": "authorization_code"
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
      "message": "Discord token has been saved",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /auth/refresh/discord**
  - **Description**: Refresh Discord OAuth token.
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
      "message": "Discord token has been saved",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /auth/callback/github**
  - **Description**: Handle GitHub OAuth callback.
  - **body**:
    ```json
    {
      "code": "authorization_code"
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
      "message": "Github token has been saved",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **POST /auth/refresh/github**
  - **Description**: Github refresh token.
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
      "message": "Github token has been refreshed",
      "data": null,
      "error": null,
      "session": null,
      "username": null
    }
    ```

### Discord Endpoints
- **GET /invite_discord_bot**
  - **Description**: Return an invitation link for the discord Bot.
  - **Response**:
    ```json
    {
      "status": 200,
      "messageStatus": "success",
      "message": "discord invitation link getted with success",
      "data": "InvitationLink",
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **GET /get_my_discord_server**
  - **Description**: Return a list of the discord server where the user is admin and the bot is.
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
      "message": "list of matching guilds get with success",
      "data": [
        {
            "id": "guild.id",
            "name": "guild.name",
            "icon": "guild.icon"
        }
      ],
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **GET /get_list_of_channels**
  - **Description**: Return a list of the text channels of a discord server ( if the bot is present in this server).
    - **query**:
    ```json
    {
      "guildId": "guild.id"
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
      "message": "list of text channel of this server got with success",
      "data": [
        {
            "id": "channel.id",
            "name": "channel.name",
        }
      ],
      "error": null,
      "session": null,
      "username": null
    }
    ```

### Github endpoint

- **GET /get_pull_requests**
  - **Description**: Return a list of the current pull request that the user opened.
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
      "message": "your github pull requests have been fetched with success",
      "data": "pull requests list",
      "error": null,
      "session": null,
      "username": null
    }
    ```

- **GET /get_my_repos**
  - **Description**: Return a list of the repository the user is in.
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
      "message": "your github repository have been fetched with succes",
      "data": "user's repo list",
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

- **GET /profile_info**
  - **Status**: 401
  - **Message**: "Invalid session"
  - **Reason**: The session token is invalid or expired.

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

### 0Auth endpoint

- **POST /auth/callback/discord**
  - **Status**: 400
  - **Message**: "code is required"
  - **Reason**: no code provided in the request body.

  - **Status**: 500
  - **Message**: "An error occured while trying to get the discord token"
  - **Reason**: probably because the given code is invalid so the back couldn't turn it in a token.

- **POST /auth/refresh/discord**
  - **Status**: 400
  - **Message**: "you first have to login to discord to be able to refresh your token"
  - **Reason**: you first have to login to discord.

  - **Status**: 500
  - **Message**: "An error occured while trying to get the discord token"
  - **Reason**: this occur when the refresh token wasn't correct so you have to reconnect to discord.

- **POST /auth/callback/github**
  - **Status**: 400
  - **Message**: "code is required"
  - **Reason**: no code provided in the request query.

  - **Status**: 500
  - **Message**: "An error occured while trying to get the github token"
  - **Reason**: the provided code wasn't correct so the back couldn't turn it in a token.

- **POST /auth/callback/github**
  - **Status**: 500
  - **Message**: "An error occured while trying to get the github token"
  - **Reason**: the back couldn't refresh the token in this case delete the github token.

### API endpoint

- **GET /get_my_discord_server**
  - **Status**: 401
  - **Message**: "you are not logged in using discord"
  - **Reason**: the user didn't logged in using the discord 0Auth.

  - **Status**: 401
  - **Message**: "your discord token is expired"
  - **Reason**: your discord token is expired you'll have to refresh it.

- **GET /get_list_of_channels**
  - **Status**: 401
  - **Message**: "you are not logged in using discord"
  - **Reason**: the user didn't logged in using the discord 0Auth.

  - **Status**: 401
  - **Message**: "your discord token is expired"
  - **Reason**: your discord token is expired you'll have to refresh it.

  - **Status**: 400
  - **Message**: "guildId is required"
  - **Reason**: no guild Id provided in the request query.

  - **Status**: 400
  - **Message**: "you are not admin of this guild or the bot is not present there"
  - **Reason**: the given guild id correspond to a guild where the user isn't admin or the bot isn't present or the guild simply doesn't exist.

- **GET /get_pull_requests**
  - **Status**: 401
  - **Message**: "you are not logged in using github"
  - **Reason**: ther user didn't logged in using github 0auth.

- **GET /get_my_repos**
  - **Status**: 401
  - **Message**: "you are not logged in using github"
  - **Reason**: ther user didn't logged in using github 0auth.