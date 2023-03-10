import { useTexture } from '@react-three/drei';
import { NodeProps } from '@react-three/fiber';
import Hls from 'hls.js';
import { useMemo, useEffect } from 'react';
import { BackSide, SphereGeometry, sRGBEncoding, Texture } from 'three';
import { handleAxiosError } from '../lib/axios';
import { FaderBackendAsset, FaderScene } from '../types/FaderTypes';

const WhichBackground = ({
    sceneBackendAssets,
    environmentPreset: _ignored_environmentPreset = 'none',
}: {
    sceneBackendAssets: FaderBackendAsset[];
    environmentPreset: FaderScene['environment']['preset']; // TODO unused for now
}) => {
    // TODO very lamey hardcodey
    if (sceneBackendAssets.length) {
        if (sceneBackendAssets[0].media_type === 'video/mp4') {
            return <BackgroundVideoDome path={sceneBackendAssets[0].static_url} />;
        } else {
            return <BackgroundImageDome path={sceneBackendAssets[0].static_url} />;
        }
    } else {
        return <></>;
    }
};

export const backgroundSphereGeometryArgs: NodeProps<SphereGeometry, typeof SphereGeometry>['args'] = [100, 64, 64]; // first arg does sort of 'zoom' (sphere radius)

const BackgroundImageDome = ({ path }: { path: string }) => {
    const backgroundTexture = useTexture(path, (tex) => {
        const texture = tex as Texture;
        texture.encoding = sRGBEncoding;
        texture.generateMipmaps = false;
        texture.name = 'Background Image Dome Texture';
    });

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
};

const BackgroundVideoDome = ({ path }: { path: string }) => {
    if (!Hls.isSupported()) {
        return <></>;
    }

    const [videoElement, videoElementParent] = useMemo(() => {
        const videoElement = document.createElement('video');
        videoElement.id = 'BackgroundVideoDome Video Element';
        videoElement.loop = true;
        videoElement.append('Your browser does not support the video tag.');

        /* Needed in order to destroy <video> element on unMount: */
        const videoElementParent = document.createElement('div');
        videoElementParent.id = 'BackgroundVideoDome Video Parent Element';
        videoElementParent.appendChild(videoElement);

        const hls = new Hls();
        addHlsEventListeners(hls);

        hls.loadSource(path);
        hls.attachMedia(videoElement);

        videoElement.play().catch((err) => handleAxiosError(err));

        return [videoElement, videoElementParent];
    }, [path]);

    useEffect(() => {
        return () => {
            videoElementParent.removeChild(videoElement);
        };
    }, []);

    return (
        <mesh name='Background Video Dome' scale={[-1, 1, 1]}>
            <sphereGeometry attach='geometry' args={backgroundSphereGeometryArgs} name='Background Video Dome Geometry' />
            <meshBasicMaterial attach='material' side={BackSide} name='Background Video Dome Geometry'>
                <videoTexture attach='map' args={[videoElement]} name='Background Video Dome VideoTexture' />
            </meshBasicMaterial>
        </mesh>
    );
};

function addHlsEventListeners(hls: Hls) {
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        //
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (_event, _data) {
        // console.log(`manifest loaded, found ${data.levels.length} quality level. event :`, event);
    });

    hls.on(Hls.Events.ERROR, function (_event, data) {
        throw new Error(JSON.stringify(data));
    });
}

export default WhichBackground;
