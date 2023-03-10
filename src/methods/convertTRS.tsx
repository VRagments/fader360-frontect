import { Euler, MathUtils, Matrix4, Vector3 } from 'three';

/* Notes on "conversion" from Fader backend data (type FaderStoryAsset) to THREE scene pos/rot/scale :
 * - Fader "Position Vertical":     Up/down along radius around user    --> properties.rotationX; "Phi" in #L29
 * - Fader "Position Horizontal":   Left/right around user              --> properties.rotationY; "Theta" in #L32 (but why is it a negative number?)
 * - Fader "Position Distance":     Distance to user                    --> properties.positionZ; "Radius" (negative number at times, because there's a fixed default distance and number is relative to this from what I gather)
 * - Fader "Rotation Tilt":         Local rotation around Y (?) axis    --> properties.rotationZ (but why is it a negative number?)
 * - ???
 */

type ConvertTRSParams = {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { uniformScale: number; x: number; y: number; z: number };
    userPosition: { x: number; y: number; z: number };
};
/** Method to "convert" `FaderStoryAsset` attributes in a scene to a THREE scene `Object3D` pos/rot/scale
 * @param position A FaderStoryAsset's properties.positionX/Y/Z
 * @param rotation A FaderStoryAsset's properties.rotationX/Y/Z
 * @param scale FaderStoryAsset's properties.scaleX/Y/Z
 * @param userPosition Basically, position of default camera
 */
export const convertTRS = (params: ConvertTRSParams) => {
    const { position, rotation, scale, userPosition } = params;

    const positionConverted = pointsOnSphere({
        /* pointsOnSphere()'s phi works from Y-Axis downward, values in Fader go upwards from X (or Z?) axis, so we correct by 90deg: */
        phi: 90 - rotation.x,
        /* correct theta: */
        theta: 90 + rotation.y * -1,
        /* TODO Turns all values to positive values for now, should be enhanced somewhere down the line: */
        distance: Math.abs(position.z),
        /* Where we center our imaginary sphere, usually default camera position I would think: */
        sphereOrigin: new Vector3().fromArray([userPosition.x, userPosition.y, userPosition.z]),
    });

    const rotationConverted = convertRotation(
        [rotation.x, rotation.y, rotation.z],
        positionConverted,
        new Vector3(userPosition.x, userPosition.y, userPosition.z)
    );

    /* Not doing anything special here yet */
    let scaleConverted: Vector3;
    if (scale.uniformScale) {
        scaleConverted = new Vector3().setScalar(scale.uniformScale);
    } else {
        scaleConverted = new Vector3(scale.x, scale.y, scale.z);
    }

    return { positionConverted, rotationConverted, scaleConverted };
};

/**
 * Method to calculate an imaginary sphere around the user, to be able to draw Assets in circles around user. "Billboarding" is taken care of in `convertRotation`.
 * Uses `setFromSphericalCoords`. See also https://dustinpfister.github.io/2022/02/04/threejs-vector3-set-from-spherical-coords/
 */
const pointsOnSphere = (params: { phi: number; theta: number; distance: number; sphereOrigin: Vector3 }) => {
    const { phi, theta, distance, sphereOrigin } = params;

    const phiRad = MathUtils.degToRad(phi); /* polar angle in radians from the y (up) axis. */
    const thetaRad = MathUtils.degToRad(theta); /* equator angle in radians around the y (up) axis. */

    const position = sphereOrigin.clone().setFromSphericalCoords(distance, phiRad, thetaRad);

    return position;
};

/** Translates Fader rotational values (always moving around userPosition, facing user) to THREE rotations. */
const convertRotation = (assetRotation: [number, number, number], assetPosition: Vector3, userPosition: Vector3) => {
    const [_ignored_rotX, _ignored_rotY, rotZ] = assetRotation; /* rotZ = Tilt on local axis, haven't seen X or Y in use yet */

    /*  Multiply the `lookAt` rotation matrix (for "Billboarding") with the rotation matrix for object's local Z rotation ("Tilt") to get final matrix:
     *  See: https://www.gamedev.net/forums/topic/540243-combine-euler-angle-rotation/4485915/
     *  This forces us to instance two Matrices every time, but I think it's a necessary step unfortunately */
    const rotLookAtMatrix = new Matrix4();
    rotLookAtMatrix.lookAt(userPosition, assetPosition, new Vector3(0, 1, 0) /* "Up" Vector of scene */);

    const rotTiltMatrix = new Matrix4().makeRotationZ(MathUtils.degToRad(rotZ));
    const finalRotMatrix = rotLookAtMatrix.multiply(rotTiltMatrix);

    return new Euler().setFromRotationMatrix(finalRotMatrix);
};
