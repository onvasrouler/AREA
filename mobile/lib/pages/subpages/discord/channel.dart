import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';

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
                          "Choose an channel",
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
                        currentChannel = index - 1;
                        GoRouter.of(context).push('/areaName');
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
