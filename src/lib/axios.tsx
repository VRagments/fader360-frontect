/* eslint-disable no-console */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiAuthResponse, ApiListResponse } from '../types/ApiTypes';
import { FaderBackendAsset, FaderStory } from '../types/FaderTypes';
import useZustand from './zustand/zustand';
import { mangleAssetsFromApiWithLocalData } from './fader_testStory_api_response';
import { ZustandState } from '../types/ZustandStore';

const api = axios.create();
const apiBaseUrl = `http://localhost:45020/api`; // Only works with http, not https?

export const apiAuthTokenToStore = async (userLoginData: { username: string; password: string }) => {
    const storeSetApiAuthToken = useZustand.getState().methods.storeSetApiAuthToken;
    const { username, password } = userLoginData;

    await api
        .get(`${apiBaseUrl}/auth/login?username=${username}&password=${password}`)
        .then((result: AxiosResponse<ApiAuthResponse>) => {
            /* Send to zustand Store --- not sure we ever need the token in Store (as we're setting it as default header below), keeping this in for now though */
            storeSetApiAuthToken(result.data.access_token);

            /* Set header for future Api calls: */
            api.defaults.headers.common.Authorization = `Bearer ${result.data.access_token}`;
        })
        .catch((err) => handleAxiosError(err, 'GET apiAuthTokenToStore'));
};

/** We actually shouldn't ever need this, right? Initial entrypoint for FaderStory or even App is always a specific project */
export const apiListAllProjects = async () => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    await api
        .get(`${apiBaseUrl}/projects?all=true`)
        .then((result: AxiosResponse<ApiListResponse<FaderStory>>) => {
            apiProjectToStore(result.data.objects[0].id).catch((err) => handleAxiosError(err, 'apiProjectToStore'));
        })
        .catch((err) => handleAxiosError(err, 'GET apiListAllProjects'));
};

/** GETs Project via id and sets to Store (to state.project) */
export const apiProjectToStore = async (project_id: string) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    const { storeSetProject, storeSetProjectAssets } = useZustand.getState().methods;

    await api
        .get(`${apiBaseUrl}/projects/${project_id}`)
        .then((result: AxiosResponse<FaderStory>) => {
            // WARN Mangling together mock local data with Api response until we receive more substantial data from Backend
            const faderStory = result.data;
            apiListAssetsAssociatedWithProject(project_id)
                .then((result) => {
                    if (result) {
                        const combinedProject = mangleAssetsFromApiWithLocalData(faderStory, result);
                        storeSetProject(combinedProject);

                        /** Converting from Array to Record<string, FaderBackendAsset> */
                        const assets: ZustandState['faderStoryData']['backendAssets'] = {};
                        result.forEach((res) => {
                            assets[res.id] = res;
                        });
                        storeSetProjectAssets(assets);
                    }
                })
                .catch((err) => handleAxiosError(err, 'apiListAssetsAssociatedWithProject'));
        })
        .catch((err) => handleAxiosError(err, 'GET apiProjectToStore'));
};

export const apiListAssetsAssociatedWithProject = async (project_id: string) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .get(`${apiBaseUrl}/projects/${project_id}/assets`)
        .then((result: AxiosResponse<ApiListResponse<FaderBackendAsset>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET apiListAssetsAssociatedWithProject'));
};

export function handleAxiosError(error: unknown, caller?: string) {
    throw new Error(`${(error as AxiosError).message}, ${(error as AxiosError).code}, ${caller && `caller information: '${caller}')`}`);
}
