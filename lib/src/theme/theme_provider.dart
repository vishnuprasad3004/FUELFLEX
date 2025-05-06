
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  // Define your light theme colors (matching globals.css light mode HSL)
  // HSL values from globals.css:
  // --background: 210 40% 98%; /* Light Gray */
  // --foreground: 210 10% 23%; /* Dark Gray */
  // --card: 0 0% 100%; /* White */
  // --primary: 180 100% 25%; /* Teal */
  // --secondary: 219 25% 64%; /* Muted Blue */
  // --accent: 180 100% 30%; /* Slightly lighter Teal */
  // --destructive: 0 84.2% 60.2%;
  // --border: 219 25% 88%; /* Lighter Muted Blue/Gray */
  // --input: 219 25% 94%; /* Even Lighter Muted Blue/Gray */


  static final ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      background: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor(), // Light Gray
      onBackground: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor(), // Dark Gray
      surface: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // White (for Cards, Dialogs)
      onSurface: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor(), // Dark Gray
      primary: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.25).toColor(), // Teal
      onPrimary: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // White
      secondary: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.64).toColor(), // Muted Blue
      onSecondary: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor(), // Dark Gray
      error: const HSLColor.fromAHSL(1.0, 0, 0.842, 0.602).toColor(), // Destructive Red
      onError: const HSLColor.fromAHSL(1.0, 0, 0.0, 0.98).toColor(), // Light text on destructive
      // For elements like TextField borders, Card borders
      outline: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.88).toColor(), // Lighter Muted Blue/Gray (border)
      // For TextField fill, etc.
      surfaceVariant: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.96).toColor(), // Lighter Gray (muted)
      shadow: Colors.black.withOpacity(0.1),
    ),
    scaffoldBackgroundColor: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor(),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // Card background
      surfaceTintColor: Colors.transparent, // To prevent material 3 tinting if not desired
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.25).toColor(), // Primary
      foregroundColor: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // onPrimary
      elevation: 0, // Modern flat look, or a small value like 2 or 4
      titleTextStyle: GoogleFonts.roboto(fontSize: 20, fontWeight: FontWeight.w500),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.30).toColor(), // Accent
        foregroundColor: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // onAccent
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        textStyle: GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.94).toColor()), // input
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.88).toColor().withOpacity(0.7)), // border
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.25).toColor(), width: 2), // primary
      ),
      filled: true,
      fillColor: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.94).toColor().withOpacity(0.5), // input with opacity
      hintStyle: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.45).toColor()), // muted-foreground
    ),
    textTheme: GoogleFonts.robotoTextTheme(
      ThemeData.light().textTheme.copyWith(
            headlineSmall: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor()), // foreground
            titleLarge: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor()),
            bodyMedium: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.23).toColor()),
            labelLarge: TextStyle(color: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor()), // For buttons
          ),
    ),
    useMaterial3: true,
  );

  // Define your dark theme colors (matching globals.css dark mode HSL)
  // --background: 210 10% 15%; /* Darker Gray */
  // --foreground: 210 40% 98%; /* Light Gray */
  // --card: 210 10% 18%; /* Slightly lighter dark gray */
  // --primary: 180 100% 35%; /* Lighter Teal for dark mode */
  // --secondary: 219 25% 40%; /* Darker Muted Blue */
  // --accent: 180 100% 40%; /* Lighter Teal accent for dark */
  // --destructive: 0 62.8% 30.6%; (Note: CSS used 30.6%, using similar value for Flutter)
  // --border: 219 25% 30%; /* Darker border */
  // --input: 219 25% 25%; /* Darker input */

  static final ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      background: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.15).toColor(),
      onBackground: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor(),
      surface: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.18).toColor(), // card
      onSurface: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor(),
      primary: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.35).toColor(),
      onPrimary: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // White on primary
      secondary: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.40).toColor(),
      onSecondary: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor(),
      error: const HSLColor.fromAHSL(1.0, 0, 0.7, 0.5).toColor(), // Adjusted destructive for better visibility
      onError: const HSLColor.fromAHSL(1.0, 0, 0.0, 0.98).toColor(),
      outline: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.30).toColor(), // border
      surfaceVariant: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.25).toColor(), // muted (e.g. input background)
      shadow: Colors.black.withOpacity(0.3),
    ),
     scaffoldBackgroundColor: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.15).toColor(),
    cardTheme: CardTheme(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.18).toColor(), // Card background
      surfaceTintColor: Colors.transparent,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.35).toColor(), // Primary
      foregroundColor: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // onPrimary
      elevation: 0,
      titleTextStyle: GoogleFonts.roboto(fontSize: 20, fontWeight: FontWeight.w500),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.40).toColor(), // Accent
        foregroundColor: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor(), // onAccent
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        textStyle: GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
     inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.25).toColor()), // input
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.30).toColor().withOpacity(0.7)), // border
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const HSLColor.fromAHSL(1.0, 180, 1.0, 0.35).toColor(), width: 2), // primary
      ),
      filled: true,
      fillColor: const HSLColor.fromAHSL(1.0, 219, 0.25, 0.25).toColor().withOpacity(0.5), // input with opacity
      hintStyle: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.10, 0.65).toColor()), // muted-foreground
    ),
     textTheme: GoogleFonts.robotoTextTheme(
      ThemeData.dark().textTheme.copyWith(
            headlineSmall: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor()), // foreground
            titleLarge: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor()),
            bodyMedium: TextStyle(color: const HSLColor.fromAHSL(1.0, 210, 0.40, 0.98).toColor()),
            labelLarge: TextStyle(color: const HSLColor.fromAHSL(1.0, 0, 0.0, 1.0).toColor()), // For buttons
          ),
    ),
    useMaterial3: true,
  );
}
