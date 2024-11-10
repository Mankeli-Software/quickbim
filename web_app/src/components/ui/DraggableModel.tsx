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
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, model.url);
  const { camera, gl } = useThree();
  const initialPosition = useRef<THREE.Vector3>(model.position.clone());
  const [position, setPosition] = React.useState(model.position);

  useEffect(() => {
    const dragControls = new DragControls(
      [groupRef.current as THREE.Object3D],
      camera,
      gl.domElement
    );

    const handleDragStart = () => {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
        // Store the initial position of the object at the start of the drag
        if (groupRef.current) {
          initialPosition.current.copy(groupRef.current.position);
        }
      };
      const handleDrag = (event: THREE.Event & { object: THREE.Object3D }) => {
        if (groupRef.current) {
          const position = event.object.position;
  
          // Lock position to the specified axis
          if (axis === "x") {
            position.x = initialPosition.current.x;
          } else if (axis === "y") {
            position.y = initialPosition.current.y;
          } else if (axis === "z") {
            position.z = initialPosition.current.z;
          }

          groupRef.current.position.copy(position);

          setPosition(position);

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
    <group ref={groupRef}>{floors.map((f, index) => {
        return(
          <mesh key={index} position={[position.x, position.y-index * 1.05, position.z]}>
            <primitive object={gltf.scene.clone()} />
          </mesh>)
    })}</group>
    
  );
};

export default DraggableModel;
