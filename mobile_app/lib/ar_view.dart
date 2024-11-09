// import 'package:flutter/material.dart';
// import 'package:arkit_plugin/arkit_plugin.dart';
// import 'package:vector_math/vector_math_64.dart' as vector;

// class ARObjectPlacer extends StatefulWidget {
//   final String filePath;

//   const ARObjectPlacer({Key? key, required this.filePath}) : super(key: key);

//   @override
//   _ARObjectPlacerState createState() => _ARObjectPlacerState();
// }

// class _ARObjectPlacerState extends State<ARObjectPlacer> {
//   late ARKitController arkitController;
//   ARKitNode? objectNode;
//   bool isObjectPlaced = false;

//   @override
//   void dispose() {
//     arkitController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('AR Object Placer'),
//       ),
//       body: ARKitSceneView(
//         onARKitViewCreated: onARKitViewCreated,
//         showFeaturePoints: !isObjectPlaced,
//       ),
//     );
//   }

//   void onARKitViewCreated(ARKitController controller) {
//     arkitController = controller;

//     arkitController.onARTap = (List<ARKitTestResult> ar) {
//       if (!isObjectPlaced) {
//         final planeTap = ar.firstWhere(
//           (result) =>
//               result.type == ARKitHitTestResultType.existingPlaneUsingExtent,
//           // orElse: () => null,
//         );
//         if (planeTap != null) {
//           placeObjectOnPlane(planeTap.worldTransform);
//         }
//       }
//     };
//   }

//   void placeObjectOnPlane(Matrix4 transform) {
//     if (isObjectPlaced) return;

//     final position = vector.Vector3(
//       transform[12], // x position
//       transform[13], // y position
//       transform[14], // z position
//     );

//     objectNode = ARKitReferenceNode(
//       url: widget.filePath,
//       position: position,
//       scale: vector.Vector3(0.1, 0.1, 0.1), // Adjust scale if needed
//     );

//     arkitController.add(objectNode!);
//     setState(() {
//       isObjectPlaced = true;
//     });
//   }
// }

import 'dart:io';

import 'package:arkit_plugin/arkit_plugin.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart' as vector;
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

class LoadGltfOrGlbFilePage extends StatefulWidget {
  const LoadGltfOrGlbFilePage({super.key, required this.url});

  final String url;

  @override
  State<LoadGltfOrGlbFilePage> createState() => _LoadGltfOrGlbFilePageState();
}

class _LoadGltfOrGlbFilePageState extends State<LoadGltfOrGlbFilePage> {
  late ARKitController arkitController;

  @override
  void dispose() {
    arkitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Load .gltf or .glb')),
        body: ARKitSceneView(
          showFeaturePoints: true,
          enableTapRecognizer: true,
          planeDetection: ARPlaneDetection.horizontalAndVertical,
          onARKitViewCreated: onARKitViewCreated,
        ),
      );

  void onARKitViewCreated(ARKitController arkitController) {
    this.arkitController = arkitController;
    this.arkitController.onARTap = (ar) {
      final point = ar.firstWhereOrNull(
        (o) => o.type == ARKitHitTestResultType.featurePoint,
      );
      if (point != null) {
        _onARTapHandler(point);
      }
    };
  }

  void _onARTapHandler(ARKitTestResult point) async {
    final position = vector.Vector3(
      point.worldTransform.getColumn(3).x,
      point.worldTransform.getColumn(3).y,
      point.worldTransform.getColumn(3).z,
    );

    // final node = _getNodeFromFlutterAsset(position);
    final node = await _getNodeFromNetwork(position, widget.url);
    arkitController.add(node);
  }

  ARKitGltfNode _getNodeFromFlutterAsset(vector.Vector3 position) =>
      ARKitGltfNode(
        assetType: AssetType.flutterAsset,
        // Box model from
        url: 'assets/gltf/Box.gltf',
        scale: vector.Vector3(0.05, 0.05, 0.05),
        position: position,
      );
}

Future<ARKitGltfNode> _getNodeFromNetwork(
    vector.Vector3 position, String url) async {
// And add dependencies to pubspec.yaml file
// path_provider: ^2.0.3
// dio: ^5.3.3

// Import to test file download

  final file = await _downloadFile(
    url,
    // 'https://quickbimstorage.blob.core.windows.net/quickbimmodels/2DSMWK.gltf',
    // 'https://raw.githubusercontent.com/Mankeli-Software/3d-model-test/refs/heads/main/Box.gltf',
    // 'https://github.com/Mankeli-Software/3d-model-test/raw/refs/heads/main/dodge_srt_tomahawk_no_interior.glb',
    // 'https://github.com/Mankeli-Software/3d-model-test/raw/refs/heads/main/11_8_2024.glb',
  );
  // print(file.readAsStringSync());
  if (file.existsSync()) {
    print(file.path.split('/').last);
    //Load from app document folder
    return ARKitGltfNode(
      assetType: AssetType.documents,
      url: file.path.split('/').last, //  filename.extension only!
      scale: vector.Vector3(1, 1, 1),
      // scale: vector.Vector3(0.05, 0.05, 0.05),

      position: position,
    );
  }
  throw Exception('Failed to load $file');
}

Future<File> _downloadFile(String url) async {
  try {
    final dir = await getApplicationDocumentsDirectory();
    final filePath = '${dir.path}/${url.split("/").last}';
    await Dio().download(url, filePath);
    final file = File(filePath);
    print('Download completed!! path = $filePath');
    return file;
  } catch (e) {
    print('Caught an exception: $e');
    rethrow;
  }
}
