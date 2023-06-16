import * as THREE from "three";
import { ColladaLoader } from "collada-loader";
import { OrbitControls } from "orbit-controls";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

async function init() {
    const modelLoader = new ColladaLoader();
    const textureLoader = new THREE.TextureLoader();
    const scene = new THREE.Scene();

    const ground = await modelLoader.loadAsync("./models/ground.dae");
    const groundTexture = await textureLoader.loadAsync("./models/ground.png");
    ground.scene.children[0].material.map = groundTexture;
    scene.add(ground.scene);

    const camera = new THREE.PerspectiveCamera(50,
        window.innerWidth / window.innerHeight, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x079bb0, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.y = 2;
    camera.position.z = 5;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    const cannonDebugger = new CannonDebugger(scene, world);

    const groundShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

    let dt;
    const clock = new THREE.Clock();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    function render() {
        requestAnimationFrame(render);
        orbitControls.update();
        dt = clock.getDelta();
        world.step(dt);
        cannonDebugger.update();
        renderer.render(scene, camera);
    }
    render();
}

init();
