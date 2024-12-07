import 'package:area/auth/signup.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/auth/signin.dart';
import 'package:area/pages/menu.dart';
import 'package:area/pages/subpages/action.dart';
import 'package:area/pages/subpages/reaction.dart';
import 'package:area/pages/subpages/service_reaction.dart';
import 'package:area/error/error.dart';

void main() async {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {

  @override
  Widget build(BuildContext context) {
    final GoRouter router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          redirect: (context, state) => ('/signIn'),
        ),
        GoRoute(
          path: '/signIn',
          builder: (context, state) => const SignInPage(),
        ),
        GoRoute(
          path: '/action',
          builder: (context, state) => const ActionPage(),
        ),
        GoRoute(
          path: '/reaction',
          builder: (context, state) => const ReactionPage(),
        ),
        GoRoute(
          path: '/reactionService',
          builder: (context, state) => const ServiceReactionPage(),
        ),
        GoRoute(
          path: '/signUp',
          builder: (context, state) => const SignUpPage(),
        ),
        GoRoute(
          path: '/menu',
          builder: (context, state) => const MenuPage(),
        ),
      ],
      errorBuilder: (context, state) => const ErrorPage(),
    );

    return MaterialApp.router(
      routerConfig: router,
      title: 'Epitrello',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
            seedColor: const Color.fromARGB(255, 241, 237, 233),
            primary: const Color.fromARGB(255, 154, 136, 128)),
        useMaterial3: true,
      ),
    );
  }
}
