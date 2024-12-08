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
        
        if (data['data']['logged_in_discord'] == true) {
          services[indexDiscord].connected = true;
        }
        if (data['data']['logged_in_github'] == true) {
          services[indexGithub].connected = true;
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
