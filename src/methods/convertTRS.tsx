import { Euler, MathUtils, Vector3 } from 'three';

/** TODO: Figure this stuff out:
 * - Fader Position Vertical: up/down Billboard along path of radius around user (0,0,0?)   --> attributes.rotationX; "Phi"
 * - Fader Position Horizontal: left/right/around Billboard along path of radius            --> attributes.rotationY; "Theta" (but why is it a negative number?)
 * - Fader Position Distance: Distance to user, along vector (ray?) to user                 --> attributes.positionZ; "Radius" (but why is it a negative number?)
 * - Fader Rotation Tilt: Local rotation around Y (?) axis                                  --> attributes.rotationZ (but why is it a negative number?)
 */

export const convertTRS = (params: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    userPosition: { x: number; y: number; z: number };
}) => {
    const { position, rotation, scale, userPosition } = params;

    const positionConverted = pointsOnSphere({
        /* pointsOnSphere()'s phi works from Y-Axis downward, values in Fader go upwards from X (or Z?) axis, so we correct by 90deg: */
        phi: 90 - rotation.x,
        /* equally, correct theta: */
        theta: 180 + rotation.y,
        distance: Math.abs(position.z),
        sphereOrigin: [userPosition.x, userPosition.y, userPosition.z],
    });

    const rotationConverted = new Euler().fromArray(convertRotation([rotation.x, rotation.y, rotation.z]));

    const scaleConverted = new Vector3(scale.x, scale.y, scale.z);

    return { positionConverted, rotationConverted, scaleConverted };
};

/** Translates Fader rotational values (always moving around 0,0,0) to THREE rotations. */
const convertRotation = (rotation: [number, number, number]) => {
    const [_ignored_rotX, _ignored_rotY, rotZ] = rotation; /* rotZ = Tilt on local axis */
    const rotZRad = MathUtils.degToRad(rotZ);

    const translatedRotation: typeof rotation = [0, 0, rotZRad]; // rotX and rotY likely changed later, for on-demand billboarding/lookat?

    return translatedRotation;
};

/* https://dustinpfister.github.io/2022/02/04/threejs-vector3-set-from-spherical-coords/ */
const pointsOnSphere = (input: { phi: number; theta: number; distance: number; sphereOrigin: [number, number, number] }) => {
    const { phi, theta, distance, sphereOrigin } = input;

    const origin = new Vector3().fromArray(sphereOrigin);
    const phiRad = MathUtils.degToRad(phi); /* polar angle in radians from the y (up) axis. */
    const thetaRad = MathUtils.degToRad(theta); /* equator angle in radians around the y (up) axis. */

    const position = origin.clone().setFromSphericalCoords(distance, phiRad, thetaRad);

    return position;
};

/** Calculate x and y in circle's circumference
 * @param {number} input.radius - The circle's radius
 * @param {number} input.angle - The angle in degrees
 * @param {number} input.cx - The circle's origin x
 * @param {number} input.cy - The circle's origin y
 */
export const pointsOnCircle = (input: { radius: number; angle: number; cx: number; cy: number }) => {
    /* https://stackoverflow.com/a/60426418 */

    const { radius, angle, cx, cy } = input;

    const angleRad = MathUtils.degToRad(angle); // Convert from Degrees to Radians
    const x = cx + radius * Math.sin(angleRad);
    const y = cy + radius * Math.cos(angleRad);
    return [x, y];
};
