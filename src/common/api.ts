import { IJob } from './iJob';

const axios = require('axios');

export enum StatusCode {
  Error,
  Success,
  Warn,
}

const headers = {
  'PRIVATE-TOKEN': process.env.DEPLOY_ACCESS_TEST,
};

function getPipelines(URI: string, projectId: number) {
  const url = `${URI}/projects/${projectId}/pipelines`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => resp.data);
}

export function getPipelineByRef(URI: string, projectId: number, ref: string) {
  return getPipelines(URI, projectId).then(data => {
    let pipelines = data.filter(t => t.ref === ref || String(t.sha).includes(ref));
    pipelines.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return pipelines[0];
  });
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
  const url = `${URI}/projects/${projectId}/jobs/${jobId}/retry`;
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
    },
  };
  return axios(options).then(resp => {
    return resp.data;
  });

}