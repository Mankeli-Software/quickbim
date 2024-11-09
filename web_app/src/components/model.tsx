"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas as ThreeCanvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Mesh, Scene, Vector3 } from "three";
import { useQRCode } from "next-qrcode";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Building, Floor, getModelUrl } from "@/types";
import DraggableModel from "./ui/DraggableModel";

type ModelProps = {
  floor: Floor;
  building: Building;
};
interface Model {
  id: number;
  url: string;
  position: Vector3;
}
  
export function Model({ floor, building }: Readonly<ModelProps>) {
  const { Canvas } = useQRCode();
  const sceneRef = useRef<Scene>(new Scene());

  const orbitControlsRef = useRef(null);
  const [models, setModels] = useState<Model[]>([]);

  const addModel = () => {
    const newModel: Model = {
      id: Date.now(),
      url: "../public/model.gltf", 
      position: new Vector3(0, 0, 0),
    };
    setModels((prevModels) => [...prevModels, newModel]);
  };


  function MeshComponent() {
    const mesh = useRef<Mesh>(null!);
  
    return (
      <group ref={sceneRef}>
        {building.floors.map((f, index) => {
          const gltf = useLoader(GLTFLoader, getModelUrl(f));

          const isSelected = f.id === floor.id;

          useEffect(() => {
            if (mesh.current) {
              for (let material in gltf.materials) {
                gltf.materials[material].opacity = isSelected ? 1 : 0.2;
                gltf.materials[material].transparent = true;
              }
            }
          }, [isSelected]);

          return (
            <mesh key={f.id} ref={mesh} position={[0, -index * 1.05, 0]}>
              <primitive object={gltf.scene} />
            </mesh>
          );
        })}
      </group>
    );
  }

  const exportGLTF = () => {
    const originalOpacities = new Map();
  
    // Store original opacities and set all materials to full opacity
    sceneRef.current.traverse((node) => {
      if (node instanceof Mesh) {
        originalOpacities.set(node, {
          opacity: node.material.opacity,
          transparent: node.material.transparent,
        });
        node.material.opacity = 1;
        node.material.transparent = false;
      }
    });
  
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "combined_model.gltf";
        link.click();
  
        // Restore original opacities
        originalOpacities.forEach((value, node) => {
          node.material.opacity = value.opacity;
          node.material.transparent = value.transparent;
        });
      },
      () => {
        console.error("Failed to export model");
  
        // Restore original opacities in case of failure
        originalOpacities.forEach((value, node) => {
          node.material.opacity = value.opacity;
          node.material.transparent = value.transparent;
        });
      },
    );
  };
  
  return (
    <div className="flex flex-row w-full h-full">
      <ThreeCanvas
        className="bg-gray-200"
        camera={{ position: [5, 5, 5], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 10, 0]} intensity={1} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <MeshComponent />
        {models.map((model) => (
          <DraggableModel key={model.id} model={model} orbitControlsRef={orbitControlsRef} />
        ))}
        <OrbitControls ref={orbitControlsRef} />
        </ThreeCanvas>
      <div className="w-[250px] flex flex-col justify-center align-center">
        <Canvas
          text={getModelUrl(floor)}
          options={{
            errorCorrectionLevel: "M",
            margin: 3,
            scale: 4,
            width: 250,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          }}
        />
        <p className="self-center">Scan to view floor in AR</p>
        <a
          href={getModelUrl(floor)}
          download
          target="_blank"
          className="self-center text-blue-500 underline"
        >
          Download floor as .gltf
        </a>
        <button
          onClick={exportGLTF}
          className="self-center mt-4 px-4 py-2 bg-blue-500 text-white rounded m-4"
        >
          Export Combined GLTF
        </button>
        <button
        onClick={addModel}
        >Add hissi</button>
      </div>
    </div>
  );
}