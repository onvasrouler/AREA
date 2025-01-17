import 'package:http/http.dart' as http;
import 'package:area/constant/constant.dart';
import 'dart:convert';

class UserService {
  Future<bool> getUserInfo() async {
    final url = Uri.parse('$baseurl/profile_info');

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);

        userMail = data['data']['email'];
        userName = data['data']['username'];
        
        if (data['data']['logged_in_discord'] == "session_expired") {
          if (await refreshDiscordSession() == true) {
            reactions[indexDiscord].connected = true;
          }
        }
        if (data['data']['logged_in_github'] == "session_expired") {
          if (await refreshGithubSession() == true) {
            reactions[indexDiscord].connected = true;
          }
        }
        if (data['data']['logged_in_spotify'] == "session_expired") {
          if (await refreshSpotifySession() == true) {
            reactions[indexDiscord].connected = true;
          }
        }
        if (data['data']['logged_in_twitch'] == "session_expired") {
          if (await refreshTwitchSession() == true) {
            reactions[indexDiscord].connected = true;
          }
        }

        if (data['data']['logged_in_discord'] == true) {
          reactions[indexDiscord].connected = true;
        }
        if (data['data']['logged_in_github'] == true) {
          actions[indexGithub].connected = true;
        }
        if (data['data']['logged_in_spotify'] == true) {
          actions[indexSpotify].connected = true;
        }
        if (data['data']['logged_in_twitch'] == true) {
          actions[indexTwitch].connected = true;
        }

        if (data['data']['logged_in_discord'] == false) {
          reactions[indexDiscord].connected = false;
        }
        if (data['data']['logged_in_github'] == false) {
          actions[indexGithub].connected = false;
        }
        if (data['data']['logged_in_spotify'] == false) {
          actions[indexSpotify].connected = false;
        }
        if (data['data']['logged_in_twitch'] == false) {
          actions[indexTwitch].connected = false;
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> getArea() async {
    final url = Uri.parse('$baseurl/area');

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);
        areas = data['data'];
        print(areas);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> deleteArea(String id) async {
    final url = Uri.parse('$baseurl/area');

    try {
      final response = await http.delete(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body:jsonEncode({"id": id})
      );

      if (response.statusCode == 200) {
        await getArea();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> activeArea(String id) async {
    final url = Uri.parse('$baseurl/activeAreas');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body:jsonEncode({"id": [id]})
      );

      if (response.statusCode == 200) {
        await getArea();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> getSession() async {
    final url = Uri.parse('$baseurl/sessions');

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);
        sessions = data['data'];

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> deleteSession(String id) async {
    final url = Uri.parse('$baseurl/sessions');

    try {
      final response = await http.delete(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body:jsonEncode({"sessionsIds": [id]})
      );

      if (response.statusCode == 200) {
        await getSession();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  

  Future<bool> refreshDiscordSession() async {
    final url = Uri.parse('$baseurl/auth/refresh/discord');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> refreshGithubSession() async {
    final url = Uri.parse('$baseurl/auth/refresh/github');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> refreshSpotifySession() async {
    final url = Uri.parse('$baseurl/auth/refresh/spotify');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> refreshTwitchSession() async {
    final url = Uri.parse('$baseurl/auth/refresh/twitch');

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> patchUserInfo(String username, String email) async {
    final url = Uri.parse('$baseurl/profile');

    final Map<String, dynamic> requestBody = {
      "newUsername": username,
      "newEmail": email,
    };

    try {
      final response = await http.patch(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

    Future<bool> deleteUser(String password) async {
    final url = Uri.parse('$baseurl/profile');

    final Map<String, dynamic> requestBody = {
      "password": password,
    };

    try {
      final response = await http.delete(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

      Future<bool> confirmDelete(String code) async {
    final url = Uri.parse('$baseurl/profile/confirm');

    final Map<String, dynamic> requestBody = {
      "token": code,
    };

    try {
      final response = await http.delete(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
        body: jsonEncode(requestBody),
      );

      print(response.statusCode);

      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }


  Future<bool> getServer() async {
    final url = Uri.parse('$baseurl/get_my_discord_server');

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);

        discordServer = data['data'];

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  Future<bool> getChannel(channelId) async {
    final id  = discordServer[currentServer]['id'];
    final url = Uri.parse('$baseurl/get_list_of_channels?guildId=$id');

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "session": session,
        },
      );

      if (response.statusCode == 200) {

        final data = jsonDecode(response.body);

        discordChannel = data['data'];

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}