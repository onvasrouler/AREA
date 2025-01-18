import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/action.service.dart';
import 'package:area/constant/constant.dart';

class SendMailPage extends StatefulWidget {
  const SendMailPage({super.key});

  @override
  _SendMailState createState() => _SendMailState();
}

class _SendMailState extends State<SendMailPage> {
  late TextEditingController _email;
  late TextEditingController _name;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _email = TextEditingController();
    _name = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _email.dispose();
    _name.dispose();
    super.dispose();
  }

  final actionService = ActionService();

  Future<void> _sendMail() async {
    final response = await actionService.sendActionWithMailReaction( _email.text);

    if (response) {
      GoRouter.of(context).push('/success');
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
                    'Choose an email',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller:  _email,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller:  _name,
                    decoration: const InputDecoration(
                      labelText: 'Area\'s name',
                      border: OutlineInputBorder(),
                    ),
                  ), 
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: () {
                      areasName = _name.text;
                      _sendMail();
                    },
                    child: Container(
                      width: 250,
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: buttonColor,
                      ),
                      child: const Center(
                        child: Text(
                          "Valid mail",
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
