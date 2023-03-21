import { useTexture } from '@react-three/drei';
import { useControls } from 'leva';
import { useState } from 'react';
import { Texture, sRGBEncoding, BackSide } from 'three';
import { FaderScene } from '../../types/FaderTypes';
import { backgroundSphereGeometryArgs } from '../WhichEnvironment';
import GroundProjectedEnvironment from './GroundProjectedEnvironment';

const BackgroundImageDome = ({ path, environment }: { path: string; environment: FaderScene['environment'] }) => {
    const { preset: _ignored_preset, enableGroundIn360, positionY } = environment;
    const [enableGround, setEnableGround] = useState(enableGroundIn360);

    const backgroundTexture = useTexture(path, (tex) => {
        const texture = tex as Texture;
        texture.encoding = sRGBEncoding;
        texture.generateMipmaps = false;
        texture.name = 'Background Image Dome Texture';
    });

    /* GUI Panel for initial enableGround toggle */
    useControls({
        enableGround: {
            label: 'Enable Ground',
            value: enableGround,
            onChange: (val: boolean) => {
                setEnableGround(val);
            },
        },
    });

    if (enableGround) {
        return <GroundProjectedEnvironment texture={backgroundTexture} height={positionY} />;
    } else {
        return (
            <>
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
            </>
        );
    }
};

export default BackgroundImageDome;
