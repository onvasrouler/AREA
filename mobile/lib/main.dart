import 'package:area/auth/login.dart';
import 'package:area/pages/subpages/delete_user.dart';
import 'package:area/pages/subpages/select_area_name.dart';
import 'package:area/pages/subpages/your_area.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:area/auth/register.dart';
import 'package:area/auth/forgot_password.dart';
import 'package:area/auth/reset_password.dart';
import 'package:area/auth/email_check.dart';
import 'package:area/pages/menu.dart';
import 'package:area/pages/subpages/action.dart';
import 'package:area/pages/subpages/profile_menu.dart';
import 'package:area/pages/subpages/send_mail.dart';
import 'package:area/pages/subpages/reaction.dart';
import 'package:area/pages/subpages/service_reaction.dart';
import 'package:area/pages/subpages/success.dart';
import 'package:area/pages/subpages/discord/channel.dart';
import 'package:area/pages/subpages/discord/server.dart';
import 'package:area/pages/subpages/fail.dart';
import 'package:area/error/error.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'constant/constant.dart';

void main() async {
  print("start");
  await dotenv.load();
  info = dotenv.env;
  baseurl = info["SERVER_URL"] ?? "";
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
          redirect: (context, state) => ('/login'),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: '/forgotPassword',
          builder: (context, state) => const ForgotPasswordPage(),
        ),
        GoRoute(
          path: '/resetPassword',
          builder: (context, state) => const ResetPasswordPage(),
        ),
        GoRoute(
          path: '/areaName',
          builder: (context, state) => const AreaNamePage(),
        ),
        GoRoute(
          path: '/sendMail',
          builder: (context, state) => const SendMailPage(),
        ),
        GoRoute(
          path: '/checkEmail',
          builder: (context, state) => const ConfirmEmailPage(),
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
          path: '/success',
          builder: (context, state) => const SuccessPage(),
        ),
        GoRoute(
          path: '/deletreConfirm',
          builder: (context, state) => const DeleteProfilePage(),
        ),
        GoRoute(
          path: '/fail',
          builder: (context, state) => const FailPage(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          path: '/profil',
          builder: (context, state) => const ProfilePage(),
        ),
        GoRoute(
          path: '/yourArea',
          builder: (context, state) => const YourAreaPage(),
        ),
        GoRoute(
          path: '/server',
          builder: (context, state) => const ServerPage(),
        ),
        GoRoute(
          path: '/channel',
          builder: (context, state) => const ChannelPage(),
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
