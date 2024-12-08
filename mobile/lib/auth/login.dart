import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/auth.service.dart';
import 'package:area/constant/constant.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<LoginPage> {
  late TextEditingController _username;
  late TextEditingController _password;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _username = TextEditingController();
    _password = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  final authService = AuthService();


  Future<void> _login() async {
    final response = await authService.login(_username.text, _password.text);
    if (response) {
      GoRouter.of(context).push('/menu');
    } else {
      setState(() {
        error = true;
      });
    }
  }

  final GoogleLoginService googleLoginService = GoogleLoginService();

  Future<void> _loginGoogle() async {
    final response = await googleLoginService.loginWithGoogle(context);
    if (response) {
      GoRouter.of(context).push('/menu');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
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
                'Login',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _username,
                decoration: const InputDecoration(
                  labelText: 'Username',
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
              if (error)
                const Text(
                  'Wrong mail or password',
                 style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red),
                ),
              
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.center,
                child: TextButton(
                  onPressed: () {
                    GoRouter.of(context).push('/register');
                  },
                  child: const Text(
                    'Register',
                    style: TextStyle(color: Color.fromARGB(255, 27, 27, 28)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _login,
                style: ElevatedButton.styleFrom(
                  backgroundColor: buttonColor,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 50),
                  side: const BorderSide(color: Colors.black),
                ),
                child : const Text('Login'),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: _loginGoogle,
                icon: const Icon(Icons.g_mobiledata),
                label: const Text('Continue with Google'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: buttonColor,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 50),
                  side: const BorderSide(color: Colors.black),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
