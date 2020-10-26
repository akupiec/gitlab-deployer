import { IBranch } from './model/iBranch';
import { Project } from '../Config';
import { PIPELINES_CHECK_SIZE } from '../../costansts';
import { bold } from 'chalk';
import { IPipelineStatus } from './model/iPipeline';
import { IJob } from './model/iJob';

export enum StatusCode {
  Error,
  Success,
  Warn,
}

export interface Response<T> {
  status: StatusCode;
  project: Project;
  message?: string;
  data?: T;
}

export function parseNative<T = any>(project: Project) {
  return (promise: Promise<any>) => {
    return promise.then(
      (data) => ({ status: StatusCode.Success, data, project }),
      (error) => {
        let { response, message } = error;
        if (response) {
          message = `${response.status}: ${response.statusText}`;
          if (response.data) {
            message += `:\n${response.data.message || response.data.error}`;
          }
        }
        return Promise.reject({ status: StatusCode.Error, message: message, project });
      },
    );
  };
}

export function errorsAreOk(promise: Promise<Response<any>>) {
  return promise.catch((e) => e);
}

export function branchParser(promise: Promise<Response<IBranch>>): Promise<Response<IBranch>> {
  return promise.then((data) => {
    data.message = 'New Branch crated';
    return data;
  });
}

export function parsePipelineFind(promise: Promise<Response<any>>) {
  return promise.then((resp) => {
    if (!resp.data) {
      resp.message = `Not Found in last ${PIPELINES_CHECK_SIZE} triggered pipelines`;
      resp.status = StatusCode.Error;
      return resp;
    }

    let msg = `Pipeline status: ${bold(resp.data.status)}`;
    if (resp.data.status === IPipelineStatus.FAILED) {
      msg += `\nLink: ${resp.data.web_url}`;
      resp.status = StatusCode.Error;
    } else if (resp.data.status !== IPipelineStatus.SUCCESS) {
      msg += `\nLink: ${resp.data.web_url}`;
      resp.status = StatusCode.Warn;
    }
    resp.message = msg;
    return resp;
  });
}

export function parsePipeline(promise: Promise<Response<any>>) {
  return promise.then((resp) => {
    resp.message = 'Pipeline created';
    return resp;
  });
}

export function parseJob(promise: Promise<Response<IJob>>) {
  return promise.then((resp) => {
    if (!resp || !resp.data) {
      resp.message = 'IJob Not Found';
      resp.status = StatusCode.Warn;
      return resp;
    }
    resp.message = 'IJob found, processing...';
    return resp;
  });
}

export function parseJobTrigger(promise: Promise<Response<IJob>>) {
  return promise.then((data) => {
    data.message = 'IJob started';
    return data;
  });
}

export function parseTagOnRef(promise: Promise<Response<any>>) {
  return promise.then((resp) => {
    resp.message = 'New Tag crated';
    return resp;
  });
}
