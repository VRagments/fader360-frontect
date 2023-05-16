import { useEffect, useMemo, useRef, useState } from 'react';
import ScenePicker from '../components/ScenePicker';
import FaderThreeCanvas from '../components/THREE/FaderThreeCanvas';
import { wrappers_ViewerProjectSyncToStore } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { FaderStoryEditorViewerPropsType } from './FaderStoryEditor';

const FaderStoryViewer = ({ storyId }: Omit<FaderStoryEditorViewerPropsType, 'debug'>) => {
    const faderScenes = useZustand((state) => state.fader.faderScenes);
    const faderStory = useZustand((state) => state.fader.faderStory);
    const currentSceneId = useZustand((state) => state.fader.currentFaderSceneId);
    const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

    const [play, setPlay] = useState(false);

    useEffect(() => {
        /* A storyid is provided via query param, and there is none set yet, or the current faderStory is stale: */
        if (storyId && (!faderStory || storyId !== faderStory.id)) {
            wrappers_ViewerProjectSyncToStore(storyId).catch((err: string) => new Error(err));
        }
    }, [storyId]);

    const orderedArrayOfScenes = useMemo(() => {
        if (faderStory && faderScenes && Object.keys(faderScenes).length) {
            return faderStory.data.sceneOrder.map((orderedId) => faderScenes[orderedId]);
        } else {
            return [];
        }
    }, [faderScenes, faderStory]);

    const currentPlaceInSceneOrderRef = useRef(0);
    const scenePickerViewModeProgressRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let timer: number | NodeJS.Timeout;
        let progressInterval: number | NodeJS.Timer;

        if (play && orderedArrayOfScenes.length) {
            if (currentSceneId) {
                /* Handles a user's click on navigatable FaderScene in <ScenePicker> : */
                if (currentSceneId !== orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id) {
                    currentPlaceInSceneOrderRef.current = orderedArrayOfScenes.findIndex((scene) => scene.id === currentSceneId);
                }

                const timerDurationMs = parseInt(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].duration) * 1000;

                timer = setTimeout(() => {
                    if (currentPlaceInSceneOrderRef.current < orderedArrayOfScenes.length - 1) {
                        currentPlaceInSceneOrderRef.current += 1;
                        storeSetCurrentSceneId(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id);
                    } else {
                        /* Wrap around to start: */
                        currentPlaceInSceneOrderRef.current = 0;
                    }
                }, timerDurationMs);

                const intervalFraction = 50;

                progressInterval = setInterval(() => {
                    if (scenePickerViewModeProgressRef.current) {
                        const currentWidth = parseInt(scenePickerViewModeProgressRef.current.style.width.replace('%', ''));

                        if (currentWidth < 100) {
                            scenePickerViewModeProgressRef.current.style.setProperty('width', `${currentWidth + 100 / intervalFraction}%`);
                        }
                    }
                }, timerDurationMs / intervalFraction);
            }
        }

        return () => {
            /* Clear existing timeOuts and intervals: */
            if (timer) {
                clearTimeout(timer);
            }
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [play, currentSceneId, orderedArrayOfScenes]);

    if (!storyId) {
        return <div className='text-slate-300'>No Story id provided!</div>;
    } else if (!faderStory) {
        return (
            <div className='text-slate-300'>
                Cannot load Story data!
                <br />
                <br />
                Is the Story set to 'discoverable'?
            </div>
        );
    } else if (!faderScenes) {
        return (
            <div className='text-slate-300'>
                Cannot load Scenes!
                <br />
                <br />
                Does this FaderStory have any Scenes created?
            </div>
        );
    } else if (!play) {
        /* Not clicked on play yet: */
        return (
            <div className='relative h-full'>
                <div className='absolute top-0 z-10 mx-auto flex h-full w-full flex-col items-center justify-center bg-black/75'>
                    <div className='rounded-full bg-white p-4'>
                        <div
                            className='cursor-pointer rounded-full bg-blue-400 p-6 text-white transition-colors hover:bg-blue-200 hover:text-blue-800'
                            onClick={() => {
                                setPlay(true);

                                /* Set an id to start the Anim loop */
                                orderedArrayOfScenes.length &&
                                    storeSetCurrentSceneId(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id);
                            }}
                        >
                            Play
                        </div>
                    </div>
                </div>

                {faderStory.preview_image && (
                    <div className='flex h-full w-full justify-center p-6 drop-shadow-2xl'>
                        <img className='h-[90%] rounded-lg object-scale-down' src={faderStory.preview_image} />
                    </div>
                )}
            </div>
        );
    } else {
        /* Play! */
        return (
            <div className='relative flex-1 bg-slate-800'>
                {faderScenes[currentSceneId] ? (
                    <div className='h-full w-full'>
                        <FaderThreeCanvas scene={faderScenes[currentSceneId]} viewMode={true} />
                    </div>
                ) : (
                    <>
                        {faderStory.preview_image && (
                            <div className='absolute w-full p-8 drop-shadow-2xl'>
                                <img className='m-auto max-h-[90%] w-4/5 rounded-lg object-scale-down' src={faderStory.preview_image} />
                            </div>
                        )}
                    </>
                )}
                {/* Overlays (Scene picker, Scene name etc) : */}
                <div className='pointer-events-none' /* << to enable 'clicking through' to THREE canvas */>
                    <div className='absolute top-0 z-30 flex h-full w-full flex-col items-center justify-between p-2'>
                        {/* Story/User: */}
                        <div className='w-1/5 rounded-md bg-slate-500 bg-opacity-75 px-2 py-1 text-center text-slate-200 drop-shadow-2xl'>
                            <b>{faderStory.name}</b> by <i>{faderStory.user_display_name}</i>
                        </div>

                        {/* Scene picking: */}
                        <ScenePicker
                            storyData={faderStory.data}
                            faderScenes={faderScenes}
                            viewMode={true}
                            ref={scenePickerViewModeProgressRef}
                            className='flex w-2/3 max-w-fit content-center justify-between justify-self-end rounded-md bg-slate-500 bg-opacity-75 p-1 text-slate-200 drop-shadow-2xl'
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default FaderStoryViewer;
