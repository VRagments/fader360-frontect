import { AxiosError } from 'axios';
import Hls from 'hls.js';
import { useMemo, useEffect, useState, useRef } from 'react';
import { BackSide } from 'three';
import { api_ListAssetSubtitles, api_ListPublicAssetSubtitles } from '../../../lib/axios';
import { backgroundSphereGeometryArgs } from '../../../lib/defaults';
import { handleErr } from '../../../lib/methods/handleErr';
import useZustand from '../../../lib/zustand/zustand';
import { FaderBackendAsset, FaderStoryType, FaderVideoSubtitlesType } from '../../../types/FaderTypes';
import { fetchSrtAndConvertToVttBlob, WebVTTSubsType } from '../AssetConsumption/Videos2d';

const BackgroundVideoDome = ({
    backendVideoAsset,
    projectId,
}: {
    backendVideoAsset: FaderBackendAsset;
    projectId: FaderStoryType['id'];
}) => {
    if (!Hls.isSupported()) {
        return <></>;
    }

    const videoSettings = useZustand((state) => state.siteData.videoSettings);
    const storeSetvideoSettings = useZustand((state) => state.methods.storeSetvideoSettings);
    const storeSetActiveSubtitle = useZustand((state) => state.methods.storeSetActiveSubtitle);

    const [vttSubs, setVttSubs] = useState<WebVTTSubsType[]>();

    useEffect(() => {
        api_ListAssetSubtitles(backendVideoAsset.id)
            .then((prvResult) => {
                if (prvResult) {
                    if ((prvResult as FaderVideoSubtitlesType[]).length) {
                        fetchSrtAndConvertToVttBlob(prvResult as FaderVideoSubtitlesType[])
                            .then((conversionRes) => {
                                conversionRes && setVttSubs(conversionRes);
                            })
                            .catch((e) => handleErr(e));
                    } else if ((prvResult as AxiosError).isAxiosError && (prvResult as AxiosError).response?.status === 422) {
                        api_ListPublicAssetSubtitles(projectId, backendVideoAsset.id)
                            .then((pubResult) => {
                                if (pubResult) {
                                    if ((pubResult as FaderVideoSubtitlesType[]).length) {
                                        fetchSrtAndConvertToVttBlob(pubResult as FaderVideoSubtitlesType[])
                                            .then((conversionRes) => {
                                                conversionRes && setVttSubs(conversionRes);
                                            })
                                            .catch((e) => handleErr(e));
                                    }
                                }
                            })
                            .catch((e) => handleErr(e));
                    }
                }
            })
            .catch((e) => handleErr(e));

        /* Setting to null at start, since ViewSettingsPanel checks for undefined in order to render/not render */
        storeSetActiveSubtitle(null);

        /* Remove <video> element (or rather, it's parent) on unMount */
        return () => {
            videoElementParent && videoElement && videoElementParent.removeChild(videoElement);
            storeSetActiveSubtitle(undefined);
        };
    }, [projectId, backendVideoAsset.id]);

    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const [subLanguages, setSubLanguages] = useState<string[]>([]);

    const [videoElement, videoElementParent] = useMemo(() => {
        if (!videoElementRef.current || videoElementRef.current.id !== backendVideoAsset.id) {
            setVttSubs(undefined);
            setSubLanguages([]);

            const videoElement = document.createElement('video');
            videoElement.id = backendVideoAsset.id;
            videoElement.loop = true; // TODO control this somewhere
            videoElement.append('Your browser does not support the video tag.');

            /* Needed in order to destroy <video> element on unMount: */
            const videoElementParent = document.createElement('div');
            videoElementParent.id = 'BackgroundVideoDome Video Parent Element';
            videoElementParent.appendChild(videoElement);

            const hls = new Hls();
            addHlsEventListeners(hls);

            hls.loadSource(backendVideoAsset.static_url);
            hls.attachMedia(videoElement);

            videoElementRef.current = videoElement;
            videoElementRef.current.play().catch((err) => handleErr(err));
        }

        if (vttSubs) {
            vttSubs.forEach((vttSub, idx) => {
                const vttBlob = new Blob([vttSub.text], {
                    type: 'text/plain',
                });

                const trackElement = document.createElement('track');

                trackElement.id = `${vttSub.lang}-track-${idx}`;
                trackElement.label = vttSub.lang;
                trackElement.srclang = vttSub.lang;
                trackElement.src = URL.createObjectURL(vttBlob);
                trackElement.oncuechange = (ev) => {
                    const trackElem = ev.target as HTMLTrackElement;

                    if (trackElem && trackElem.default && trackElem.track.activeCues) {
                        // @ts-expect-error -> yes, 'text' does exist
                        storeSetActiveSubtitle(trackElem.track.activeCues[0] ? (trackElem.track.activeCues[0].text as string) : null);
                    }
                };

                videoElementRef.current!.appendChild(trackElement);

                setSubLanguages((subLanguages) => [...subLanguages, vttSub.lang]);
            });

            for (const track of videoElementRef.current.textTracks) {
                track.mode = 'hidden';
            }
        }

        return [videoElementRef.current, videoElementRef.current.parentElement!];
    }, [backendVideoAsset, vttSubs]);

    useEffect(() => {
        storeSetvideoSettings({ subtitleLanguagesAvailable: subLanguages });
    }, [subLanguages]);

    useEffect(() => {
        if (videoElementRef.current && vttSubs) {
            /* Set first trackElement as active: */
            if (!videoSettings.subtitleLanguage && videoSettings.subtitleLanguagesAvailable.length > 0) {
                storeSetvideoSettings({
                    subtitleLanguage: videoElementRef.current.textTracks[0].language,
                });
            }

            for (const child of videoElementRef.current.textTracks) {
                let matchedChildElement: HTMLTrackElement;

                /* Find the corresponding HTMLTrackElement so we can set 'default' property: */
                for (const childElem of videoElementRef.current.children) {
                    if ((childElem as HTMLTrackElement).srclang === child.language) {
                        matchedChildElement = childElem as HTMLTrackElement;
                    }
                }

                if (videoSettings.subtitles === false) {
                    storeSetActiveSubtitle(null);
                    child.mode = 'disabled';
                    matchedChildElement!.default = false;
                } else {
                    if (videoSettings.subtitleLanguage) {
                        if (child.language.includes(videoSettings.subtitleLanguage)) {
                            child.mode = 'showing';
                            matchedChildElement!.default = true;
                        } else {
                            child.mode = 'disabled';
                            matchedChildElement!.default = false;
                        }
                    }
                }
            }
        }
    }, [vttSubs, videoElement, videoSettings]);

    return (
        <>
            <mesh name='Background Video Dome' scale={[-1, 1, 1]}>
                <sphereGeometry attach='geometry' args={backgroundSphereGeometryArgs} name='Background Video Dome Geometry' />
                <meshBasicMaterial attach='material' side={BackSide} name='Background Video Dome Geometry'>
                    <videoTexture attach='map' args={[videoElement]} name='Background Video Dome VideoTexture' />
                </meshBasicMaterial>
            </mesh>
        </>
    );
};

function addHlsEventListeners(hls: Hls) {
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        // Use later?
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (_event, _data) {
        // console.log(`manifest loaded, found ${data.levels.length} quality level. event :`, event);
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
        handleErr(event, data);
    });
}

export default BackgroundVideoDome;
