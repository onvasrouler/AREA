import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/auth.service.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUpPage> {
  late TextEditingController _email;
  late TextEditingController _password;
  bool loader = false;

  @override
  void initState() {
    _email = TextEditingController();
    _password = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  final authService = AuthService();

  Future<void> _signUp() async {
    final response = await authService.signUp(_email.text, _password.text);

    if (response) {
      GoRouter.of(context).push('/menu');
    }
  }

  final GoogleSignInService googleSignInService = GoogleSignInService();

  Future<void> _signInGoogle() async {
    final response = await googleSignInService.signInWithGoogle(context);
    if (response) {
      GoRouter.of(context).push('/menu');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 241, 237, 233),
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 300,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color.fromARGB(255, 241, 237, 233),
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
                    'Sign up',
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
                  TextField(
                    controller: _password,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _signUp,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                      backgroundColor: const Color.fromARGB(255, 241, 237, 233),
                      foregroundColor: Colors.black,
                      side: const BorderSide(color: Colors.grey),
                    ),
                    child : const Text('Sign up'),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: _signInGoogle,
                    icon: const Icon(Icons.g_mobiledata),
                    label: const Text('Continue with Google'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color.fromARGB(255, 241, 237, 233),
                      foregroundColor: Colors.black,
                      minimumSize: const Size(double.infinity, 50),
                      side: const BorderSide(color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 40,
            left: 20,
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
