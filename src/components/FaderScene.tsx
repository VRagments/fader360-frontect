import useZustand from '../lib/zustand/zustand';
import { getBackendAssetsFromStoryAssetsByGroupType, getSortedBackendAssetsByGroupType } from '../methods/faderHelpers';
import { FaderSceneType } from '../types/FaderTypes';
import Audios from './AssetConsumption/Audios';
import Environments from './AssetConsumption/Environments';
import Images2d from './AssetConsumption/Images2d';
import Interactives from './AssetConsumption/Interactives';
import TextCards from './AssetConsumption/TextCards';
import Videos2d from './AssetConsumption/Videos2d';
import Background from './Background';

type FaderSceneProps = {
    currentScene: FaderSceneType;
};
export const FaderScene = (props: FaderSceneProps) => {
    const { currentScene } = props;
    const faderStoryBackendAssets = useZustand((state) => state.fader.faderStoryBackendAssets);

    if (!currentScene.data.assetOrderByGroup) {
        return null;
    }

    return (
        <group name='THREE (R3F) Canvas First Subgroup'>
            {currentScene.data.environment.preset && (
                <Background
                    scene360BackendAssets={getSortedBackendAssetsByGroupType(faderStoryBackendAssets)['360']}
                    backgroundEnvironment={currentScene.data.environment}
                />
            )}

            {currentScene.data.assetOrderByGroup['360']?.length && (
                <Environments
                    scene={currentScene}
                    storyEnvironmentBackendAssets={getBackendAssetsFromStoryAssetsByGroupType(
                        '360',
                        currentScene.data.assets,
                        faderStoryBackendAssets
                    )}
                />
            )}

            {currentScene.data.assetOrderByGroup.TextCard?.length && <TextCards scene={currentScene} />}

            {currentScene.data.assetOrderByGroup.Image2D?.length && (
                <Images2d
                    scene={currentScene}
                    storyImage2dBackendAssets={getBackendAssetsFromStoryAssetsByGroupType(
                        'Image2D',
                        currentScene.data.assets,
                        faderStoryBackendAssets
                    )}
                />
            )}

            {currentScene.data.assetOrderByGroup.Video2D?.length && (
                <Videos2d
                    scene={currentScene}
                    storyVideo2dBackendAssets={getBackendAssetsFromStoryAssetsByGroupType(
                        'Video2D',
                        currentScene.data.assets,
                        faderStoryBackendAssets
                    )}
                />
            )}

            {currentScene.data.assetOrderByGroup.Audio?.length && (
                <Audios
                    scene={currentScene}
                    storyAudioBackendAssets={getBackendAssetsFromStoryAssetsByGroupType(
                        'Audio',
                        currentScene.data.assets,
                        faderStoryBackendAssets
                    )}
                />
            )}

            {currentScene.data.assetOrderByGroup.Interactive?.length && (
                <Interactives
                    scene={currentScene}
                    storyInteractiveBackendAssets={getBackendAssetsFromStoryAssetsByGroupType(
                        'Interactive',
                        currentScene.data.assets,
                        faderStoryBackendAssets
                    )}
                />
            )}
        </group>
    );
};
