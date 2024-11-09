import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:quick_bim_ar/ar_view.dart';
import 'package:url_launcher/url_launcher.dart';

class QrReader extends StatefulWidget {
  const QrReader({super.key});

  @override
  State<QrReader> createState() => _QrReaderState();
}

class _QrReaderState extends State<QrReader> {
  MobileScannerController scannerController = MobileScannerController();
  bool isDownloading = false;
  String? filePath;
  String? url;

  Future<void> downloadFile(String url) async {
    setState(() {
      isDownloading = true;
    });

    // try {
    //   final file = await DefaultCacheManager().getSingleFile(url);
    //   setState(() {
    //     filePath = file.path;
    //   });
    // } catch (e) {
    //   print("Error downloading file: $e");
    // } finally {
    setState(() {
      isDownloading = false;
    });
    // }
  }

  void _onDetect(BarcodeCapture capture) async {
    final barcode = capture.barcodes.first;
    final String? code = barcode.rawValue;
    if (code != null && Uri.tryParse(code)?.isAbsolute == true) {
      setState(() {
        url = code;
      });
      scannerController.stop();
      await downloadFile(code);
      _showDownloadDialog();
    }
  }

  void _showDownloadDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Download Complete'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            isDownloading
                ? CircularProgressIndicator()
                : Text('Download completed.'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                print(filePath);
                if (url == null) return;
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    // builder: (context) => ARObjectPlacer(filePath: filePath!),
                    builder: (context) => LoadGltfOrGlbFilePage(url: url!),
                  ),
                );

                // Handle file open logic here
              },
              child: Text('Open File'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              scannerController.start();
            },
            child: Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('QR Code Scanner'),
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: scannerController,
            onDetect: _onDetect,
          ),
          if (isDownloading)
            Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}
