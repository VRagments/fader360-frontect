import { wrappers_FirstProjectInitAndSendToStore } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import buildConfig from '../buildConfig';
import ScenePicker from '../components/ScenePicker';
import FaderThreeCanvas from '../components/THREE/FaderThreeCanvas';
import AssetUi from '../components/AssetUI/AssetUi';
import PanelsSlideOut from '../components/AssetUI/PanelsSlideOut';
import OptionsPanel from '../components/AssetUI/OptionsPanel';

export type FaderStoryEditorViewerPropsType = {
    storyId: string | null;
};
const FaderStoryEditor = ({ storyId }: FaderStoryEditorViewerPropsType) => {
    const faderScenes = useZustand((state) => state.fader.faderScenes);
    const faderStory = useZustand((state) => state.fader.faderStory);
    const currentSceneId = useZustand((state) => state.fader.currentFaderSceneId);

    useEffect(() => {
        /* A storyid is provided via query param, and there is none set yet, or the current faderStory is stale: */
        if (storyId && (!faderStory || storyId !== faderStory.id)) {
            wrappers_FirstProjectInitAndSendToStore(storyId).catch((err: string) => new Error(err));
        }
    }, [storyId]);

    /* Sets options side panel ('' opens the side panel), set to open on scene-switch */
    const [openPanel, setOpenPanel] = useState<'' | 'assets' | 'options'>('');
    useEffect(() => {
        if (currentSceneId) {
            setOpenPanel('');
        }
    }, [currentSceneId]);

    /* Get Canvas dimensions on-screen to correctly position options side panel: */
    const faderThreeCanvasParentRef = useRef<HTMLDivElement>(null);
    const [assetPanelParentRect, setAssetPanelParentRect] = useState({ x: 0, y: 0 });
    useEffect(() => {
        if (faderThreeCanvasParentRef.current) {
            const elemRect = faderThreeCanvasParentRef.current.getBoundingClientRect();
            setAssetPanelParentRect({ x: -elemRect.width - 10, y: elemRect.top - 10 }); // '10' is a hardcoded leva value
        }
    }, [faderThreeCanvasParentRef.current]);

    /* Debug mode active with a `?debug` url param */
    const debug = buildConfig.dev.debugURLenabled ? (useSearchParams()[0].get('debug') === '' ? true : false) : false;

    if (!storyId) {
        return <div className='text-slate-300'>No Story id provided!</div>;
    } else if (!faderStory) {
        return (
            <div className='text-slate-300'>
                Cannot load Story data! Are you sure you're logged in?
                <br />
                <br />
                <a href={`view/?project_id=${storyId}`}>View this Story</a>
            </div>
        );
    } else if (!faderScenes) {
        return <div className='text-slate-300'>Cannot load Scenes, does this FaderStory have any Scenes created?</div>;
    } else {
        return (
            <div className='relative h-full w-full flex-1 bg-slate-800'>
                {faderScenes[currentSceneId] ? (
                    <div ref={faderThreeCanvasParentRef} className='h-full w-full'>
                        <FaderThreeCanvas scene={faderScenes[currentSceneId]} viewMode={false} debug={debug} />
                    </div>
                ) : (
                    <>
                        {faderStory.preview_image && (
                            <div className='flex h-full w-full items-center justify-center drop-shadow-2xl'>
                                <img className='rounded-lg object-scale-down' src={faderStory.preview_image} />
                            </div>
                        )}
                    </>
                )}

                {/* Overlays (Scene picker, Scene name etc) : */}
                <div className='pointer-events-none' /* << to enable 'clicking through' to THREE canvas */>
                    {/* Leva Gui: */}
                    {faderScenes[currentSceneId] ? (
                        <>
                            {openPanel == '' && <PanelsSlideOut setOpenPanel={setOpenPanel} position={assetPanelParentRect} />}
                            {openPanel == 'assets' && <AssetUi setOpenPanel={setOpenPanel} currentScene={faderScenes[currentSceneId]} />}
                            {openPanel == 'options' && (
                                <OptionsPanel setOpenPanel={setOpenPanel} currentScene={faderScenes[currentSceneId]} />
                            )}
                        </>
                    ) : null}

                    {/* Other Control elements:  */}
                    <div className='absolute top-0 z-10 flex h-full w-full flex-col items-center justify-between'>
                        {/* Story/User: */}
                        <div className='m-2 w-1/5 rounded-md bg-slate-500 bg-opacity-75 px-2 py-1 text-center text-slate-200 drop-shadow-2xl'>
                            <b>{faderStory.name}</b> by <i>{faderStory.user_display_name}</i>
                        </div>

                        {/* Scene picking: */}
                        <ScenePicker storyData={faderStory.data} faderScenes={faderScenes} viewMode={false} />
                    </div>
                </div>
            </div>
        );
    }
};

export default FaderStoryEditor;
