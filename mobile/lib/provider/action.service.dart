import 'package:http/http.dart' as http;
import 'package:area/constant/constant.dart';
import 'dart:convert';

class ActionService {
  Future<bool> sendActionWithDiscordReactionChannel() async {
    final area = {
      "action": {
        "service": services[currentActionService].nameId,
          "arguments": {
              "on": services[currentActionService].actionName[currentAction]
          }
      },
      "reaction": {
        "service": services[currentReactionService].nameId,
        "arguments": {
          "react": services[currentReactionService].reactionName[currentReaction],
          "server": discordServer[currentServer]['id'],
          "channel": discordChannel[currentChannel]['id'],
          "message": services[currentActionService].actionNotification[currentAction],
        }
      }
    };

    try {
      final url = Uri.parse('$baseurl/area');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(
          area
        ),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }


  Future<bool> sendActionWithDiscordReactionPrivate() async {
    var discordId = "";

    try {
      final url = Uri.parse('$baseurl/get_my_user_id');

      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      final data = jsonDecode(response.body);

      discordId = data['data'];

    } catch (e) {
      return false;
    }

    final area = {
      "action": {
        "service": services[currentActionService].nameId,
          "arguments": {
              "on": services[currentActionService].actionName[currentAction]
          }
      },
      "reaction": {
        "service": services[currentReactionService].nameId,
        "arguments": {
          "react": services[currentReactionService].reactionName[currentReaction],
          "userId": discordId,
          "message": services[currentActionService].actionNotification[currentAction],
        }
      }
    };

    try {
      final url = Uri.parse('$baseurl/area');

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(
          area,
        )
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
