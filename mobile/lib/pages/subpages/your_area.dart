import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/constant/constant.dart';

class YourAreaPage extends StatefulWidget {
  const YourAreaPage({super.key});

  @override
  State<YourAreaPage> createState() => _YourAreaPageState();
}

class _YourAreaPageState extends State<YourAreaPage> {
  int selectedSection = -1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          Center(
            child: ListView.builder(
              itemCount: 6,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return SizedBox(
                    height: 150,
                    child: Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 25),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back),
                            onPressed: () {
                              GoRouter.of(context).pop();
                            },
                          ),
                        ),
                      ],
                    ),
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
      "Modify password",
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
        return buildModifyPasswordSection();
      case 3:
        return buildManageSessionSection();
      case 4:
        return buildManageAuthSection();
      case 5:
        return buildDeleteProfileSection();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget buildPersonalInfoSection() {
    return buildSectionWrapper(
      children: [
        const TextField(
          decoration: InputDecoration(labelText: "Username"),
        ),
        const TextField(
          decoration: InputDecoration(labelText: "Email"),
        ),
        GestureDetector(
          //onTap: ,
          child: Container(
            width: 50,
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
    );
  }

  Widget buildModifyPasswordSection() {
    return buildSectionWrapper(
      children: [
        const TextField(
          decoration: InputDecoration(labelText: "Current Password"),
          obscureText: true,
        ),
        const TextField(
          decoration: InputDecoration(labelText: "New Password"),
          obscureText: true,
        ),
        buildActionButtons(
          primaryButtonLabel: "Change Password",
          primaryAction: () {
            print("Password changed");
          },
          secondaryButtonLabel: "Forgot Password?",
          secondaryAction: () {
            print("Forgot Password clicked");
          },
        ),
      ],
    );
  }

  Widget buildManageSessionSection() {
    return buildSectionWrapper(
      children: [
        const Text("• Session 1: Logged in from Chrome on Windows"),
        const Text("• Session 2: Logged in from Android"),
        buildActionButtons(
          primaryButtonLabel: "Logout All",
          primaryAction: () {
            print("Logged out of all sessions");
          },
          secondaryButtonLabel: "Refresh",
          secondaryAction: () {
            print("Refresh sessions");
          },
        ),
      ],
    );
  }

  Widget buildManageAuthSection() {
    return buildSectionWrapper(
      children: [
        const Text("Service: Google"),
        const Text("Service: Spotify"),
        buildActionButtons(
          primaryButtonLabel: "Disconnect",
          primaryAction: () {
            print("Service disconnected");
          },
          secondaryButtonLabel: "Add Service",
          secondaryAction: () {
            print("Add new service clicked");
          },
        ),
      ],
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

