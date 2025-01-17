import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/user.service.dart';
import 'package:area/provider/action.service.dart';
import 'package:area/constant/constant.dart';

class AreaNamePage extends StatefulWidget {
  const AreaNamePage({super.key});

  @override
  _AreaNameState createState() => _AreaNameState();
}

class _AreaNameState extends State<AreaNamePage> {
  late TextEditingController _name;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _name = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  final userService = UserService();

  Future<void> _server() async {
    final response = await userService.getServer();

    if (response) {
      GoRouter.of(context).push('/server');
    }
  }

  final actionService = ActionService();

  Future<void> _disordmp() async {
    final response = await actionService.sendActionWithDiscordReactionPrivate();

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
                    'Area\'s name',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _name,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(),
                    ),
                  ),              
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: () {
                      areasName = _name.text;
                      if (reactions[currentReactionService].reaction[currentReaction] == "Message in a channel") {
                        _server();
                      } else if (reactions[currentReactionService].reaction[currentReaction] == "Private message") {
                        _disordmp();
                      } else {
                        GoRouter.of(context).push('/fail');
                      }
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
                          "Create Area",
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