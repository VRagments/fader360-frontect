import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import useZustand from '../../lib/zustand/zustand';
import { FaderScene } from './FaderScene';
import { Font, FontLoader, mergeBufferGeometries } from 'three-stdlib';
import { BufferGeometry, MathUtils, Mesh, MeshBasicMaterial, ShapeGeometry } from 'three';
import { useEffect, useState } from 'react';
import { FaderSceneType } from '../../types/FaderTypes';
import { backgroundSphereGeometryArgs } from '../../lib/defaults';

type FaderThreeCanvasProps = {
    scene: FaderSceneType;
    debug?: boolean;
};
const FaderThreeCanvas = (props: FaderThreeCanvasProps) => {
    const { scene, debug = false } = props;
    const faderStory = useZustand((state) => state.fader.faderStory);

    if (!faderStory) {
        return null;
    }

    return (
        <Canvas
            // TODO 'demand' would be lots nicer - for now it interferes with videoplayback, though:
            frameloop={'always'}
            id={'THREE (R3F) Canvas'}
            gl={{ antialias: true }}
        >
            {/* Since Front and Back are not synced between BackgroundImage/Video and GroundProjEnvironment (the latter's shader uses Worldspace), we rotate the rest: */}
            <group rotation={[0, MathUtils.degToRad(180), 0]}>
                <OrbitControls
                    enableZoom={debug}
                    enablePan={debug}
                    /* teeny positive value to change initial orientation: */
                    target={[-0.0001, 1.75, 0]}
                >
                    <PerspectiveCamera
                        attach={'camera'}
                        fov={60}
                        position={[0, 1.75, 0]}
                        name='default Perspective Camera'
                        makeDefault={!debug}
                        near={0.01}
                        far={backgroundSphereGeometryArgs[0] + 5}
                    />
                </OrbitControls>

                <FaderScene currentScene={scene} />

                {scene.data.enableGrid && <Grid />}

                {debug && <Debug />}
            </group>
        </Canvas>
    );
};

export default FaderThreeCanvas;

const Grid = () => {
    const [textMesh, setTextMesh] = useState<Mesh | undefined>(undefined);

    const gridSize = 10;

    useEffect(() => {
        const loader = new FontLoader();
        loader.load('./fonts/droid_sans_regular.typeface.json', (font) => {
            setTextMesh(generateFrontBackLeftRightTextMesh(font, gridSize));
        });
    }, []);

    return (
        <>
            {textMesh && <primitive object={textMesh} />}
            <gridHelper args={[gridSize, gridSize]} />
        </>
    );
};

const Debug = () => {
    return (
        <>
            <Sphere args={[0.333, 64, 64]}>
                <meshStandardMaterial metalness={1.0} roughness={0.1} attach='material' />
            </Sphere>
            {/* bumped Z by tiny amount to prevent flickering: */}
            <axesHelper position={[0, 0.0001, 0]} />
        </>
    );
};

function generateFrontBackLeftRightTextMesh(font: Font, textTranslationValue: number) {
    const matLite = new MeshBasicMaterial({
        color: 'lightblue',
        transparent: true,
        opacity: 0.5,
        depthTest: true,
        depthWrite: false,
    });

    const fontSize = 0.5;

    const frontGeometry = new ShapeGeometry(font.generateShapes('Front', fontSize), 2)
        .rotateY(MathUtils.degToRad(-90))
        .translate(textTranslationValue / 2, 0, -0.8);

    const backGeometry = new ShapeGeometry(font.generateShapes('Back', fontSize), 2)
        .rotateY(MathUtils.degToRad(90))
        .translate(-textTranslationValue / 2, 0, 0.7);

    const leftGeometry = new ShapeGeometry(font.generateShapes('Left', fontSize), 2).translate(-0.65, 0, -textTranslationValue / 2);

    const rightGeometry = new ShapeGeometry(font.generateShapes('Right', fontSize), 2)
        .rotateY(MathUtils.degToRad(-180))
        .translate(0.75, 0, textTranslationValue / 2);

    const shapesGeometryArray: BufferGeometry[] = [];
    shapesGeometryArray.push(frontGeometry, backGeometry, leftGeometry, rightGeometry);
    const mergedGeo = mergeBufferGeometries(shapesGeometryArray) as BufferGeometry;

    return new Mesh(mergedGeo, matLite);
}
