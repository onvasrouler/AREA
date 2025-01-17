import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/action.service.dart';

class ChannelPage extends StatefulWidget {
  const ChannelPage({super.key});

  @override
  State<ChannelPage> createState() => _ChannelPageState();
}

class _ChannelPageState extends State<ChannelPage> {

  @override
  void initState() {
    super.initState();
  }

  final actionService = ActionService();

  Future<void> _action() async {
    final response = await actionService.sendActionWithDiscordReactionChannel();

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
            child: ListView.builder(
              itemCount: discordChannel.length + 1,
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
                              currentReaction = 0;
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
                        currentChannel = index - 1;
                        _action();
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
                            discordChannel[index - 1]["name"],
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
