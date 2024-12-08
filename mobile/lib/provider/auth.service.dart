import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';
import 'dart:convert';

class AuthService {
  Future<bool> signIn(String email, String password) async {
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
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> signUp(String email, String username, String password) async {
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
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

class GoogleSignInService {
  Future<bool> signInWithGoogle(BuildContext context) async {
    return true;
      
  }

  Future<bool> sendAuthCodeToBackend(String? accessToken) async {
    return true;
  }
}

class DiscordAuthService {
  Future<bool> authDiscord(BuildContext context) async {
    return true;
      
  }
}

class GitHubAuthService {
  Future<bool> authGitHub(BuildContext context) async {
    return true;
      
  }
}
