import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';
import 'dart:convert';
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
    final url = Uri.parse('$baseurl/fastregister');

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
}

class GoogleLoginService {
  Future<bool> loginWithGoogle(BuildContext context) async {
    return false;
  }
}

class DiscordAuthService {

  final String clientId = "";
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
      print("result = $result");

      final code = Uri.parse(result).queryParameters['code'];
      if (code == null) {
        return false;
      }

      final url = Uri.parse('$baseurl/auth/callback/discord');

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

      if (response.statusCode == 500) {
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

  final String clientId = "";
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
}
