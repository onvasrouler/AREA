import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/user.service.dart';

class ReactionPage extends StatefulWidget {
  const ReactionPage({super.key});

  @override
  State<ReactionPage> createState() => _ReactionPageState();
}

class _ReactionPageState extends State<ReactionPage> {

  @override
  void initState() {
    super.initState();
  }

  final userService = UserService();

  Future<void> _server() async {
    final response = await userService.getServer();

    if (response) {
      GoRouter.of(context).push('/server');
    }
  }

  @override
    Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          Center(
            child: ListView.builder(
              itemCount: reactions[currentReactionService].reaction.length + 1,
              itemBuilder:(context, index) {
                if (index == 0) {
                  return SizedBox(
                    height: 150,
                    child: Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 25),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back),
                            onPressed: () {
                              currentReactionService = 0;
                              GoRouter.of(context).pop();
                            },
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return Column(
                  children: [
                    GestureDetector(
                      onTap: () 
                      {
                        currentReaction = index - 1;

                        if (reactions[currentReactionService].reaction[currentReaction] == "Message in a channel") {
                          _server();
                        } else if (reactions[currentReactionService].reaction[currentReaction] == "Private message") {
                          GoRouter.of(context).push('/areaName');
                        } else {
                          GoRouter.of(context).push('/fail');
                        }
                      },
                      child:Container(
                        width: 300,
                        height: 100,
                        decoration: BoxDecoration(
                          color : buttonColor,
                          borderRadius: BorderRadius.circular(20)
                        ),
                        child: Center(
                          child: Text(
                            reactions[currentReactionService].reaction[index - 1],
                            style: const TextStyle(
                              fontSize: 20,
                              fontStyle: FontStyle.italic,
                              color: Colors.white
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 20,
                    )
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
