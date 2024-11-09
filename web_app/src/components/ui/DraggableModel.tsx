import React, { useRef, useEffect } from "react";
import { useLoader, extend, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import * as THREE from "three";
import { Floor } from "@/types";

extend({ DragControls });

interface DraggableModelProps {
  model: {
    id: number;
    url: string;
    position: THREE.Vector3;
  };
  floors: Floor[];
  orbitControlsRef: React.RefObject<any>;
  axis?: "x" | "y" | "z";
}

const DraggableModel: React.FC<DraggableModelProps> = ({ model, orbitControlsRef, axis, floors }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gltf = useLoader(GLTFLoader, model.url);
  const { camera, gl } = useThree();
  const initialPosition = useRef<THREE.Vector3>(model.position.clone());

  useEffect(() => {
    const dragControls = new DragControls(
      [meshRef.current as THREE.Object3D],
      camera,
      gl.domElement
    );

    const handleDragStart = () => {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
        // Store the initial position of the object at the start of the drag
        if (meshRef.current) {
          initialPosition.current.copy(meshRef.current.position);
        }
      };
      const handleDrag = (event: THREE.Event & { object: THREE.Object3D }) => {
        if (meshRef.current) {
          const position = event.object.position;
  
          // Lock position to the specified axis
          if (axis === "x") {
            position.x = initialPosition.current.x;
          } else if (axis === "y") {
            position.y = initialPosition.current.y;
          } else if (axis === "z") {
            position.z = initialPosition.current.z;
          }
  
          meshRef.current.position.copy(position);
        }
      };

      const handleDragEnd = () => {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
      };
  
      dragControls.addEventListener("dragstart", handleDragStart);
      dragControls.addEventListener("drag", handleDrag);
      dragControls.addEventListener("dragend", handleDragEnd);
  
      return () => {
        dragControls.removeEventListener("dragstart", handleDragStart);
        dragControls.removeEventListener("drag", handleDrag);
        dragControls.removeEventListener("dragend", handleDragEnd);
        dragControls.dispose();
      };
    }, [camera, gl, orbitControlsRef]);

  return (
    <group ref={meshRef}>{floors.map((f, index) => {
        return(
          <mesh key={index} position={[model.position.x, model.position.y-index * 1.05, model.position.z]}>
            <primitive object={gltf.scene.clone()} />
          </mesh>)
    })}</group>
    
  );
};

export default DraggableModel;
