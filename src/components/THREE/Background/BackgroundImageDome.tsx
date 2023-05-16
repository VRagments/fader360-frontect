import { useTexture } from '@react-three/drei';
import { Texture, BackSide, SRGBColorSpace } from 'three';
import { backgroundSphereGeometryArgs } from '../../../lib/defaults';
import { FaderSceneDataType } from '../../../types/FaderTypes';
import GroundProjectedEnvironment from './GroundProjectedEnvironment';

const BackgroundImageDome = ({ path, environment }: { path: string; environment: FaderSceneDataType['environment'] }) => {
    const { enableGroundIn360, positionY, radius } = environment;

    const backgroundTexture = useTexture(path, (tex) => {
        const texture = tex as Texture;
        texture.colorSpace = SRGBColorSpace; // TODO this is an assumption, though it's very unlikely ppl will upload linear-hdri etc backgrounds?
        texture.generateMipmaps = false;
        texture.name = 'Background Image Dome Texture';
    });

    if (enableGroundIn360) {
        return <GroundProjectedEnvironment texture={backgroundTexture} height={positionY} radius={radius} />;
    } else {
        return (
            <mesh name='Background Image Dome' scale={[-1, 1, 1]}>
                <sphereGeometry attach='geometry' args={backgroundSphereGeometryArgs} name='Background Image Dome Geometry' />
                <meshBasicMaterial
                    attach='material'
                    map={backgroundTexture}
                    side={BackSide}
                    toneMapped={false}
                    name='Background Image Dome Material'
                />
            </mesh>
        );
    }
};

export default BackgroundImageDome;
