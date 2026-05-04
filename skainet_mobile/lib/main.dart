import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/workshop_provider.dart';
import 'providers/client_provider.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SkainetApp());
}

class SkainetApp extends StatelessWidget {
  const SkainetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WorkshopProvider()),
        ChangeNotifierProvider(create: (_) => ClientProvider()),
      ],
      child: MaterialApp(
        title: 'Skainet Workshop',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        home: const LoginScreen(),
      ),
    );
  }
}
