import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
//import 'package:area/constant/constant.dart';
//import 'package:go_router/go_router.dart';

class MenuPage extends StatefulWidget {
  const MenuPage({super.key});

  @override
  State<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends State<MenuPage> {

  @override
  void initState() {
    super.initState();
  }

  @override
    Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 241, 237, 233),
      body: Stack(
        children: [
          Center(
            child: ListView.builder(
              itemCount: 6,
              itemBuilder:(context, index) {
                if (index == 0) {
                  return SizedBox(
                    height: 150,
                    child: Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 25),
                          child: GestureDetector(
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (context) => ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ).then((_) {
                                setState(() {});
                              });
                            },
                            child: Container(
                              height: 50,
                              width: 80,
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 225, 220, 216),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: const Center(
                                child: Text("Reactions"),
                              )
                            ),
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
                                GoRouter.of(context).go('/signIn');
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
                            color: const Color.fromARGB(255, 241, 237, 233),
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return Column(
                  children: [
                    Container(
                      width: 300,
                      height: 300,
                      decoration: BoxDecoration(
                        color: const Color.fromARGB(255, 241, 237, 233),
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
