import 'package:flutter/material.dart';
import 'package:quick_bim_ar/qr_reader.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ShadApp(
      home: QrReader(),
    );
  }
}
