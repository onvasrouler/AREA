import 'package:flutter/material.dart';

String baseurl = "http://10.84.106.237:8080";

String session = "";
String userName = "";
String userMail = "";

int currentActionService = 0;
int currentReactionService = 0;
int currentAction = 0;
int currentReaction = 0;
int currentChannel = 0;
int currentServer = 0;
String areasName = "";
late Map<String, String> info;

Color containerColor = const Color.fromARGB(255, 255, 255, 255);
Color backgroundColor = const Color.fromARGB(255, 245, 245, 245);
Color buttonColor = const Color.fromARGB(255, 23, 37, 84);

class Service {
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
var areas = [];
var sessions = [];

const int indexDiscord = 0;
const int indexGithub = 0;
const int indexSpotify = 1;
const int indexTwitch = 2;

final List<Service> actions = [
  Service(
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
    image: 'assets/spotify.png',
    name: 'Spotify',
    nameId: 'spotify',
    action: [
      "Liked Tracks",
      "New Liked Tracks",
      "Currently Playing"
    ],
    actionName: [
      "liked_track",
      "new_liked_track",
      "currently_playing"
    ],
    actionNotification: [
      "this is your liked tracks list",
      "you like a new track",
      "you are listening"
    ],
    reaction: [],
    reactionName: [],
    connected: false
  ),

  Service(
    image: 'assets/twitch.png',
    name: 'Twitch',
    nameId: 'twitch',
    action: [
      "New follow",
      "Following online"
    ],
    actionName: [
      "new_follow",
      "following_online",
    ],
    actionNotification: [
      "New follow",
      "Following online"
    ],
    reaction: [],
    reactionName: [],
    connected: false
  ),

  Service(
    image: 'assets/Weather.png',
    name: 'Weather',
    nameId: 'weather',
    action: [
      "Every Day",
      "Every half day",
      "Every hour"
    ],
    actionName: [
      "everyDay",
      "everyHalfDay",
      "everyHour"
    ],
    actionNotification: [
      "everyDay",
      "everyHalfDay",
      "everyHour"
    ],
    reaction: [],
    reactionName: [],
    connected: true,
  ),
];

final List<Service> reactions = [
  Service(
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
    image: 'assets/gmail-new.png',
    name: 'Mail',
    nameId: 'mail',
    action: [],
    actionName: [],
    actionNotification: [],
    reaction: [
      "Send an Email"
    ],
    reactionName: [
      ""
    ],
    connected: true,
  ),
];

void showSnackBar(BuildContext context, String message, bool isSuccess) {
  final snackBar = SnackBar(
    content: Row(
      children: [
        Icon(
          isSuccess ? Icons.check_circle : Icons.error,
          color: isSuccess ? Colors.green : Colors.red,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            message,
            style: const TextStyle(color: Colors.white),
          ),
        ),
      ],
    ),
    backgroundColor: buttonColor,
    duration: const Duration(seconds: 3),
  );

  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}