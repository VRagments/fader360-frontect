import { useTexture } from '@react-three/drei';
import { NodeProps } from '@react-three/fiber';
import Hls from 'hls.js';
import { useMemo } from 'react';
import { BackSide, SphereGeometry, sRGBEncoding, Texture } from 'three';
import { handleAxiosError } from '../lib/axios';
import { FaderBackendAsset, FaderScene } from '../types/FaderTypes';

const WhichEnvironment = ({
    sceneAssets,
    environmentPreset: _ignored_environmentPreset = 'none',
}: {
    sceneAssets: FaderBackendAsset[];
    environmentPreset: FaderScene['environment']['preset']; // TODO unused for now
}) => {
    // TODO very lamey hardcodey
    if (sceneAssets.length === 1) {
        if (sceneAssets[0].media_type === 'video/mp4') {
            return <BackgroundVideoDome path={sceneAssets[0].static_url} />;
        } else {
            return <BackgroundImageDome path={sceneAssets[0].static_url} />;
        }
    } else {
        return <></>;
    }
};

const sphereGeometryArgs: NodeProps<SphereGeometry, typeof SphereGeometry>['args'] = [10, 64, 64];

const BackgroundImageDome = ({ path }: { path: string }) => {
    const backgroundMap = useTexture(path, (texture) => {
        (texture as Texture).encoding = sRGBEncoding; // This is an assumption, though
    });

    return (
        <mesh name='Background Image Dome'>
            <sphereGeometry
                attach='geometry'
                args={sphereGeometryArgs} // first arg does sort of 'zoom' (sphere radius)
                name='Background Image Dome Geometry'
            />
            <meshBasicMaterial
                attach='material'
                map={backgroundMap}
                side={BackSide}
                toneMapped={false}
                name='Background Image Dome Material'
            />
        </mesh>
    );
};

const BackgroundVideoDome = ({ path }: { path: string }) => {
    if (!Hls.isSupported()) {
        return <></>;
    }

    const video = useMemo(() => {
        const videoElement = document.createElement('video');
        videoElement.crossOrigin = 'Anonymous';
        videoElement.loop = true;
        videoElement.append('Your browser does not support the video tag.');

        const hls = new Hls();
        addHlsEventListeners(hls);

        hls.loadSource(path);
        hls.attachMedia(videoElement);

        videoElement.play().catch((err) => handleAxiosError(err));

        return videoElement;
    }, [path]);

    return (
        <mesh>
            <sphereGeometry
                attach='geometry'
                args={sphereGeometryArgs} // first arg does sort of 'zoom' (sphere radius)
                name='Background Video Dome Geometry'
            />
            <meshBasicMaterial attach='material' side={BackSide} name='Background Video Dome Geometry'>
                <videoTexture attach='map' args={[video]} name='Background Video Dome Geometry' />
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

export default WhichEnvironment;
