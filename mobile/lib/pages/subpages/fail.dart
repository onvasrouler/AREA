import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';
import 'package:go_router/go_router.dart';

class FailPage extends StatefulWidget {
  const FailPage({super.key});

  @override
  _FailState createState() => _FailState();
}

class _FailState extends State<FailPage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
        child: SizedBox(
          width: 300,
          child: Column(
            children: [ 
              const SizedBox(
                height: 300,
              ),
              const Text(
                "Action failed",
                style: TextStyle(
                  fontSize: 30, 
                  fontWeight: FontWeight.bold
                ),
              ),
              const SizedBox(
                height: 30,
              ),
              ElevatedButton(
                onPressed: () {
                  GoRouter.of(context).push('/menu');
                },
                style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                backgroundColor: buttonColor,
                foregroundColor: Colors.black,
                side: const BorderSide(color: Colors.black),
                ),
                child: const Text(
                  'Back to menu',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
