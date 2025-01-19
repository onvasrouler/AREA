import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:area/auth/login.dart';

void main() {
  testWidgets('LoginPage has form, username and password fields', (WidgetTester tester) async {
    // Build le widget
    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(size: Size(1920, 1080)),
          child: LoginPage(),
        ),
      ),
    );

    // Vérifie si le texte de titre est présent
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);

    // Vérifie les TextField pour username et password
    expect(find.byType(TextField), findsNWidgets(2));

    // Vérifie si le bouton "Login" est présent
    expect(find.text('Login'), findsOneWidget);

    // Vérifie le bouton "Continue with Google"
    expect(find.text('Continue with Google'), findsOneWidget);

    // Vérifie les boutons "Register" et "Forgot password !"
    expect(find.text('Register'), findsOneWidget);
    expect(find.text('Forgot password !'), findsOneWidget);
  });

  testWidgets('User can input username and password', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(size: Size(360, 640)),
          child: LoginPage(),
        ),
      ),
    );

    // Saisir des données dans les champs username et password
    await tester.enterText(find.byType(TextField).at(0), 'testuser');
    await tester.enterText(find.byType(TextField).at(1), 'password123');

    // Valide que les textes sont saisis correctement
    expect(find.text('testuser'), findsOneWidget);
    expect(find.text('password123'), findsOneWidget);
  });
}