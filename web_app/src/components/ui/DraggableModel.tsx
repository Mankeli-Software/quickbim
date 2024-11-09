import React, { useRef, useEffect } from "react";
import { useLoader, extend, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import * as THREE from "three";

extend({ DragControls });

interface DraggableModelProps {
  model: {
    id: number;
    url: string;
    position: THREE.Vector3;
  };
  orbitControlsRef: React.RefObject<any>;
}

const DraggableModel: React.FC<DraggableModelProps> = ({ model, orbitControlsRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gltf = useLoader(GLTFLoader, model.url);
  const { camera, gl } = useThree();

  useEffect(() => {
    const dragControls = new DragControls(
      [meshRef.current as THREE.Object3D],
      camera,
      gl.domElement
    );

    const handleDragStart = () => {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      };
      const handleDragEnd = () => {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
      };
  
      dragControls.addEventListener("dragstart", handleDragStart);
      dragControls.addEventListener("dragend", handleDragEnd);
  
      return () => {
        dragControls.removeEventListener("dragstart", handleDragStart);
        dragControls.removeEventListener("dragend", handleDragEnd);
        dragControls.dispose();
      };
    }, [camera, gl, orbitControlsRef]);

  return (
    <mesh ref={meshRef} position={model.position}>
      <primitive object={gltf.scene} />
    </mesh>
  );
};

export default DraggableModel;
