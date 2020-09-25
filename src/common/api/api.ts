import { IJob } from './model/iJob';
import { IPipeline } from './model/iPipeline';
import { IBranch } from './model/iBranch';
import { IMerge } from './model/iMerge';
import { GITLAB_DEPLOYER_MR_LABEL } from '../../costansts';

const axios = require('axios');

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
  return axios(options).then((resp) => resp.data);
}

export function getPipeline(
  URI: string,
  projectId: number,
  pipelineId: string,
): Promise<IPipeline> {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then((resp) => resp.data);
}

export function getPipelineJobs(URI: string, projectId: number, pipelineId: string) {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then((resp) => resp.data);
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
  return axios(options).then((resp) => resp.data);
}

export function createPipeline(URI: string, projectId: number, ref: string): Promise<IPipeline> {
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
  return axios(options).then((resp) => resp.data);
}

export function findJob(URI: string, projectId: number, pipelineId: string, jobName: string) {
  const url = `${URI}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
  const options = {
    url,
    method: 'get',
    headers,
  };
  return axios(options).then((resp) => {
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
  return axios(options).then((resp) => {
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
      archived: false,
    },
  };
  return axios(options).then((resp) => resp.data);
}

export function createNewBranch(
  URI: string,
  projectId: number,
  ref: string,
  branchName: string,
): Promise<IBranch> {
  const url = `${URI}/projects/${projectId}/repository/branches`;
  const options = {
    url,
    method: 'post',
    headers,
    params: {
      branch: branchName,
      ref: ref,
    },
  };
  return axios(options).then((resp) => resp.data);
}

export function createNewMergeRequest(
  URI: string,
  projectId: number,
  sourceRef: string,
  targetRef: string,
  title: string,
): Promise<IMerge> {
  const url = `${URI}/projects/${projectId}/merge_requests`;
  const options = {
    url,
    method: 'post',
    headers,
    params: {
      source_branch: sourceRef,
      target_branch: targetRef,
      title: title,
      labels: [GITLAB_DEPLOYER_MR_LABEL],
    },
  };
  return axios(options).then((resp) => resp.data);
}

export function deleteMergeRequest(URI: string, projectId: number, iid: string): Promise<any> {
  const url = `${URI}/projects/${projectId}/merge_requests/${iid}`;
  const options = {
    url,
    method: 'delete',
    headers,
  };
  return axios(options).then((resp) => resp.data);
}

export function autoMergeMR(URI: string, projectId: number, iid: string): Promise<any> {
  const url = `${URI}/projects/${projectId}/merge_requests/${iid}/merge`;
  const options = {
    url,
    method: 'put',
    headers,
    params: {
      merge_when_pipeline_succeeds: true,
    },
  };
  return axios(options).then((resp) => resp.data);
}

export function checkDiff(URI: string, projectId: number, sourceRef: string, targetRef: string) {
  const url = `${URI}/projects/${projectId}/repository/compare`;
  const options = {
    url,
    method: 'get',
    headers,
    params: {
      from: targetRef,
      to: sourceRef,
    },
  };
  return axios(options).then((resp) => resp.data);
}

export function findMergeRequests(
  URI: string,
  projectId: number,
  title: string,
  onlyAutoCrated = true,
) {
  const url = `${URI}/projects/${projectId}/merge_requests`;
  const options = {
    url,
    method: 'get',
    headers,
    params: {
      state: 'opened',
      search: title,
      labels: onlyAutoCrated ? [GITLAB_DEPLOYER_MR_LABEL] : undefined,
    },
  };
  return axios(options).then((resp) => resp.data);
}
