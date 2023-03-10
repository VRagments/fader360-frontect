import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { convertTRS } from '../methods/convertTRS';
import { FaderStoryAsset } from '../types/FaderTypes';
import { useEffect, useMemo, useRef } from 'react';
import { Camera } from 'three';
import { mergeHexAndOpacityValues } from '../methods/colorHelpers';
import { useControlsWrapper } from './UseControls';

type TextCardsProps = {
    textCardIds: string[];
    sceneTextCardAssets: Record<string, FaderStoryAsset>;
};
const TextCards = (props: TextCardsProps) => {
    const { textCardIds, sceneTextCardAssets } = props;

    return (
        <>
            {textCardIds.map((textCardId, idx) => {
                const textCardAsset = sceneTextCardAssets[textCardId];
                return <TextCard key={`TextCard ${textCardId} / ${idx}`} textCardAsset={textCardAsset} />;
            })}
        </>
    );
};

export default TextCards;

type TextCardProps = {
    textCardAsset: FaderStoryAsset;
};
const TextCard = ({ textCardAsset }: TextCardProps) => {
    const cameraPos = useThree().get().camera.position;
    const assetPropertiesRef = useRef(textCardAsset.properties);
    const assetDataRef = useRef(textCardAsset.data);

    const convertedTRSMemoized = useMemo(() => {
        const updatedTRS = convertTRSMemoWrapper(assetPropertiesRef, cameraPos);
        return updatedTRS;
    }, [assetPropertiesRef.current]);

    const [, levaSetValues] = useControlsWrapper({ assetPropertiesRef, assetDataRef });

    useEffect(() => {
        assetPropertiesRef.current = textCardAsset.properties;
        assetDataRef.current = textCardAsset.data;

        levaSetValues({
            posVertical: textCardAsset.properties.rotationX,
            posHorizontal: textCardAsset.properties.rotationY,
            posDistance: textCardAsset.properties.positionZ,
            rotTilt: textCardAsset.properties.rotationZ,
            scale: textCardAsset.properties.scale,
            headline: textCardAsset.data.headline,
            body: textCardAsset.data.body,
            textColor: textCardAsset.data.textColor,
            backgroundOn: textCardAsset.data.backgroundOn,
            backgroundColor: textCardAsset.data.backgroundColor,
            backgroundOpacity: textCardAsset.data.backgroundOpacity,
            frameOn: textCardAsset.data.frameOn,
            frameColor: textCardAsset.data.frameColor,
            frameOpacity: textCardAsset.data.frameOpacity,
        });
    }, [textCardAsset]);

    return (
        <>
            <Html
                key={textCardAsset.id}
                position={convertedTRSMemoized.positionConverted}
                rotation={convertedTRSMemoized.rotationConverted}
                scale={convertedTRSMemoized.scaleConverted}
                transform
                occlude={false}
                zIndexRange={[0, 1]} /* Leva sits at z-index 1000 */
            >
                <div
                    className='fader-3d-card'
                    style={{
                        // TODO actually pass in sensible w/h values here
                        width: `${textCardAsset.data.cardWidth * 20}px`,
                        // height: `${textCardAsset.data.cardHeight * 10}px`,
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
            </Html>
        </>
    );
};

/** Refactored outside of Component for readability of said Component */
function convertTRSMemoWrapper(assetPropertiesRef: React.MutableRefObject<FaderStoryAsset['properties']>, cameraPos: Camera['position']) {
    const currentRef = assetPropertiesRef.current;

    const newTRS = convertTRS({
        position: {
            x: currentRef.positionX,
            y: currentRef.positionY,
            z: currentRef.positionZ,
        },
        rotation: {
            x: currentRef.rotationX,
            y: currentRef.rotationY,
            z: currentRef.rotationZ,
        },
        scale: {
            uniformScale: currentRef.scale,
            x: currentRef.scaleX,
            y: currentRef.scaleY,
            z: currentRef.scaleZ,
        },
        userPosition: { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z },
    });

    return newTRS;
}
