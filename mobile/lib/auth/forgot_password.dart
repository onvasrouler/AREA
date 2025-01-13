import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/auth.service.dart';
import 'package:area/constant/constant.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  _ForgotPasswordState createState() => _ForgotPasswordState();
}

class _ForgotPasswordState extends State<ForgotPasswordPage> {
  late TextEditingController _email;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _email = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  final authService = AuthService();


  Future<void> _askNewPassword() async {
    final response = await authService.forgotPassword(_email.text);
    if (response) {
      GoRouter.of(context).push('/resetPassword');
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
                    'Forgot Password',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _email,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                    ),
                  ),              
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: _askNewPassword,
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