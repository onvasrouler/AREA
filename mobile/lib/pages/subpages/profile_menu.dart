import 'package:area/provider/auth.service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/user.service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late TextEditingController _username;
  late TextEditingController _email;
  late TextEditingController _password;
  late List userSessions;
  late List<Service> allServices = [
  ...actions,
  ...reactions
];

  @override
  void initState() {
    _username = TextEditingController(text: userName);
    _email = TextEditingController(text: userMail);
    _password = TextEditingController();
    userSessions = sessions;
    allServices = [
      ...actions,
      ...reactions
    ];
      super.initState();
  }

  @override
  void dispose() {
    _username.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  int selectedSection = -1;

  final userService = UserService();
  final discordAuthservice = DiscordAuthService();
  final githubAuthservice = GitHubAuthService();
  final spotifyAuthservice = SpotifyAuthService();
  final twitchAuthservice = TwitchAuthService();


  Future<void> _changeUserInfo() async {
    final response = await userService.patchUserInfo(_username.text, _email.text);
    if (response) {
      showSnackBar(context, "Infos changed", true);
    } else {
      showSnackBar(context, "Error", false);
    }
  }

  Future<void> _deleteUser() async {
    final response = await userService.deleteUser(_password.text);
    if (response) {
      session = "";
      GoRouter.of(context).push('/deletreConfirm');
    } else {
      showSnackBar(context, "Error", false);
    }
  }

  Future<void> _deleteSession(String sessionId) async {
    final response = await userService.deleteSession(sessionId);
    if (response) {
      showSnackBar(context, "Sessions deleted", true);
      setState(() {
        userSessions = sessions;
      });
    } else {
      showSnackBar(context, "Error", false);
    }
  }

  Future<void> _deconectionService(String serviceName) async {
    var response = false;

    if(serviceName == "GitHub") {
      response = await githubAuthservice.logoutGithub();
    } else if (serviceName == "Discord") {
      response = await discordAuthservice.logoutDiscord();
    } else if (serviceName == "Spotify") {
      response = await spotifyAuthservice.logoutSpotify();
    } else if (serviceName == "Twitch") {
      response = await twitchAuthservice.logoutTwitch();
    }
    if (response == true) {
      await userService.getUserInfo();

      showSnackBar(context, "Deconnected", true);

      setState(() {
        allServices = [
          ...actions,
          ...reactions
        ];
      });
    } else {
      showSnackBar(context, "Error", false);
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
              itemCount: 5,
              itemBuilder: (context, index) {
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
                          "Profil",
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 25,
                          ),
                        ),
                      ],
                    )
                  );
                } else {
                  return buildButtonWithSection(index);
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget buildButtonWithSection(int index) {
    final titles = [
      "Personal information",
      "Manage session",
      "Manage services auth",
      "Delete profile"
    ];

    return Column(
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              selectedSection = selectedSection == index ? -1 : index;
            });
          },
          child: Container(
            width: 300,
            height: 100,
            decoration: BoxDecoration(
              color: buttonColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                titles[index - 1],
                style: const TextStyle(
                  fontSize: 20,
                  fontStyle: FontStyle.italic,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        if (selectedSection == index) buildSectionContent(index),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget buildSectionContent(int index) {
    switch (index) {
      case 1:
        return buildPersonalInfoSection();
      case 2:
        return buildManageSessionSection();
      case 3:
        return buildManageAuthSection();
      case 4:
        return buildDeleteProfileSection();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget buildPersonalInfoSection() {
    return Container(
      width: 300,
      height: 220,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          width: 1,
          color: Colors.grey,
        )
      ),
      child: Column(
        children: [
          TextField(
            controller: _username,
            decoration: const InputDecoration(labelText: "Username"),
          ),
          TextField(
            controller: _email,
            decoration: const InputDecoration(labelText: "Email"),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _changeUserInfo,
            child: Container(
              width: 100,
              height: 30,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: buttonColor,
              ),
              child: const Center(
                child: Text(
                  "Valid infos",
                  style: TextStyle(
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildManageSessionSection() {
    return Container(
    width: 300,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(
        color: Colors.grey,
        width: 1,
      ),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Active Sessions",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 10),
        ...userSessions.map((asession) {
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Session ID: ${asession['session_id']}",
                        style: const TextStyle(fontSize: 14, color: Colors.black87),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        "Expires: ${asession['expire']}",
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                      Text(
                        "IP: ${asession['connexionIp']}",
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () {
                    _deleteSession(asession['session_id']);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      "Delete",
                      style: TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    ),
  );
  }

  Widget buildManageAuthSection() {
    return Container(
      width: 300,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.grey,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Connected Services",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 10),
          ...allServices.where((service) => service.connected).map((service) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    service.name,
                    style: const TextStyle(fontSize: 16, color: Colors.black),
                  ),
                  GestureDetector(
                    onTap: () {
                      _deconectionService(service.name);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        "Disconnect",
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget buildDeleteProfileSection() {
    return Container(
      width: 300,
      height: 170,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          width: 1,
          color: Colors.grey,
        )
      ),
      child: Column(
        children: [
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: "Password"),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _deleteUser,
            child: Container(
              width: 100,
              height: 30,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.red,
              ),
              child: const Center(
                child: Text(
                  "Delete",
                  style: TextStyle(
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
