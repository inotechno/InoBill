import 'package:flutter/material.dart';
import 'screens/split_bill_screen.dart';

void main() {
  runApp(const SplitBillApp());
}

class SplitBillApp extends StatelessWidget {
  const SplitBillApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Split Bill Calculator',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0174BE),
          brightness: Brightness.light,
        ).copyWith(
          primary: const Color(0xFF0174BE),        // #0174BE - Blue
          secondary: const Color(0xFF0C356A),      // #0C356A - Dark Blue
          tertiary: const Color(0xFFFFC436),       // #FFC436 - Gold/Yellow
          primaryContainer: const Color(0xFFE3F2FD),
          secondaryContainer: const Color(0xFFE8F4FD),
          tertiaryContainer: const Color(0xFFFFF8E1),
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onTertiary: const Color(0xFF0C356A),
          onPrimaryContainer: const Color(0xFF0C356A),
          onSecondaryContainer: const Color(0xFF0C356A),
          onTertiaryContainer: const Color(0xFF0C356A),
        ),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          elevation: 4,
          shadowColor: Colors.black.withOpacity(0.1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          margin: const EdgeInsets.symmetric(vertical: 4),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
          ),
          filled: true,
          fillColor: Colors.grey.shade50,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            elevation: 2,
            shadowColor: Colors.black.withOpacity(0.1),
          ),
        ),
      ),
      home: const SplitBillScreen(),
    );
  }
}
