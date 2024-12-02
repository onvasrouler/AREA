//import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
//import 'package:google_sign_in/google_sign_in.dart';
//import 'package:area/constant/constant.dart';
//import 'dart:convert';

class AuthService {
  Future<bool> signIn(String username, String password) async {
    return true;
  }

  Future<bool> signUp(String username, String password) async {
    return true;
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
