import { ThreeEvent } from '@react-three/fiber';
import { useCallback } from 'react';
import { wrappers_SetSceneIdInStoreAndUrl } from '../../../lib/api_and_store_wrappers';
import useZustand from '../../../lib/zustand/zustand';
import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementProps } from './AssetWrapper';
import { Image2dJsxElement } from './Images2d';
import { TextCardJsxElement } from './TextCards';

type SceneLinksProps = {
    scene: FaderSceneType;
    storySceneLinkBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const SceneLinks = (props: SceneLinksProps) => {
    const { scene, storySceneLinkBackendAssets, viewMode } = props;
    const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

    const changeSceneCb = useCallback(
        (ev: Event | ThreeEvent<MouseEvent>, nextScene: string, viewMode: boolean) => {
            if (viewMode === true && nextScene && nextScene !== 'none') {
                storeSetCurrentSceneId(nextScene);
            } else if (viewMode === false && nextScene && nextScene !== 'none') {
                wrappers_SetSceneIdInStoreAndUrl(nextScene);
            }
        },
        [viewMode]
    );

    return (
        <>
            {scene.data.assetOrderByGroup['SceneLink'].map((sceneLinkId, idx) => {
                const sceneLinkAsset = scene.data.assets[sceneLinkId];

                if (sceneLinkAsset) {
                    const sceneLinkBackendAsset = storySceneLinkBackendAssets[sceneLinkAsset.backendId];

                    return (
                        <AssetWrapper
                            key={`SceneLink ${sceneLinkId} / ${idx}`}
                            scene={scene}
                            asset={sceneLinkAsset}
                            backendAsset={sceneLinkBackendAsset}
                            assetJsxElement={SceneLinkJsxElement}
                            userRootElement={{
                                additionalClassNames:
                                    '!aspect-square [&>*:last-child]:!hidden group-hover:[&>*:last-child]:!block group-hover:[&>*:first-child]:!hidden !justify-center group-hover:!w-60 group-hover:!outline-8 !outline-4 !outline-offset-2 group-hover:!outline-sky-500 group-hover:!flex-nowrap !flex-wrap !rounded-full !text-3xs !w-32 transition-width',
                                onClickCallback: (ev: Event) => changeSceneCb(ev, sceneLinkAsset.data.nextSceneId, viewMode),
                            }}
                            viewMode={viewMode}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default SceneLinks;

const SceneLinkJsxElement = (props: AssetJsxElementProps) => {
    const { asset, backendAsset, assetDataRef, viewMode } = props;
    if (!asset || !backendAsset || !assetDataRef || typeof viewMode !== 'boolean') {
        return <></>;
    }

    let groupJsxElement: (props: AssetJsxElementProps) => JSX.Element;

    switch (asset.type) {
        case 'Image':
            groupJsxElement = Image2dJsxElement;
            break;

        default:
            groupJsxElement = TextCardJsxElement;
            break;
    }

    return <div className='flex-w absolute opacity-30 group-hover:opacity-90'>{groupJsxElement(props)}</div>;
};
