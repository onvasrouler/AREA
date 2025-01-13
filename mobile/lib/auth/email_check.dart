import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/auth.service.dart';
import 'package:area/constant/constant.dart';

class ConfirmEmailPage extends StatefulWidget {
  const ConfirmEmailPage({super.key});

  @override
  _ConfirmEmailState createState() => _ConfirmEmailState();
}

class _ConfirmEmailState extends State<ConfirmEmailPage> {
  late TextEditingController _code;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _code = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  final authService = AuthService();


  Future<void> _confirmMail() async {
    final response = await authService.confirmEmail(_code.text);
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
                    'Confirm your email',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _code,
                    decoration: const InputDecoration(
                      labelText: 'Code',
                      border: OutlineInputBorder(),
                    ),
                  ),              
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: _confirmMail,
                    child: Container(
                      width: 250,
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: buttonColor,
                      ),
                      child: const Center(
                        child: Text(
                          "Create account",
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