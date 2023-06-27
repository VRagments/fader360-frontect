import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaderStoryType } from './types/FaderTypes';
import useZustand from './lib/zustand/zustand';
import buildConfig from './buildConfig';
import FaderStory from './pages/FaderStory';

function App() {
    const [storyId, setStoryId] = useState<FaderStoryType['id'] | null>(null);
    const [debug, setDebug] = useState(false);

    return (
        <div className='flex h-screen w-screen flex-col'>
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <GetSearchParams setStoryId={setStoryId} setDebug={setDebug} />
                <Routes>
                    <Route path='view' element={<FaderStory mode={'view'} storyId={storyId} debug={debug} />} />
                    <Route path='edit' element={<FaderStory mode={'edit'} storyId={storyId} debug={debug} />} />
                    <Route
                        path='*'
                        element={<h1 className='text-white'>File not found! Please pick a different destination via navigation menu</h1>}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

type GetSearchParamsPropsType = {
    setStoryId: React.Dispatch<React.SetStateAction<string | null>>;
    setDebug: React.Dispatch<React.SetStateAction<boolean>>;
};
const GetSearchParams = ({ setStoryId, setDebug }: GetSearchParamsPropsType) => {
    const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

    const [searchParams] = useSearchParams();
    const storyIdParam = searchParams.get('project_id');
    const sceneIdParam = searchParams.get('scene_id');
    const debug = searchParams.get('debug');

    useEffect(() => {
        if (storyIdParam) {
            setStoryId(storyIdParam);
        }
        if (sceneIdParam) {
            storeSetCurrentSceneId(sceneIdParam);
        }
        if (debug !== null && buildConfig.dev.debugURLenabled) {
            setDebug(true);
        }
    }, [storyIdParam, sceneIdParam, debug]);

    return null;
};
