import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';
import 'package:area/provider/user.service.dart';

class YourAreaPage extends StatefulWidget {
  const YourAreaPage({super.key});

  @override
  State<YourAreaPage> createState() => _YourAreaPageState();
}

class _YourAreaPageState extends State<YourAreaPage> {
  int selectedSection = -1;

  final userService = UserService();

  Future<void> _deleteArea(String id) async {
    final response = await userService.deleteArea(id);
    if (response) {
      showSnackBar(context, "Area deleted", true);
      setState(() {
        areas;
      });
    } else {
      showSnackBar(context, "Error", false);
    }
  }

  Future<void> _activeArea(String id, bool active) async {
    final response = await userService.activeArea(id);
    if (response) {
      if (active == true) {
        showSnackBar(context, "Area stoped", true);
      } else {
        showSnackBar(context, "Area started", true);
      }
      setState(() {
        areas;
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
              itemCount: areas.length + 1,
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
                          "Your AREAs",
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
                areas[index - 1]['name'],
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
    return buildAreasInfo(index);
  }

  Widget buildAreasInfo(int index) {
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
          Row(
            children: [
              const Text("Action : "),
              Text(areas[index - 1]['action']['service'])
            ],
          ),
          Row(
            children: [
              const Text("Reaction : "),
              Text(areas[index - 1]['reaction']['service'])
            ],
          ),
          Row(
            children: [
              const Text("Message : "),
              Text(areas[index - 1]['reaction']['arguments']['message']),
            ],
          ), 
          Row(
            children: [
              const Text("Status : "),
              Text(areas[index - 1]['active'] ? "Active": "Unactive")
            ],
          ),          
          const SizedBox(height: 20),
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  _activeArea(areas[index - 1]['id'], areas[index - 1]['active']);
                },
                child: Container(
                  width: 100,
                  height: 30,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: buttonColor,
                  ),
                  child: Center(
                    child: Text(
                      areas[index - 1]['active'] ? "Stop" : "Start",
                      style: const TextStyle(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 30),
              GestureDetector(
                onTap: () {
                  _deleteArea(areas[index - 1]['id']);
                },
                child: Container(
                  width: 100,
                  height: 30,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.red,
                  ),
                  child: const Center(
                    child: Text(
                      "Delete Area",
                      style: TextStyle(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

 

  Widget buildDeleteProfileSection() {
    return buildSectionWrapper(
      children: [
        const Text("Are you sure you want to delete your profile?"),
        buildActionButtons(
          primaryButtonLabel: "Confirm",
          primaryAction: () {
            print("Profile deleted");
          },
          secondaryButtonLabel: "Cancel",
          secondaryAction: () {
            print("Delete cancelled");
          },
        ),
      ],
    );
  }

  Widget buildSectionWrapper({required List<Widget> children}) {
    return Container(
      width: 300,
      padding: const EdgeInsets.all(10),
      margin: const EdgeInsets.only(top: 10),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget buildActionButtons({
    required String primaryButtonLabel,
    required VoidCallback primaryAction,
    required String secondaryButtonLabel,
    required VoidCallback secondaryAction,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        ElevatedButton(
          onPressed: primaryAction,
          child: Text(primaryButtonLabel),
        ),
        ElevatedButton(
          onPressed: secondaryAction,
          child: Text(secondaryButtonLabel),
        ),
      ],
    );
  }
}

