/* eslint-disable no-console */
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiListResponse } from '../types/ApiTypes';
import { FaderBackendAsset, FaderSceneType, FaderStoryType, FaderVideoSubtitlesType } from '../types/FaderTypes';
import buildConfig from '../buildConfig';

export const api = axios.create({ baseURL: buildConfig.api.baseUrl });

/** GETs a Project/FaderStory via id */
export const api_ShowProject = async (project_id: string) => {
    return await api
        .get(`/projects/${project_id}`)
        .then((result: AxiosResponse<FaderStoryType>) => {
            return result.data;
        })
        .catch((err: AxiosError) => handleAxiosError(err, 'GET api_ShowProject'));
};

/** GET list of all scenes in an Project/FaderStory */
export const api_ListProjectScenes = async (project_id: string) => {
    return await api
        .get(`/projects/${project_id}/project_scenes`)
        .then((result: AxiosResponse<ApiListResponse<FaderSceneType>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListProjectScenes'));
};

/** GETs all FaderBackendAssets linked to a Project/FaderStory */
export const api_ListBackendAssetsAssociatedWithProject = async (project_id: string) => {
    return await api
        .get(`/projects/${project_id}/assets`)
        .then((result: AxiosResponse<ApiListResponse<FaderBackendAsset>>) => {
            return result.data.objects;
        })
        .catch((err) => {
            handleAxiosError(err, 'GET api_ListBackendAssetsAssociatedWithProject');
        });
};

export const api_ListAssetSubtitles = async (assetId: string) => {
    return await api
        .get(`/assets/${assetId}/asset_subtitles`)
        .then((result: AxiosResponse<ApiListResponse<FaderVideoSubtitlesType>>) => {
            return result.data.objects;
        })
        .catch((err: AxiosError) => err);
};

/** PUTs/updates FaderProject  */
export const api_UpdateProject = async (project_id: string, project: FaderStoryType) => {
    return await api
        .put(`/projects/${project_id}`, project)
        .then((result: AxiosResponse<FaderStoryType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'PUT api_UpdateProject'));
};

/** PUTs new FaderScene to Api  */
export const api_UpdateScene = async (scene: FaderSceneType) => {
    return await api
        .put(`/projects/${scene.project_id}/project_scenes/${scene.id}`, scene)
        .then((result: AxiosResponse<FaderSceneType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'PUT api_UpdateProjectScene'));
};

/**
 * Public api calls (no authentication necessary) :
 */

/** GETs a Public Project/FaderStory via id */
export const api_ShowPublicProject = async (project_id: string) => {
    return await api
        .get(`/public/projects/${project_id}`)
        .then((result: AxiosResponse<FaderStoryType>) => {
            return result.data;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ShowPublicProject'));
};

/** GETs BackendAssets assigned to public Project/FaderStory */
export const api_ListBackendAssetsAssociatedWithPublicProject = async (project_id: string) => {
    return await api
        .get(`/public/projects/${project_id}/assets`)
        .then((result: AxiosResponse<ApiListResponse<FaderBackendAsset>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListBackendAssetsAssociatedWithPublicProject'));
};

export const api_ListPublicAssetSubtitles = async (projectId: string, assetId: string) => {
    return await api
        .get(`/public/projects/${projectId}/assets/${assetId}/asset_subtitles`)
        .then((result: AxiosResponse<ApiListResponse<FaderVideoSubtitlesType>>) => {
            return result.data.objects;
        })
        .catch((err: AxiosError) => err);
};

/** GET list of all scenes in a public Project/FaderStory */
export const api_ListPublicProjectScenes = async (project_id: string) => {
    return await api
        .get(`/public/projects/${project_id}/project_scenes`)
        .then((result: AxiosResponse<ApiListResponse<FaderSceneType>>) => {
            return result.data.objects;
        })
        .catch((err) => handleAxiosError(err, 'GET api_ListPublicProjectScenes'));
};

/**
 * Functions:
 */

export function handleAxiosError(error: unknown, caller?: string) {
    console.error(
        `Axios Error; MSG: ${(error as AxiosError).message}, CODE: ${(error as AxiosError).code}, ${caller && `CALLER: '${caller}')`}`
    );
    return error;
}
