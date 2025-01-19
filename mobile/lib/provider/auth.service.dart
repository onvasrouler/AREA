import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';
import 'dart:convert';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:area/provider/user.service.dart';
import 'package:flutter_web_auth/flutter_web_auth.dart';

class AuthService {
  final userService = UserService();

  Future<bool> login(String email, String password) async {
    final url = Uri.parse('$baseurl/login');

    final Map<String, dynamic> requestBody = {
      "emailOrUsername": email,
      "password": password,
    };

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);
        session = data['session'];

        await userService.getUserInfo();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> register(String email, String username, String password) async {
    final url = Uri.parse('$baseurl/register');

    final Map<String, dynamic> requestBody = {
      "email": email,
      "username": username,
      "password": password,
    };

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> confirmEmail(String code) async {
    final url = Uri.parse('$baseurl/register/verify');

    final Map<String, dynamic> requestBody = {
      "token": code,
    };

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);
        session = data['session'];

        await userService.getUserInfo();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> logout() async {
    final url = Uri.parse('$baseurl/logout');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {
        session = "";
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> logoutEverywhere() async {
    final url = Uri.parse('$baseurl/logouteverywhere');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {
        session = "";
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> deleteProfile(String password) async {
    final url = Uri.parse('$baseurl/profile');

    final Map<String, dynamic> requestBody = {
      "password": password,
    };

    try {
      final response = await http.delete(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        session = "";
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  
  Future<bool> forgotPassword(String email) async {
    final url = Uri.parse('$baseurl/forgotpassword');

    final Map<String, dynamic> requestBody = {
      "email": email,
    };

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> resetPassword(String code, String password) async {
    final url = Uri.parse('$baseurl/resetpassword');

    final Map<String, dynamic> requestBody = {
      "resetToken": code,
      "newPassword": password,
    };

    print(requestBody);

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

class GoogleLoginService {
  final userService = UserService();
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Future<bool> loginWithGoogle(BuildContext context) async {
    String? token;

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        return false;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      token = googleAuth.accessToken;

      print(token);

    } catch (error) {
      print(error);
      return false;
    }

    final url = Uri.parse('$baseurl/mobileauth/google');

    final Map<String, dynamic> requestBody = {
      "token": token,
    };

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);
        session = data['session'];

        await userService.getUserInfo();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

class DiscordAuthService {

  final String clientId = info["DISCORD_CLIENT_ID"] ?? "";
  final String redirectUri = "$baseurl/discord_manager";
  final String authUrl = "https://discord.com/api/oauth2/authorize";

  Future<bool> authDiscord() async {
    try {
      final authEndpoint = Uri.parse(
        "$authUrl?client_id=$clientId&redirect_uri=$redirectUri&response_type=code&scope=identify%20guilds"
      );

      final result = await FlutterWebAuth.authenticate(
        url: authEndpoint.toString(),
        callbackUrlScheme: "myapp",
      );

      final code = Uri.parse(result).queryParameters['code'];

      print(code);
      
      if (code == null) {
        return false;
      }

      final url = Uri.parse('$baseurl/mobileauth/callback/discord');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode({
          "code": code,
        })
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  Future<bool> logoutDiscord() async {
    try {
      final url = Uri.parse('$baseurl/logout/discord');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }
}

class GitHubAuthService {

  final String clientId = info["GITHUB_CLIENT_ID"] ?? "";
  final String redirectUri = "myapp://github";
  final String authUrl = "https://github.com/login/oauth/authorize";
  
  Future<bool> authGitHub() async {
    try {
      final authEndpoint = Uri.parse(
        "$authUrl?client_id=$clientId&redirect_uri=$redirectUri&scope=repo%20read:user"
      );

      final result = await FlutterWebAuth.authenticate(
        url: authEndpoint.toString(),
        callbackUrlScheme: Uri.parse(redirectUri).scheme,
      );

      final code = Uri.parse(result).queryParameters['code'];
      if (code == null) {
        return false;
      }
        
      final url = Uri.parse('$baseurl/auth/callback/github');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode({
          "code": code,
        })
      );

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  Future<bool> logoutGithub() async {
    try {
      final url = Uri.parse('$baseurl/logout/github');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }
}


class SpotifyAuthService {

  final String clientId = info["SPOTIFY_CLIENT_ID"] ?? "";
  final String redirectUri = "myapp://spotify";
  final String authUrl = "https://accounts.spotify.com/authorize";
  
  Future<bool> authSpotify() async {
    try {
      final authEndpoint = Uri.parse(
        "$authUrl?response_type=code&client_id=$clientId&redirect_uri=$redirectUri&scope=user-read-private%20user-read-email"
      );

      final result = await FlutterWebAuth.authenticate(
        url: authEndpoint.toString(),
        callbackUrlScheme: Uri.parse(redirectUri).scheme,
      );

      final code = Uri.parse(result).queryParameters['code'];
      if (code == null) {
        return false;
      }
        
      print(code);

      final url = Uri.parse('$baseurl/mobileauth/callback/spotify');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode({
          "code": code,
        })
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  Future<bool> logoutSpotify() async {
    try {
      final url = Uri.parse('$baseurl/logout/spotify');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }
}

class TwitchAuthService {

  final String clientId = "0elzk3f1nb2kcye60vdhmfal7uv19d";
  final String redirectUri = "$baseurl/twitch_manager";
  final String authUrl = "https://id.twitch.tv/oauth2/authorize";
  
  Future<bool> authTwitch() async {
    try {
      final authEndpoint = Uri.parse(
        "$authUrl?response_type=code&client_id=$clientId&redirect_uri=$redirectUri&scope=user:read:email"
      );

      final result = await FlutterWebAuth.authenticate(
        url: authEndpoint.toString(),
        callbackUrlScheme: Uri.parse(redirectUri).scheme,
      );

      final code = Uri.parse(result).queryParameters['code'];
      if (code == null) {
        return false;
      }
        
      final url = Uri.parse('$baseurl/mobileauth/callback/twitch');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode({
          "code": code,
        })
      );

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  Future<bool> logoutTwitch() async {
    try {
      final url = Uri.parse('$baseurl/logout/twitch');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
          return true;
      } else {
          return false;
      }
    } catch (e) {
      return false;
    }
  }
}
