/* eslint-disable no-console */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiAuthResponse, ApiListResponse } from '../types/ApiTypes';
import { FaderBackendAsset, FaderSceneType, FaderStoryType } from '../types/FaderTypes';

const api = axios.create();
const apiBaseUrl = `http://localhost:45020/api`; // BUG Only works with http, not https?

/** GETs Authentication token for the given authentication credentials & sets as header for future requests */
export const api_RequestAuthToken = async (userLoginData: { username: string; password: string }) => {
    const { username, password } = userLoginData;

    return await api
        .get(`${apiBaseUrl}/auth/login?username=${username}&password=${password}`)
        .then((result: AxiosResponse<ApiAuthResponse>) => {
            /* Set header for future Api calls: */
            api.defaults.headers.common.Authorization = `Bearer ${result.data.access_token}`;

            return result.data.access_token;
        })
        .catch((err) => handleAxiosError(err, 'GET apiRequestAuthToken'));
};

/** GETs all Projects/FaderStories */
export const api_ListProjects = async () => {
    /* TODO we actually shouldn't ever need this, right? Initial entrypoint for FaderStory or even App is always a specific project */

    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .get(`${apiBaseUrl}/projects?all=true`)
        .then((result: AxiosResponse<ApiListResponse<FaderStoryType>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListProjects'));
};

/** GETs a Project/FaderStory via id */
export const api_ShowProject = async (project_id: string) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .get(`${apiBaseUrl}/projects/${project_id}`)
        .then((result: AxiosResponse<FaderStoryType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ShowProject'));
};

/** GET list of all scenes in an Project/FaderStory */
export const api_ListProjectScenes = async (project_id: string) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .get(`${apiBaseUrl}/projects/${project_id}/project_scenes`)
        .then((result: AxiosResponse<ApiListResponse<FaderSceneType>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListProjectScenes'));
};

/** GETs all FaderBackendAssets linked to a Project/FaderStory */
export const api_ListBackendAssetsAssociatedWithProject = async (project_id: string) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .get(`${apiBaseUrl}/projects/${project_id}/assets`)
        .then((result: AxiosResponse<ApiListResponse<FaderBackendAsset>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListBackendAssetsAssociatedWithProject'));
};

/** PUTs/updates FaderProject  */
export const api_UpdateProject = async (project_id: string, project: FaderStoryType) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .put(`${apiBaseUrl}/projects/${project_id}`, project)
        .then((result: AxiosResponse<FaderStoryType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'PUT api_UpdateProject'));
};

/** PUTs new FaderScene to Api  */
export const api_UpdateScene = async (scene: FaderSceneType) => {
    if (!api.defaults.headers.common.Authorization) {
        throw new Error('No Api Authentication Token is currently set!');
    }

    return await api
        .put(`${apiBaseUrl}/projects/${scene.project_id}/project_scenes/${scene.id}`, scene)
        .then((result: AxiosResponse<FaderSceneType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'PUT api_UpdateProjectScene'));
};

/**
 * Functions:
 */

export function handleAxiosError(error: unknown, caller?: string) {
    return new Error(`MSG: ${(error as AxiosError).message}, CODE: ${(error as AxiosError).code}, ${caller && `CALLER: '${caller}')`}`);
}
