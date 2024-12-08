import 'package:flutter/material.dart';

String baseurl = "http://10.84.107.117:8081";

String session = "";

int currentActionService = 0;
int currentReactionService = 0;
int currentAction = 0;
int currentReaction = 0;

Color containerColor = const Color.fromARGB(255, 255, 255, 255);
Color backgroundColor = const Color.fromARGB(255, 245, 245, 245);
Color buttonColor = const Color.fromARGB(255, 22, 163, 74);

class Service {
  final Color color;
  final String image;
  final String name;
  final List<String> action;
  final List<String> reaction;
  bool connected;

  Service({required this.color, required this.image, required this.name, required this.action, required this.reaction, required this.connected});
}

const int indexDiscord = 1;
const int indexGithub = 0;

final List<Service> services = [
  Service(
    color: const Color.fromARGB(255, 0, 0, 0), 
    image: 'assets/Github.png',
    name: 'GitHub',
    action: [
      "Detecting new pull request",
      "Detecting new repository",
    ],
    reaction: [],
    connected: false,
  ),

  Service(
    color: const Color.fromARGB(255, 82, 106, 241), 
    image: 'assets/Discord.png',
    name: 'Discord',
    action: [],
    reaction: [
      "Message in a channel",
    ],
    connected: false,
  ),

  Service(
    color: const Color.fromARGB(255, 29, 185, 84), 
    image: 'assets/Spotify.png',
    name: 'Spotify',
    action: [],
    reaction: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 8, 73, 176), 
    image: 'assets/Onedrive.png',
    name: 'Onedrive',
    action: [],
    reaction: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 228, 64, 95), 
    image: 'assets/Instagram.png',
    name: 'Instagram',
    action: [],
    reaction: [],
    connected: false
  ),

  Service(
    color: const Color.fromARGB(255, 255, 220, 92), 
    image: 'assets/Gmail.png',
    name: 'Gmail',
    action: [],
    reaction: [],
    connected: false
  ),
];