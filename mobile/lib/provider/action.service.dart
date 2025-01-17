import 'package:http/http.dart' as http;
import 'package:area/constant/constant.dart';
import 'dart:convert';

class ActionService {
  Future<bool> sendActionWithDiscordReactionChannel() async {
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
      "name": areasName,
      "action": {
        "service": actions[currentActionService].nameId,
          "arguments": {
              "on": actions[currentActionService].actionName[currentAction]
          }
      },
      "reaction": {
        "service": reactions[currentReactionService].nameId,
        "arguments": {
          "react": reactions[currentReactionService].reactionName[currentReaction],
          "userId": discordId,
          "server": discordServer[currentServer]['id'],
          "channel": discordChannel[currentChannel]['id'],
          "message": actions[currentActionService].actionNotification[currentAction],
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
      "name": areasName,
      "action": {
        "service": actions[currentActionService].nameId,
          "arguments": {
              "on": actions[currentActionService].actionName[currentAction]
          }
      },
      "reaction": {
        "service": reactions[currentReactionService].nameId,
        "arguments": {
          "react": reactions[currentReactionService].reactionName[currentReaction],
          "userId": discordId,
          "message": actions[currentActionService].actionNotification[currentAction],
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

  Future<bool> sendActionWithMailReaction(String mail) async {
    final area = {
      "name": areasName,
      "action": {
        "service": actions[currentActionService].nameId,
          "arguments": {
              "on": actions[currentActionService].actionName[currentAction]
          }
      },
      "reaction": {
        "service": "gmail",
        "arguments": {
            "email": mail,
            "object": actions[currentActionService].action[currentAction],
            "message": actions[currentActionService].actionNotification[currentAction],
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
}
