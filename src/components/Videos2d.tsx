/* eslint-disable */
// @ts-nocheck
import { Html } from '@react-three/drei';
import { StoryAsset } from '../types/FaderTypes';
import Hls from 'hls.js';
import { useMemo, useRef } from 'react';
import { convertTRS } from '../methods/convertTRS';
import { useThree } from '@react-three/fiber';

type Videos2dProps = {
    video2dAssets: StoryAsset[] | undefined;
};
const Videos2d = (props: Videos2dProps) => {
    const { video2dAssets } = props;
    const camera = useThree().camera;

    const videoRefs = useRef<HTMLVideoElement[]>([]);
    const hlsArray = useRef<{ hls: Hls; videoSource: string }[]>([]);

    const memoizedReturn = useMemo(() => {
        if (videoRefs.current.length > 0) {
            videoRefs.current.map((_videoRef, idx) => {
                /* Once videoRefs have been set:  */
                hlsArray.current[idx].hls.loadSource(hlsArray.current[idx].videoSource);
                hlsArray.current[idx].hls.attachMedia(videoRefs.current[idx]);

                hlsArray.current[idx].hls.on(Hls.Events.ERROR, (event, data) => {
                    throw new Error(`${event}, ${data}`);
                });
            });
        }

        return (
            video2dAssets &&
            video2dAssets.map((video2dAsset, idx) => {
                // const video2dBackendAsset = translateId(video2dAsset.backendId);
                const video2dBackendAsset = {};
                const videoSrc = video2dBackendAsset.static_url;

                /* Insert per-asset Hls() into array at idx */
                hlsArray.current.splice(idx, 0, { hls: new Hls(), videoSource: videoSrc });

                const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ } =
                    video2dAsset.properties;

                const convertedTRS = convertTRS({
                    position: { x: positionX, y: positionY, z: positionZ },
                    rotation: { x: rotationX, y: rotationY, z: rotationZ },
                    scale: { x: scaleX, y: scaleY, z: scaleZ },
                    userPosition: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
                });

                return (
                    <Html
                        key={idx}
                        transform
                        occlude
                        position={convertedTRS.positionConverted}
                        rotation={convertedTRS.rotationConverted}
                        scale={convertedTRS.scaleConverted}
                        onUpdate={(self) => {
                            self.lookAt(camera.position);
                        }}
                    >
                        <div className='fader-3d-card'>
                            <video
                                /* add this <video> ref to an array of refs */
                                ref={(videoElement) => (videoRefs.current[idx] = videoElement as HTMLVideoElement)}
                                controls
                                playsInline
                                preload='none' // 'auto' once my internet is better
                                autoPlay={false}
                                crossOrigin='anonymous'
                                disablePictureInPicture
                                width={video2dBackendAsset.attributes.width}
                                height={video2dBackendAsset.attributes.height}
                                poster={video2dBackendAsset.preview_image as string}
                            />
                        </div>
                    </Html>
                );
            })
        );
        // should be JSON.stringify(videoRefs.current) but it crashes ('circular something')
    }, [video2dAssets, videoRefs.current.length]);

    if (!video2dAssets || !Hls.isSupported()) {
        if (!Hls.isSupported()) {
            alert('No HLS Support!');
        }
        return <></>;
    }

    return <>{memoizedReturn}</>;
};

export default Videos2d;

// useEffect(() => {
//     if (Hls.isSupported()) {
//         const hls = new Hls();

//         /* The following will not work. Because localhost is not serving file correctly / file not existant locally? */
//         // const videoSrc = './localAssets/sala2_a_cuina.mp4.m3u8';
//         const videoSrc = 'https://app.getfader.com/assets/700039f2-a078-4390-9619-77470e8fbedc/sala2_a_cuina.mp4.m3u8';

//         hls.loadSource(videoSrc);
//         hls.attachMedia(videoRef.current as HTMLVideoElement);

//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//             // window.canPlay = true; // wat?
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//             throw new Error(`${event}, ${data}`);
//         });
//     } else {
//         alert('No HLS Support!');
//     }
// }, [videoRef.current]);

// hlsArray.current[idx].on(Hls.Events.MANIFEST_PARSED, () => {
//     // alert('HLS Manifest Parsed');
//     // window.canPlay = true; // wat is this?
// });
// hlsArray.current[idx].on(Hls.Events.MEDIA_ATTACHED, () => {
//     console.log('%c[Videos2d]', 'color: #f846e7', `MEDIA_ATTACHED `);
// });
// hlsArray.current[idx].on(Hls.Events.ERROR, (event, data) => {
//     throw new Error(`${event}, ${data}`);
// });
