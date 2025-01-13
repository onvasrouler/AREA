import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/auth.service.dart';
import 'package:area/constant/constant.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  _ResetPasswordState createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPasswordPage> {
  late TextEditingController _code;
  late TextEditingController _password;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _code = TextEditingController();
    _password = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _code.dispose();
    _password.dispose();
    super.dispose();
  }

  final authService = AuthService();


  Future<void> _resetPassword() async {
    final response = await authService.resetPassword(_code.text, _password.text);
    if (response) {
      GoRouter.of(context).push('/login');
    } else {
      setState(() {
        error = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 300,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: containerColor,
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Reset password',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _code,
                    decoration: const InputDecoration(
                      labelText: 'Verification code',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _password,
                    decoration: const InputDecoration(
                      labelText: 'New password',
                      border: OutlineInputBorder(),
                    ),
                  ),              
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: _resetPassword,
                    child: Container(
                      width: 250,
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: buttonColor,
                      ),
                      child: const Center(
                        child: Text(
                          "Reset password",
                          style: TextStyle(
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 60,
            left: 10,
            child: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                GoRouter.of(context).pop();
              },
            ),
          ),
        ],
      )
    );
  }
}