import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import Nav from './components/Nav';
import FaderStoryEditor from './pages/FaderStoryEditor';
import FaderStoryViewer from './pages/FaderStoryViewer';
import { useEffect, useState } from 'react';
import { FaderStoryType } from './types/FaderTypes';
import useZustand from './lib/zustand/zustand';

function App() {
    const [storyId, setStoryId] = useState<FaderStoryType['id'] | null>(null);

    return (
        <div className='flex h-screen w-screen flex-col'>
            <Nav storyId={storyId} />

            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <GetSearchParams setStoryId={setStoryId} />
                <Routes>
                    <Route path='view' element={<FaderStoryViewer storyId={storyId} />} />
                    <Route path='edit' element={<FaderStoryEditor storyId={storyId} />} />
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
};
const GetSearchParams = ({ setStoryId }: GetSearchParamsPropsType) => {
    const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

    const [searchParams] = useSearchParams();
    const storyIdParam = searchParams.get('project_id');
    const sceneIdParam = searchParams.get('scene_id');

    useEffect(() => {
        if (storyIdParam) {
            setStoryId(storyIdParam);
        }
        if (sceneIdParam) {
            storeSetCurrentSceneId(sceneIdParam);
        }
    }, [storyIdParam, sceneIdParam]);

    return null;
};
