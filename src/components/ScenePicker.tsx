import { forwardRef } from 'react';
import { wrappers_SetSceneIdInStoreAndUrl } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { FaderSceneType, FaderStoryType } from '../types/FaderTypes';
import { ZustandState } from '../types/ZustandTypes';

const classNames = 'relative pointer-events-auto block m-1 p-1 grow rounded-md transition-colors duration-700';

type ScenePickerPropsType = {
    storyData: FaderStoryType['data'];
    faderScenes: NonNullable<ZustandState['fader']['faderScenes']>;
    viewMode: boolean;
};
const ScenePicker = forwardRef<HTMLSpanElement, ScenePickerPropsType>(
    ({ storyData, faderScenes, viewMode = true }: ScenePickerPropsType, scenePickerViewModeProgressRef) => {
        const currentSceneId = useZustand((state) => state.fader.currentFaderSceneId);
        const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

        return (
            /* Root element of ScenePicker bar: */
            <div className='mb-3 flex w-1/3 content-center justify-between rounded-md bg-slate-500 bg-opacity-75 p-1 text-slate-200 drop-shadow-2xl'>
                {/* Maps all Scenes in correct order and display in ScenePicker as consecutive buttons: */}
                {storyData.sceneOrder.map((orderedSceneId, idx, arr) => {
                    const scene = faderScenes[orderedSceneId];
                    const isActiveScene = orderedSceneId === currentSceneId;
                    const sceneNotYetPlayed = arr.indexOf(orderedSceneId) > arr.indexOf(currentSceneId);

                    /* "view/" (FaderStoryViewer) vs. "edit/" (FaderStoryEditor): */
                    if (viewMode) {
                        return returnViewModeMarkup(
                            idx,
                            orderedSceneId,
                            scene,
                            isActiveScene,
                            sceneNotYetPlayed,
                            classNames,
                            storeSetCurrentSceneId,
                            arr.length,
                            scenePickerViewModeProgressRef
                        );
                    } else {
                        return returnEditModeMarkup(idx, orderedSceneId, scene.name, isActiveScene, classNames, arr.length);
                    }
                })}
            </div>
        );
    }
);

/** Returns ViewMode ScenePicker (only 'navigatable' scenes are clickable, shows progress for Story-play) */
const returnViewModeMarkup = (
    index: number,
    orderedSceneId: string,
    scene: FaderSceneType,
    isActiveScene: boolean,
    sceneNotYetPlayed: boolean,
    styles: string,
    onClickCallback: (sceneId: FaderSceneType['id']) => void,
    sceneOrderArrayLength: number,
    scenePickerViewModeProgressRef: React.ForwardedRef<HTMLSpanElement>
) => {
    let viewModeClassNames = styles;
    let onClickCb: () => void = () => onClickCallback(orderedSceneId);
    let tooltipText = undefined;

    if (scene.navigatable) {
        viewModeClassNames += ' cursor-pointer';
    } else {
        viewModeClassNames += ' cursor-not-allowed';
        tooltipText = 'Scene can not be navigated to!';
        onClickCb = () => null;
    }

    if (isActiveScene) {
        viewModeClassNames += ' bg-orange-600';
    } else {
        viewModeClassNames += ' bg-slate-600 hover:bg-slate-500 hover:transition-none';
    }

    return (
        <div key={`${orderedSceneId} - ${index}`} className={viewModeClassNames} onClick={onClickCb} title={tooltipText}>
            {/* Pulsing total Time of scene superimposed on Scene element: */}
            {isActiveScene && (
                <span className='absolute right-0 animate-pulse pr-1 text-5xl text-slate-100/50'>{parseInt(scene.duration)}s</span>
            )}

            {/* Scene Description (scene n of n-total, scene name) */}
            {returnSceneDescriptor(index, scene.name, sceneOrderArrayLength)}

            {/* Progress bar under Scene-picking-element: */}
            <div key={`progress-bar - ${orderedSceneId} - ${index}`} className='progress-bar-background'>
                {isActiveScene ? (
                    <span ref={scenePickerViewModeProgressRef} className='progress-bar' style={{ width: 0 }} />
                ) : sceneNotYetPlayed ? (
                    <span style={{ width: 0 }} />
                ) : (
                    /* Already played scenes: */
                    <span className='progress-bar !w-full !bg-slate-400' />
                )}
            </div>
        </div>
    );
};

/** Returns Edit-mode ScenePicker, full functionality (no progress bars though, for example) */
const returnEditModeMarkup = (
    index: number,
    orderedSceneId: string,
    sceneName: string,
    isActiveScene: boolean,
    styles: string,
    sceneOrderArrayLength: number
) => {
    const editModeClassNames = styles + ' !duration-200 cursor-pointer';

    return (
        <div
            key={`${orderedSceneId} - ${index}`}
            className={
                isActiveScene
                    ? editModeClassNames + ' bg-orange-600'
                    : editModeClassNames + ' bg-slate-600 hover:bg-slate-500 hover:transition-none'
            }
            onClick={() => wrappers_SetSceneIdInStoreAndUrl(orderedSceneId)}
        >
            {/* Scene Description (scene n of n-total, scene name) */}
            {returnSceneDescriptor(index, sceneName, sceneOrderArrayLength)}
        </div>
    );
};

const returnSceneDescriptor = (index: number, sceneName: string, sceneOrderArrayLength: number) => {
    return (
        <>
            <div>
                {index + 1}/{sceneOrderArrayLength}:
            </div>
            <div>{sceneName}</div>
        </>
    );
};

export default ScenePicker;
