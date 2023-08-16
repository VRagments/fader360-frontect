import { FaderBackendAsset, FaderSceneType, FaderVideoSubtitlesType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementProps } from './AssetWrapper';
import Hls from 'hls.js';
import { useEffect, useMemo, useState } from 'react';
import { wrappers_UpdateSceneInLocalAndRemote } from '../../../lib/api_and_store_wrappers';
import { api_ListAssetSubtitles, api_ListPublicAssetSubtitles } from '../../../lib/axios';
import srtToWebVtt from '../../../lib/methods/srtToWebVtt';
import { handleErr } from '../../../lib/methods/handleErr';
import { AxiosError } from 'axios';
import useZustand from '../../../lib/zustand/zustand';

type Videos2dProps = {
    scene: FaderSceneType;
    storyVideo2dBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const Videos2d = (props: Videos2dProps) => {
    const { scene, storyVideo2dBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Video2D'].map((videoId, idx) => {
                const videoAsset = scene.data.assets[videoId];

                if (videoAsset) {
                    const videoBackendAsset = storyVideo2dBackendAssets[videoAsset.backendId];

                    /* Update the scene's duration to the longest Video asset's duration: */
                    if (videoBackendAsset.attributes.duration > parseFloat(scene.duration)) {
                        wrappers_UpdateSceneInLocalAndRemote({
                            ...scene,
                            duration: videoBackendAsset.attributes.duration.toString(),
                        });
                    }

                    return (
                        <AssetWrapper
                            key={`Video2d ${videoId} / ${idx}`}
                            scene={scene}
                            asset={videoAsset}
                            backendAsset={videoBackendAsset}
                            assetJsxElement={Video2dJsxElement}
                            viewMode={viewMode}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Videos2d;

export const Video2dJsxElement = ({ asset, backendAsset }: AssetJsxElementProps) => {
    const project_id = useZustand((state) => state.fader.faderStory?.id);

    const [subtitlesArr, setSubtitlesArr] = useState<FaderVideoSubtitlesType[]>();
    const [vttSubs, setVttSubs] = useState<WebVTTSubsType[]>();
    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (project_id && backendAsset) {
            api_ListAssetSubtitles(backendAsset.id)
                .then((prvResult) => {
                    if (prvResult) {
                        if ((prvResult as FaderVideoSubtitlesType[]).length) {
                            setSubtitlesArr(prvResult as FaderVideoSubtitlesType[]);
                        } else if ((prvResult as AxiosError).isAxiosError && (prvResult as AxiosError).response?.status === 422) {
                            api_ListPublicAssetSubtitles(project_id, backendAsset.id)
                                .then((pubResult) => {
                                    pubResult && setSubtitlesArr(pubResult as FaderVideoSubtitlesType[]);
                                })
                                .catch((e) => handleErr(e));
                        }
                    }
                })
                .catch((e) => handleErr(e));
        }
    }, [project_id, backendAsset]);

    useEffect(() => {
        if (subtitlesArr && subtitlesArr.length && !vttSubs) {
            fetchSrtAndConvertToVttBlob(subtitlesArr)
                .then((result) => setVttSubs(result))
                .catch((e) => handleErr(e));
        }
    }, [subtitlesArr, vttSubs]);

    const isPlaylist = backendAsset.static_url.includes('.m3u8');

    const hlsMemo = useMemo(() => {
        if (isPlaylist) {
            return { hls: new Hls({ debug: false }), videoSource: backendAsset.static_url };
        }
    }, [backendAsset]);

    useEffect(() => {
        if (videoRef && hlsMemo) {
            /* Once videoRefs have been set:  */
            hlsMemo.hls.loadSource(hlsMemo.videoSource);
            hlsMemo.hls.attachMedia(videoRef);

            // WARN commenting out error-event-catching for now since it leads to "RangeError: Maximum call stack size exceeded at 'Hls.trigger'" errors. Should be fixed in an upcoming HLS update, see https://github.com/video-dev/hls.js/pull/5549
            // hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
            //     handleErr(event, data);
            // });
        }
    }, [videoRef, hlsMemo]);

    if (!backendAsset || !asset || !Hls.isSupported()) {
        return <></>;
    } else {
        return (
            <video
                ref={setVideoRef}
                controls
                playsInline
                preload='auto'
                autoPlay={asset.data.autoPlay}
                loop={asset.data.loop}
                crossOrigin='anonymous'
                disablePictureInPicture
                className='min-w-full'
                poster={backendAsset.preview_image as string}
                src={isPlaylist ? undefined : backendAsset.static_url}
            >
                Your device does not support this form of video playback!
                {vttSubs &&
                    vttSubs.map((vttSubtitle, idx) => {
                        return (
                            <track
                                key={`track, ${idx}`}
                                kind='subtitles'
                                label={vttSubtitle.lang}
                                src={vttSubtitle.blobUrl}
                                srcLang={vttSubtitle.lang}
                            />
                        );
                    })}
            </video>
        );
    }
};

export const fetchSrtAndConvertToVttBlob = async (srtSubtitles: FaderVideoSubtitlesType[]) => {
    const vttSubsArr: WebVTTSubsType[] = [];
    let isLoaded = false;

    for (const [i, srtSubtitle] of srtSubtitles.entries()) {
        await fetchSrt(srtSubtitle.static_url)
            .then((srtResult) => {
                const webVtt = srtToWebVtt(srtResult);
                const vttBlob = new Blob([webVtt], {
                    type: 'text/plain',
                });

                const vttSub = {
                    lang: srtSubtitle.language,
                    text: webVtt,
                    blobUrl: URL.createObjectURL(vttBlob),
                };

                vttSubsArr.push(vttSub);

                if (i == srtSubtitles.length - 1) {
                    isLoaded = true;
                }
            })
            .catch((e) => {
                handleErr(e);
            });
    }

    let timer: number | NodeJS.Timeout;

    const returnAfterCompleted = () => {
        if (isLoaded) {
            return vttSubsArr;
        } else {
            timer && clearTimeout(timer);
            timer = setTimeout(returnAfterCompleted, 500);
        }
    };

    return returnAfterCompleted();
};

const fetchSrt = async (srtPath: string) => {
    const response = await fetch(srtPath);
    const responseText = await response.text();

    return responseText;
};

/**
 * Types
 */

export type WebVTTSubsType = { lang: string; text: string; blobUrl: string };
