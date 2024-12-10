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

  final authService = AuthService();

  Future<void> _logout() async {
    final response = await authService.logout();

    if (response) {
      GoRouter.of(context).push('/login');
    }
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
      services[index-1].connected = true;
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
              itemCount: services.length + 2,
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
                              currentAction = 0;
                              GoRouter.of(context).pop();
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 200.0),
                          child: PopupMenuButton<String>(
                            icon: const CircleAvatar(
                              backgroundColor: Color.fromARGB(255, 225, 220, 216),
                              radius: 30,
                            ),
                            onSelected: (String value) {
                              if (value == 'logout') {
                                _logout();
                              }
                            },
                            itemBuilder: (BuildContext context) {
                              return [
                                const PopupMenuItem<String>(
                                  value: 'logout',
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.logout, 
                                        color: Colors.red
                                      ),
                                      Text('Logout'),
                                    ],
                                  ),
                                ),
                              ];
                            },
                            color: containerColor,
                          ),
                        ),
                      ],
                    ),
                  );
                }
                if (index == services.length + 1) {
                  return Column(
                    children: [
                      GestureDetector(
                        onTap: () 
                        {
                          GoRouter.of(context).push('/success');
                          //verify the result
                          currentReactionService = -1;
                        },
                        child:Container(
                          width: 300,
                          height: 100,
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
                          child: const Center(
                            child: Text(
                              "No Reaction",
                              style: TextStyle(
                                fontSize: 20,
                                fontStyle: FontStyle.italic,
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
                }
                return Column(
                  children: [
                    GestureDetector(
                      onTap: () 
                      {
                        if (services[index - 1].connected) {
                          currentReactionService = index - 1;
                          GoRouter.of(context).push('/reaction');
                        } else {
                          _connect(services[index - 1].name, index);
                        }
                      },
                      child:Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          color: services[index - 1].color,
                          image: DecorationImage(
                            image: AssetImage(services[index - 1].image),
                            fit: BoxFit.fitWidth,
                          ),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 10,
                              spreadRadius: 5,
                            ),
                          ],
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
