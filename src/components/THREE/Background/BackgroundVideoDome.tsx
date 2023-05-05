import Hls from 'hls.js';
import { useMemo, useEffect } from 'react';
import { BackSide } from 'three';
import { handleAxiosError } from '../../../lib/axios';
import { backgroundSphereGeometryArgs } from '../../../lib/defaults';

const BackgroundVideoDome = ({ path }: { path: string }) => {
    if (!Hls.isSupported()) {
        return <></>;
    }

    const [videoElement, videoElementParent] = useMemo(() => {
        const videoElement = document.createElement('video');
        videoElement.id = 'BackgroundVideoDome Video Element';
        videoElement.loop = true; // TODO control this somewhere
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
        /* Remove <video> element (or rather, it's parent) on unMount */
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
        // Use later?
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (_event, _data) {
        // console.log(`manifest loaded, found ${data.levels.length} quality level. event :`, event);
    });

    hls.on(Hls.Events.ERROR, function (_event, data) {
        throw new Error(JSON.stringify(data));
    });
}

export default BackgroundVideoDome;
