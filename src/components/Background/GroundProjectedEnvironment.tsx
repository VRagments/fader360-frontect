import { useMemo } from 'react';
import { Texture } from 'three';
import { GroundProjectedEnv } from 'three-stdlib';
import { backgroundSphereGeometryArgs } from '../Background';

// TODO It would have been good to restrict groundHeight's min/max extents (#L19-20) to groundRadius's values to prevent the camera from clipping outside of the sphere, but t'was harder than expected to get right

const GroundProjectedEnvironment = ({ texture, height }: { texture: Texture; height: number }) => {
    const backgroundSphereRadius = backgroundSphereGeometryArgs![0] as number;

    const groundProjectedEnvMeshMemoized = useMemo(() => {
        const groundProjectedEnvMesh = new GroundProjectedEnv(texture, {
            height: -height /* negative value makes more sense in UI */,
            radius: backgroundSphereRadius,
            // radius: levaValues.groundRadius as number,
        });

        groundProjectedEnvMesh.material.toneMapped = false; // TODO to be decided

        groundProjectedEnvMesh.name = 'GroundProjectedEnvironment Mesh';
        groundProjectedEnvMesh.material.name = 'GroundProjectedEnvironment Material';
        groundProjectedEnvMesh.geometry.name = 'GroundProjectedEnvironment Geometry';

        return groundProjectedEnvMesh;
    }, [height]);

    return (
        <primitive
            name='GroundProjectedEnvironment Primitive'
            object={groundProjectedEnvMeshMemoized}
            scale={backgroundSphereRadius}
            onUpdate={(_self: typeof groundProjectedEnvMeshMemoized) => {
                //
            }}
        />
    );
};

export default GroundProjectedEnvironment;
