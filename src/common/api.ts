import { IJob } from './iJob';
import { IPipeline } from './iPipeline';

const axios = require('axios');

export enum StatusCode {
  Error,
  Success,
  Warn,
}

export interface Response<T> {
  status: StatusCode;
  message?: string;
  data?: T;
}

const headers = {
  'PRIVATE-TOKEN': process.env.GIT_ACCESS_TOKEN,
};

export function getPipelines(
  URI: string,
  projectId: number,
  pageSize = 20,
  page: number = 0,
): Promise<IPipeline[]> {
  const url = `${URI}/projects/${projectId}/pipelines?page=${page}&per_page=${pageSize}`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => resp.data);
}

export function getPipelineJobs(URI: string, projectId: number, pipelineId: string) {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => resp.data);
}

export function createTagOnRef(URI: string, projectId: number, tagName: string, ref: string) {
  const url = `${URI}/projects/${projectId}/repository/tags`;
  const options = {
    url,
    method: 'post',
    headers,
    params: {
      id: projectId,
      tag_name: tagName,
      ref: ref,
    },
  };
  return axios(options).then(resp => resp.data);
}

export function createPipeline(URI: string, projectId: number, ref: string) {
  const url = `${URI}/projects/${projectId}/pipeline`;
  const options = {
    url,
    method: 'post',
    headers,
    params: {
      id: projectId,
      ref: ref,
    },
  };
  return axios(options).then(resp => resp.data);
}

export function findJob(URI: string, projectId: number, pipelineId: string, jobName: string) {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => {
    if (!resp.data) return;
    return resp.data.find((job: IJob) => job.name.includes(jobName));
  });
}

export function playJob(URI: string, projectId: number, jobId: string) {
  const url = `${URI}/projects/${projectId}/jobs/${jobId}/play`;
  const options = {
    url,
    method: 'post',
    headers,
  };
  return axios(options).then(resp => {
    return resp.data;
  });
}

export function findProject(URI: string, search: string) {
  const url = `${URI}/projects`;

  const options = {
    url,
    method: 'get',
    headers,
    params: {
      search: search,
      membership: true,
    },
  };
  return axios(options).then(resp => {
    return resp.data;
  });
}
