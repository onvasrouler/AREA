import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';

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
    return Scaffold(
      backgroundColor: backgroundColor,
      body: const Center(
        child: Text(
          "Error 404 : Page not found",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        )
      ),
    );
  }
}
