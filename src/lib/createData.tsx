/* eslint-disable no-console */
import { defaultProjectData, defaultSceneData } from './defaults';

const createProjectData = () => {
    console.log('%c[createData]', 'color: #601526', `project.data empty, filling with default values.. `);
    return { ...defaultProjectData };
};

const createSceneData = () => {
    console.log('%c[createData]', 'color: #601526', `scene.data empty, filling with default values.. `);
    return { ...defaultSceneData };
};

export { createProjectData, createSceneData };
