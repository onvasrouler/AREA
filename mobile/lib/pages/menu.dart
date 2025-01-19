import 'package:area/provider/user.service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/auth.service.dart';

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

  final authService = AuthService();
  final userService = UserService();

  Future<void> _logout() async {
    final response = await authService.logout();

    if (response) {
      GoRouter.of(context).push('/login');
    }
  }

  Future<void> _profile() async {
    final response = await userService.getSession();

    if (response) {
      GoRouter.of(context).push('/profil');
    } else {
      showSnackBar(context, "Error to load sessions", false);
    }
  }

  Future<void> _areas() async {
    final response = await userService.getArea();

    if (response) {
      GoRouter.of(context).push('/yourArea');
    } else {
      showSnackBar(context, "Error to load area", false);
    }
  }

  final gitHubAuthService = GitHubAuthService();
  final discordAuthService = DiscordAuthService();
  final spotifyAuthService = SpotifyAuthService();
  final twitchAuthService = TwitchAuthService();

  Future<void> _connect(String name, int index) async {
    var response = false;

    if (name == "GitHub") {
      response = await gitHubAuthService.authGitHub();
    } else if (name == "Discord") {
      response = await discordAuthService.authDiscord();
    } else if (name == "Twitch") {
      response = await twitchAuthService.authTwitch();
    } else if (name == "Spotify") {
      response = await spotifyAuthService.authSpotify();
    }

    if (response) {
      currentActionService = index - 1;
      actions[index-1].connected = true;
      GoRouter.of(context).push('/action');
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
              itemCount: actions.length + 1,
              itemBuilder:(context, index) {
                if (index == 0) {
                  return SizedBox(
                    height: 150,
                    child: Column(
                      children: [
                            Row(
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 30.0),
                              child: GestureDetector(
                                onTap: _areas,
                                child: Container(
                                  width:  80,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(10),
                                    color: backgroundColor,
                                    border: Border.all(
                                      color: buttonColor,
                                      width: 3,
                                    )
                                  ),
                                  child: const Center(
                                    child: Text(
                                      "Your Areas",
                                      style: TextStyle(
                                        color: Colors.blueGrey,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(left: 190.0),
                              child: PopupMenuButton<String>(
                                icon: const Icon(
                                  Icons.account_circle,
                                  size: 50,
                                ),
                                onSelected: (String value) {
                                  if (value == 'logout') {
                                    _logout();
                                  }
                                  if (value == 'profile') {
                                    _profile();
                                  }
                                },
                                itemBuilder: (BuildContext context) {
                                  return [
                                    const PopupMenuItem<String>(
                                      value: 'profile',
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.account_box, 
                                            color: Colors.grey
                                          ),
                                          SizedBox(width: 4),
                                          Text('Profile'),
                                        ],
                                      ),
                                    ),
                                    const PopupMenuItem<String>(
                                      value: 'logout',
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.logout, 
                                            color: Colors.red
                                          ),
                                          SizedBox(width: 4),
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
                        SizedBox(height: 20),
                        Text(
                          "Choose a service",
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 25,
                          ),
                        ),
                      ]
                    ),
                  );
                }
                return Column(
                  children: [
                    GestureDetector(
                      onTap: () 
                      {
                        if (actions[index - 1].connected) {
                          currentActionService = index - 1;
                          GoRouter.of(context).push('/action');
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
                              actions[index - 1].image,
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
