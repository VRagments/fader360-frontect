import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { wrappers_UpdateSceneInLocalAndRemote } from '../../../lib/api_and_store_wrappers';
import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import Asset, { AssetJsxElementParams } from './Asset';

type AudiosProps = {
    scene: FaderSceneType;
    storyAudioBackendAssets: Record<string, FaderBackendAsset>;
};
const Audios = (props: AudiosProps) => {
    const { scene, storyAudioBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Audio'].map((audioId, idx) => {
                const audioAsset = scene.data.assets[audioId];

                if (audioAsset) {
                    const audioBackendAsset = storyAudioBackendAssets[audioAsset.backendId];

                    if (audioBackendAsset.attributes.duration > parseFloat(scene.duration)) {
                        //
                    }

                    /* Update the scene's duration to the longest Video asset's duration: */
                    if (audioBackendAsset.attributes.duration > parseFloat(scene.duration)) {
                        wrappers_UpdateSceneInLocalAndRemote({
                            ...scene,
                            duration: audioBackendAsset.attributes.duration.toString(),
                        });
                    }

                    return (
                        <Asset
                            key={`Audio ${audioId} / ${idx}`}
                            scene={scene}
                            asset={audioAsset}
                            backendAsset={audioBackendAsset}
                            assetJsxElement={AudioJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Audios;

const AudioJsxElement = ({ asset, backendAsset }: AssetJsxElementParams) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const hls = useRef({ hls: new Hls(), audioSource: backendAsset?.static_url });

    useEffect(() => {
        if (audioRef.current) {
            /* Once audioRefs have been set:  */
            hls.current.hls.loadSource(hls.current.audioSource as string);
            hls.current.hls.attachMedia(audioRef.current);

            hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
                throw new Error(`${event}, ${data}`);
            });
        }
    }, [audioRef.current]);

    if (!backendAsset || !Hls.isSupported()) {
        return <></>;
    } else {
        return (
            <audio
                ref={audioRef}
                className='block '
                controls
                autoPlay={asset.data.autoPlay}
                loop={asset.data.loop}
                preload='auto'
                style={{ width: `260px`, height: `20px` }}
            >
                Your browser does not support the audio element.
            </audio>
        );
    }
};
