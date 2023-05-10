import { FaderSceneType } from '../../../types/FaderTypes';
import Asset from './Asset';

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

const TextCardJsxElement = () => {
    return <div></div>;
};
