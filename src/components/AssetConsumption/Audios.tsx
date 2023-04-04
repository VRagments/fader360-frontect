import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import Asset, { AssetJsxElementParams } from './Asset';

type AudiosProps = {
    scene: FaderSceneType;
    storyAudioBackendAssets: Record<string, FaderBackendAsset>;
};
const Audios = (props: AudiosProps) => {
    const { scene, storyAudioBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Audio'].map((audioId, idx) => {
                const audioAsset = scene.data.assets[audioId];

                if (audioAsset) {
                    const audioBackendAsset = storyAudioBackendAssets[audioAsset.backendId];

                    return (
                        <Asset
                            key={`Audio ${audioId} / ${idx}`}
                            scene={scene}
                            asset={audioAsset}
                            backendAsset={audioBackendAsset}
                            assetJsxElement={AudioJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Audios;

const AudioJsxElement = ({ asset, backendAsset, assetDataRef }: AssetJsxElementParams) => {
    if (!backendAsset) {
        return <></>;
    }

    return (
        <div
            id={asset.id}
            className='fader-3d-card'
            style={{
                color: assetDataRef.current.textColor,
                backgroundColor: assetDataRef.current.backgroundOn
                    ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                    : 'transparent',
                border: `2px ${assetDataRef.current.frameOn ? 'solid' : 'none'} ${mergeHexAndOpacityValues(
                    assetDataRef.current.frameColor,
                    assetDataRef.current.frameOpacity
                )}`,
            }}
        >
            <div
                className='bold mb-1 w-full rounded p-1 px-2 text-lg'
                style={{
                    backgroundColor: assetDataRef.current.backgroundOn
                        ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                        : 'transparent',
                }}
            >
                {assetDataRef.current.headline}
            </div>
            <audio
                src={backendAsset.static_url}
                style={{ width: `${backendAsset.attributes.width}px`, height: `${backendAsset.attributes.height}px` }}
            />
        </div>
    );
};
