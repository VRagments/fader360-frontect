import { useControls } from 'leva';
import { Schema } from 'leva/dist/declarations/src/types';
import { useRef, useMemo } from 'react';
import { Texture } from 'three';
import { GroundProjectedEnv } from 'three-stdlib';
import { backgroundSphereGeometryArgs } from '../WhichEnvironment';

// TODO It would have been good to restrict groundHeight's min/max extents (#L19-20) to groundRadius's values to prevent the camera from clipping outside of the sphere, but t'was harder than expected to get right

const GroundProjectedEnvironment = ({ texture, height }: { texture: Texture; height: number }) => {
    const groundHeightRef = useRef(height);
    const groundRadiusRef = useRef(backgroundSphereGeometryArgs[0]);

    /* Add in further GUI options to existing panel: */
    const levaSchema: Schema = {
        groundHeight: {
            label: 'Ground Height',
            value: groundHeightRef.current,
            min: -backgroundSphereGeometryArgs[0],
            max: backgroundSphereGeometryArgs[0],
            step: 1,
            onChange: (val: number, _path, _context) => {
                groundHeightRef.current = val;
            },
            transient: false,
        },
        groundRadius: {
            label: 'Ground Radius',
            value: groundRadiusRef.current,
            min: 0.01,
            max: backgroundSphereGeometryArgs[0],
            step: 1,
            onChange: (val: number, _path, _context) => {
                groundRadiusRef.current = val;
            },
            transient: false,
        },
    };

    const [levaValues, _ignored_setLevaValues] = useControls(() => levaSchema);

    const groundProjectedEnvMeshMemoized = useMemo(() => {
        const groundProjectedEnvMesh = new GroundProjectedEnv(texture, {
            height: -levaValues.groundHeight /* negative value makes more sense in UI */,
            radius: levaValues.groundRadius as number,
        });

        groundProjectedEnvMesh.material.toneMapped = false;

        groundProjectedEnvMesh.name = 'GroundProjectedEnvironment Mesh';
        groundProjectedEnvMesh.material.name = 'GroundProjectedEnvironment Material';
        groundProjectedEnvMesh.geometry.name = 'GroundProjectedEnvironment Geometry';

        return groundProjectedEnvMesh;
    }, [levaValues]);

    return (
        <primitive
            name='GroundProjectedEnvironment Primitive'
            object={groundProjectedEnvMeshMemoized}
            scale={backgroundSphereGeometryArgs[0]}
            onUpdate={(_self: typeof groundProjectedEnvMeshMemoized) => {
                //
            }}
        />
    );
};

export default GroundProjectedEnvironment;
