import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/auth.service.dart';

class ServiceReactionPage extends StatefulWidget {
  const ServiceReactionPage({super.key});

  @override
  State<ServiceReactionPage> createState() => _ServiceReactionPageState();
}

class _ServiceReactionPageState extends State<ServiceReactionPage> {

  @override
  void initState() {
    super.initState();
  }

  final gitHubAuthService = GitHubAuthService();
  final discordAuthService = DiscordAuthService();

  Future<void> _connect(String name, int index) async {
    var response = false;

    if (name == "GitHub") {
      response = await gitHubAuthService.authGitHub();
    } else if (name == "Discord") {
      response = await discordAuthService.authDiscord();
    }
    
    if (response) {
      currentReactionService = index - 1;
      reactions[index-1].connected = true;
      GoRouter.of(context).push('/reaction');
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
              itemCount: reactions.length + 1,
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
                        if (reactions[index - 1].name == "Mail") {
                          GoRouter.of(context).push('/sendMail');
                        }
                        if (reactions[index - 1].connected) {
                          currentActionService = index - 1;
                          GoRouter.of(context).push('/reaction');
                        } else {
                          _connect(actions[index - 1].name, index);
                        }
                      },
                      child:Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          color: buttonColor,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 10,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Center(
                          child: SizedBox(
                            height: 200,
                            width: 200,
                            child: Image.asset(
                              reactions[index - 1].image,
                              fit: BoxFit.contain,
                            ),
                          )
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
