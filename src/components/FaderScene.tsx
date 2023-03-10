import useZustand from '../lib/zustand/zustand';
import { filterStoryAssetsByType } from '../methods/faderHelpers';
import { FaderScene as FaderSceneType, FaderStoryAsset } from '../types/FaderTypes';
import TextCards from './TextCards';
import WhichBackground from './WhichBackground';

type FaderSceneProps = {
    currentScene: FaderSceneType;
    currentSceneAssets: Record<string, FaderStoryAsset>;
};
export const FaderScene = (props: FaderSceneProps) => {
    const { currentScene, currentSceneAssets } = props;
    const faderStoryBackendAssets = useZustand((state) => state.faderStoryData.backendAssets);

    return (
        <>
            <WhichBackground
                sceneBackendAssets={currentScene.assetIds.map((assetId) => faderStoryBackendAssets[assetId])}
                environmentPreset={currentScene.environment.preset}
            />

            {currentScene.assetOrderByGroup.TextCard?.length && (
                <TextCards
                    textCardIds={currentScene.assetOrderByGroup.TextCard}
                    sceneTextCardAssets={filterStoryAssetsByType('TextCard', currentSceneAssets)}
                />
            )}
        </>
    );
};
