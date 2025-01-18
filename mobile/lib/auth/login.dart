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
      showSnackBar(context, "Connected", true);
      GoRouter.of(context).push('/menu');
    } else {
      showSnackBar(context, "Connection failed", false);
    }
  }

  final GoogleLoginService googleLoginService = GoogleLoginService();

  Future<void> _loginGoogle() async {
    final response = await googleLoginService.loginWithGoogle(context);
    if (response) {
      showSnackBar(context, "Connected", true);
      GoRouter.of(context).push('/menu');
    } else {
      showSnackBar(context, "Connection failed", false);
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
              const SizedBox(height: 10),
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
                  'Wrong username or password',
                 style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red),
                ),
              
              const SizedBox(height: 15),
              GestureDetector(
                onTap: _login,
                child: Container(
                  width: 250,
                  height: 50,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: buttonColor,
                  ),
                  child: const Center(
                    child: Text(
                      "Login",
                      style: TextStyle(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: _loginGoogle,
                child: Container(
                  width: 250,
                  height: 50,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.white,
                    border: Border.all(
                      color: Colors.grey,
                      width: 2,
                    )
                  ),
                  child: Center(
                    child: Row(
                      children: [
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: Image.asset(
                            'assets/g-logo.png',
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 30),
                        const Text("Continue with Google"),
                      ],
                    )
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.center,
                child: TextButton(
                  onPressed: () {
                    GoRouter.of(context).push('/register');
                  },
                  child: Text(
                    'Register',
                    style: TextStyle(
                      color: buttonColor,
                    ),
                  ),
                ),
              ),
              Align(
                alignment: Alignment.center,
                child: TextButton(
                  onPressed: () {
                    GoRouter.of(context).push('/forgotPassword');
                  },
                  child: Text(
                    'Forgot password !',
                    style: TextStyle(
                      color: buttonColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
