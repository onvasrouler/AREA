import 'package:flutter/material.dart';

String baseurl = "";

String session = "";

int currentActionService = 0;
int currentReactionService = 0;
int currentAction = 0;
int currentReaction = 0;
int currentChannel = 0;
int currentServer = 0;

Color containerColor = const Color.fromARGB(255, 255, 255, 255);
Color backgroundColor = const Color.fromARGB(255, 245, 245, 245);
Color buttonColor = const Color.fromARGB(255, 22, 163, 74);

class Service {
  final Color color;
  final String image;
  final String name;
  final String nameId;
  final List<String> action;
  final List<String> actionName;
  final List<String> actionNotification;
  final List<String> reaction;
  final List<String> reactionName;
  bool connected;

  Service(
    {
      required this.color, 
      required this.image, 
      required this.name, 
      required this.nameId, 
      required this.action, 
      required this.reaction, 
      required this.actionName, 
      required this.reactionName, 
      required this.actionNotification, 
      required this.connected
    }
  );
}

var discordChannel = [];
var discordServer = [];

const int indexDiscord = 1;
const int indexGithub = 0;

final List<Service> services = [
  Service(
    color: const Color.fromARGB(255, 0, 0, 0), 
    image: 'assets/Github.png',
    name: 'GitHub',
    nameId: 'github',
    action: [
      "Detecting new pull request",
      "Detecting new repository",
      "Detecting new issue",
      "Detecting new commit",
    ],
    actionName: [
      "new_pr",
      "new_repo",
      "new_issue",
      "new_commit",
    ],
    actionNotification: [
      "A new PR has been opened!",
      "A new repo has been created!",
      "A new issue has been opened!",
      "A new commit has been pushed!",
    ],
    reaction: [],
    reactionName: [],
    connected: false,
  ),

  Service(
    color: const Color.fromARGB(255, 82, 106, 241), 
    image: 'assets/Discord.png',
    name: 'Discord',
    nameId: 'discord',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [
      "Message in a channel",
      "Private message",
    ],
    reactionName: [
      "message",
      "private_message",
    ],
    connected: false,
  ),

  Service(
    color: const Color.fromARGB(255, 29, 185, 84), 
    image: 'assets/Spotify.png',
    name: 'Spotify',
    nameId: 'spotify',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [],
    reactionName: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 8, 73, 176), 
    image: 'assets/Onedrive.png',
    name: 'Onedrive',
    nameId: 'onedrive',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [],
    reactionName: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 228, 64, 95), 
    image: 'assets/Instagram.png',
    name: 'Instagram',
    nameId: 'instagram',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [],
    reactionName: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 255, 220, 92), 
    image: 'assets/Gmail.png',
    name: 'Gmail',
    nameId: 'gmail',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [],
    reactionName: [],
    connected: false
  ),
];