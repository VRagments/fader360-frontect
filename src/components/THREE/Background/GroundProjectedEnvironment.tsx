import { useMemo } from 'react';
import { Texture } from 'three';
import { GroundProjectedEnv } from 'three-stdlib';
import { backgroundSphereGeometryArgs } from '../../../lib/defaults';

// TODO It would have been good to restrict groundHeight's min/max extents (#L19-20) to groundRadius's values to prevent the camera from clipping outside of the sphere, but t'was harder than expected to get right
const GroundProjectedEnvironment = ({ texture, height, radius }: { texture: Texture; height: number; radius: number }) => {
    const backgroundSphereRadius = backgroundSphereGeometryArgs[0];

    const groundProjectedEnvMeshMemoized = useMemo(() => {
        const groundProjectedEnvMesh = new GroundProjectedEnv(texture, {
            height: -height /* negative value makes more sense in UI */,
            radius,
        });

        groundProjectedEnvMesh.name = 'GroundProjectedEnvironment Mesh';

        groundProjectedEnvMesh.geometry.name = 'GroundProjectedEnvironment Geometry';

        groundProjectedEnvMesh.material.toneMapped = false; // TODO to be decided
        groundProjectedEnvMesh.material.name = 'GroundProjectedEnvironment Material';

        return groundProjectedEnvMesh;
    }, [height, radius, texture]);

    return (
        <mesh
            geometry={groundProjectedEnvMeshMemoized.geometry}
            material={groundProjectedEnvMeshMemoized.material}
            scale={[backgroundSphereRadius, backgroundSphereRadius, backgroundSphereRadius]}
        />
    );
};

export default GroundProjectedEnvironment;
