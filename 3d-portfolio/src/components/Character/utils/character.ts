import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      let modelUrl = "";
      try {
        if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
          const encryptedBlob = await decryptFile(
            "/models/character.enc",
            "MyCharacter12"
          );
          modelUrl = URL.createObjectURL(new Blob([encryptedBlob]));
        } else {
          throw new Error("Web Crypto API not available");
        }
      } catch (err) {
        console.warn("Decryption failed or not supported, falling back to raw model:", err);
        modelUrl = "/models/character.glb";
      }

      let character: THREE.Object3D;
      loader.load(
        modelUrl,
        async (gltf) => {
          character = gltf.scene;
          await renderer.compileAsync(character, camera, scene);
          character.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              child.castShadow = true;
              child.receiveShadow = true;
              mesh.frustumCulled = true;
            }
          });
          resolve(gltf);
          setCharTimeline(character, camera);
          setAllTimeline();
          const footR = character.getObjectByName("footR");
          const footL = character.getObjectByName("footL");
          if (footR) footR.position.y = 3.36;
          if (footL) footL.position.y = 3.36;
          dracoLoader.dispose();
        },
        undefined,
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });
  };

  return { loadCharacter };
};

export default setCharacter;
