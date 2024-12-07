import 'package:flutter/material.dart';

class ErrorPage extends StatefulWidget {
  const ErrorPage({super.key});

  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<ErrorPage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color.fromARGB(255, 241, 237, 233),
      body: Center(
        child: Text(
          "Error 404 : Page not found",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        )
      ),
    );
  }
}
