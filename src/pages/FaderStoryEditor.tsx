import { wrappers_FirstProjectInitAndSendToStore, wrappers_AuthTokenToStore } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import buildConfig from '../buildConfig';
import ScenePicker from '../components/ScenePicker';
import FaderThreeCanvas from '../components/FaderThreeCanvas';
import { FaderSceneType } from '../types/FaderTypes';
import AssetUi from '../components/AssetUI/AssetUi';

const FaderStoryEditor = () => {
    const apiAuthToken = useZustand((state) => state.siteData.apiAuthToken);

    /* TODO Grabs AuthToken or fetches/initializes projects, scenes, backendAssets - This might be placed elsewhere? TBD */
    useEffect(() => {
        if (apiAuthToken) {
            wrappers_FirstProjectInitAndSendToStore().catch((err: string) => new Error(err));
        } else {
            wrappers_AuthTokenToStore({
                username: buildConfig.login.username as string,
                password: buildConfig.login.password as string,
            }).catch((err: string) => new Error(err));
        }
    }, [apiAuthToken]);

    /* If no sub-route with Scene's guid ( '/edit/:sceneIdParam' ) exists, returns undefined. Renders preview_image then (see below) */
    const { sceneIdParam } = useParams();
    const faderStory = useZustand((state) => state.fader.faderStory);
    const faderScenes = useZustand((state) => state.fader.faderScenes);
    const [currentScene, setCurrentScene] = useState<FaderSceneType | null>(null);

    useEffect(() => {
        if (sceneIdParam && faderStory && faderScenes) {
            setCurrentScene(faderScenes[sceneIdParam]);
        }
    }, [sceneIdParam, faderStory, faderScenes]);

    /* Debug mode active with a `?debug` url param */
    const debug = buildConfig.dev.debugURLenabled ? (useSearchParams()[0].get('debug') === '' ? true : false) : false;

    if (!faderStory) {
        return <>Cannot load Story data!</>;
    }

    return (
        <div className='relative flex-1 bg-slate-800'>
            {currentScene ? (
                <div className='h-full w-full'>
                    <FaderThreeCanvas scene={currentScene} debug={debug} />
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
                {/* Leva Gui: */}
                <AssetUi currentScene={currentScene} />

                {/* Other Control elements:  */}
                <div className='absolute top-0 z-10 flex h-full w-full flex-col items-center justify-between'>
                    {/* Story/User: */}
                    <div className='m-2 w-1/5 rounded-md bg-slate-500 bg-opacity-75 py-1 px-2 text-center text-slate-200 drop-shadow-2xl'>
                        <b>{faderStory.name}</b> by <i>{faderStory.user_display_name}</i>
                    </div>

                    {/* Scene picking: */}
                    {faderScenes && <ScenePicker storyData={faderStory.data} currentSceneId={sceneIdParam} faderScenes={faderScenes} />}
                </div>
            </div>
        </div>
    );
};

export default FaderStoryEditor;
