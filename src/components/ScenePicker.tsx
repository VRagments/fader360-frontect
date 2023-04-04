import { Link } from 'react-router-dom';
import { FaderSceneType, FaderStoryType } from '../types/FaderTypes';
import { ZustandState } from '../types/ZustandTypes';

type ScenePickerProps = {
    storyData: FaderStoryType['data'];
    faderScenes: NonNullable<ZustandState['fader']['faderScenes']>;
    currentSceneId: FaderSceneType['id'] | undefined;
};
const ScenePicker = ({ storyData, faderScenes, currentSceneId }: ScenePickerProps) => {
    return (
        <div className='relative m-2 flex w-1/3 items-center justify-center rounded-md bg-slate-500 bg-opacity-75 py-1 px-2 text-center text-slate-200 drop-shadow-2xl'>
            {storyData.sceneOrder.map((sceneId, idx, arr) => {
                let classNames = 'pointer-events-auto m-1 inline-block flex-1 justify-self-center rounded-md p-1';
                if (sceneId === currentSceneId) {
                    classNames = classNames + ' bg-orange-600';
                } else {
                    classNames = classNames + ' bg-slate-700/75 hover:bg-slate-500';
                }

                const sceneName = faderScenes[sceneId].name;

                return (
                    <Link key={`${sceneId} - ${idx}`} to={`/edit/${sceneId}`} className={classNames}>
                        {idx + 1}/{arr.length}:<div>{sceneName}</div>
                    </Link>
                );
            })}
        </div>
    );
};

export default ScenePicker;
