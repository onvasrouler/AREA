import 'package:flutter/material.dart';
import 'package:area/constant/constant.dart';
import 'package:go_router/go_router.dart';

class SuccessPage extends StatefulWidget {
  const SuccessPage({super.key});

  @override
  _SuccessState createState() => _SuccessState();
}

class _SuccessState extends State<SuccessPage> {

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
                "Action created",
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
                child: const Text('Back to menu'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
