import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/provider/user.service.dart';
import 'package:area/constant/constant.dart';

class DeleteProfilePage extends StatefulWidget {
  const DeleteProfilePage({super.key});

  @override
  _DeleteProfileState createState() => _DeleteProfileState();
}

class _DeleteProfileState extends State<DeleteProfilePage> {
  late TextEditingController _code;
  late bool error;
  bool loader = false;

  @override
  void initState() {
    _code = TextEditingController();
    error = false;
    super.initState();
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  final userService = UserService();


  Future<void> _confirmDelete() async {
    final response = await userService.confirmDelete(_code.text);
    if (response) {
      showSnackBar(context, "Account deleted", true);
      session = "";
      GoRouter.of(context).push('/login');
    } else {
      showSnackBar(context, "Error to delete account", false);
      setState(() {
        error = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 300,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: containerColor,
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Confirm With a code',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _code,
                    decoration: const InputDecoration(
                      labelText: 'Code',
                      border: OutlineInputBorder(),
                    ),
                  ),              
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: _confirmDelete,
                    child: Container(
                      width: 250,
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: Colors.red,
                      ),
                      child: const Center(
                        child: Text(
                          "Delete account",
                          style: TextStyle(
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 60,
            left: 10,
            child: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                GoRouter.of(context).pop();
              },
            ),
          ),
        ],
      )
    );
  }
}