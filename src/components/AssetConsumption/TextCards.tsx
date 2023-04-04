import { FaderSceneType } from '../../types/FaderTypes';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import Asset, { AssetJsxElementParams } from './Asset';

type TextCardsProps = {
    scene: FaderSceneType;
};
const TextCards = (props: TextCardsProps) => {
    const { scene } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['TextCard'].map((textCardId, idx) => {
                const textCardAsset = scene.data.assets[textCardId];

                if (textCardAsset) {
                    return (
                        <Asset
                            key={`TextCard ${textCardId} / ${idx}`}
                            scene={scene}
                            asset={textCardAsset}
                            assetJsxElement={TextCardJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default TextCards;

const TextCardJsxElement = ({ asset, assetDataRef }: AssetJsxElementParams) => {
    return (
        <div
            id={asset.id}
            className='fader-3d-card'
            style={{
                width: `${asset.data.cardWidth}px`,
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
            {assetDataRef.current.body}
        </div>
    );
};
