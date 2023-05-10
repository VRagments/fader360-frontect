import { FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper from './AssetWrapper';

type TextCardsProps = {
    scene: FaderSceneType;
    viewMode: boolean;
};
const TextCards = (props: TextCardsProps) => {
    const { scene, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['TextCard'].map((textCardId, idx) => {
                const textCardAsset = scene.data.assets[textCardId];

                if (textCardAsset) {
                    return (
                        <AssetWrapper
                            key={`TextCard ${textCardId} / ${idx}`}
                            scene={scene}
                            asset={textCardAsset}
                            assetJsxElement={TextCardJsxElement}
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

export default TextCards;

const TextCardJsxElement = () => {
    return <div></div>;
};
