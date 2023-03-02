import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import useZustand from '../lib/zustand/zustand';
import WhichEnvironment from './WhichEnvironment';

type THREESceneProps = {
    sceneId: string;
};
const THREEScene = (props: THREESceneProps) => {
    const { sceneId } = props;
    const faderStory = useZustand((state) => state.project);
    const currentSceneAssets = useZustand((state) => state.faderStoryData.currentAssets);

    if (!faderStory || !sceneId) {
        return null;
    }

    const currentScene = faderStory.data.scenes[sceneId];

    return (
        <Canvas
            frameloop={'always'} // TODO 'demand' would be lots nicer - for now it interferes with videoplayback, though
            gl={{ antialias: true }}
        >
            <WhichEnvironment
                sceneAssets={currentScene.assetIds.map((assetId) => currentSceneAssets[assetId])}
                environmentPreset={currentScene.environment.preset}
            />
            <OrbitControls enablePan={false} enableZoom={false}>
                <PerspectiveCamera attach={'camera'} makeDefault position={[0, 1.75, 0]} name='default Perspective Camera' />
            </OrbitControls>
            {/* <directionalLight color={'white'} intensity={100} /> */}

            {/* Test Sphere */}
            {/* <Sphere args={[0.5, 64, 64]}>
                <meshStandardMaterial metalness={1.0} roughness={0.1} attach='material' />
            </Sphere> */}
        </Canvas>
    );
};

export default THREEScene;
