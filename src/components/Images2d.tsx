/* eslint-disable */
// @ts-nocheck

import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { convertTRS } from '../methods/convertTRS';
import { StoryAsset } from '../types/FaderTypes';

type Images2dProps = {
    image2dAssets: StoryAsset[] | undefined;
};
const Images2d = (props: Images2dProps) => {
    const { image2dAssets } = props;
    const camera = useThree().camera;

    const memoizedReturn = useMemo(() => {
        /* Memoizing image2DAssets since they'd keep refreshing for some reason. The dependency array might need more precision */

        return (
            image2dAssets &&
            image2dAssets.map((image2dAsset, idx) => {
                const image2dBackendAsset = translateId(image2dAsset.backendId);

                const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ } =
                    image2dAsset.properties;

                const convertedTRS = convertTRS({
                    position: { x: positionX, y: positionY, z: positionZ },
                    rotation: { x: rotationX, y: rotationY, z: rotationZ },
                    scale: { x: scaleX, y: scaleY, z: scaleZ },
                    userPosition: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
                });

                return (
                    <Html
                        key={idx}
                        name={`image2dAsset HTML Component ${idx}`}
                        transform
                        occlude
                        position={convertedTRS.positionConverted}
                        rotation={convertedTRS.rotationConverted}
                        scale={convertedTRS.scaleConverted}
                        onUpdate={(self) => {
                            self.lookAt(camera.position);
                        }}
                    >
                        <div className='fader-3d-card hover:border-4'>
                            {image2dAsset.display.caption && (
                                <div className='rounded-md bg-slate-200 p-1 px-2'>{image2dAsset.display.caption}</div>
                            )}
                            <img
                                src={image2dBackendAsset.static_url}
                                width={image2dBackendAsset.attributes.width}
                                height={image2dBackendAsset.attributes.height}
                            />
                            {image2dAsset.display.showInteractive && (
                                <div className='rounded-md bg-slate-200 p-1 px-2'>I R INTERACTIVE</div>
                            )}
                        </div>
                    </Html>
                );
            })
        );
    }, [image2dAssets]);

    if (!image2dAssets) {
        return <></>;
    }

    return <>{memoizedReturn}</>;
};

export default Images2d;
