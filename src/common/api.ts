import { Job } from './job';

const axios = require('axios');

export enum StatusCode {
  Error,
  Success,
  Warn,
}

const URI = 'https://git.signintra.com/api/v4';
const headers = {
  'PRIVATE-TOKEN': process.env.DEPLOY_ACCESS_TEST,
};

function getPipelines(projectId: number) {
  const url = `${URI}/projects/${projectId}/pipelines`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => resp.data);
}

export function getPipelineByRef(projectId: number, ref: string) {
  return getPipelines(projectId).then(data => {
    let pipelines = data.filter(t => t.ref === ref || String(t.sha).includes(ref));
    pipelines.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return pipelines[0];
  });
}

export function createTagOnRef(projectId: number, tagName: string, ref: string) {
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

export function createPipeline(projectId: number, ref: string) {
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

export function findJob(projectId: number, pipelineId: string, jobName: string) {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then(resp => {
    if (!resp.data) return;
    const job = resp.data.find((job: Job) => job.name.includes(jobName));
    return job;
  });
}

export function playJob(projectId: number, jobId: string) {
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
