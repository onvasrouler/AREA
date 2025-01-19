import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/user.service.dart';

class ServerPage extends StatefulWidget {
  const ServerPage({super.key});

  @override
  State<ServerPage> createState() => _ServerPageState();
}

class _ServerPageState extends State<ServerPage> {

  @override
  void initState() {
    super.initState();
  }

  final userService = UserService();

  Future<void> _channel() async {
    final response = await userService.getChannel(discordServer[currentServer]["id"]);

    if (response) {
      GoRouter.of(context).push('/channel');
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
              itemCount: discordServer.length + 1,
              itemBuilder:(context, index) {
                if (index == 0) {
                  return SizedBox(
                    height: 150,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 25),
                              child: IconButton(
                                icon: const Icon(Icons.arrow_back),
                                onPressed: () {
                                  currentActionService = 0;
                                  GoRouter.of(context).pop();
                                },
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 20),
                        Text(
                          "Choose an server",
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 25,
                          ),
                        ),
                      ],
                    )
                  );
                }
                return Column(
                  children: [
                    GestureDetector(
                      onTap: () 
                      {
                        currentServer = index - 1;
                        _channel();
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
                            discordServer[index - 1]["name"],
                            style: const TextStyle(
                              fontSize: 20,
                              fontStyle: FontStyle.italic,
                              color: Colors.white,
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
