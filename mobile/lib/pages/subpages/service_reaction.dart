import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';

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

  @override
    Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          Center(
            child: ListView.builder(
              itemCount: services.length + 1,
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
                                GoRouter.of(context).push('/signIn');
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
                return Column(
                  children: [
                    GestureDetector(
                      onTap: () 
                      {
                        if (services[index - 1].connected) {
                          currentReactionService = index - 1;
                          GoRouter.of(context).push('/reaction');
                        } else {
                          //methode pour se connecter (fonction orientation)
                          //si reussi ->
                          // currentActionService = index - 1;
                          //aller page de action
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
