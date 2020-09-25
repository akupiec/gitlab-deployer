import { IBranch } from './model/iBranch';
import { Project } from '../Config';
import { PIPELINES_CHECK_SIZE } from '../../costansts';
import { bold } from 'chalk';
import { IPipelineStatus } from './model/iPipeline';
import { IJob } from './model/iJob';
import { ICompare } from './model/iCompare';
import { IMerge } from './model/iMerge';

export enum StatusCode {
  Error,
  Success,
  Warn,
}

export interface Response<T> {
  status: StatusCode;
  project?: Project; //TODO required!
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
      resp.status = StatusCode.Warn;
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
  return promise.then((data) => {
    if (!data) {
      data.message = 'IJob Not Found';
      data.status = StatusCode.Warn;
      return data;
    }
    data.message = 'IJob found, processing...';
    return data;
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

export function diffParser(promise: Promise<Response<ICompare>>) {
  return promise.then((resp) => {
    resp.message = 'Check compare completed';
    if (resp.data.compare_same_ref) {
      resp.message = 'same ref';
      resp.status = StatusCode.Warn;
      return resp;
    }
    if (resp.data.compare_timeout) {
      resp.message = 'compare timeout';
      resp.status = StatusCode.Error;
      return resp;
    }
    if (resp.data.commit === null) {
      resp.message = 'Nothing changed';
      resp.status = StatusCode.Warn;
      return resp;
    }

    return resp;
  });
}

export function parseMerge(promise: Promise<Response<IMerge>>) {
  return promise.then((resp) => {
    if (resp.data.has_conflicts !== false) {
      resp.message = `New MR created with conflicts!\n${resp.data.web_url}`;
      resp.status = StatusCode.Warn;
      return resp;
    }
    if (!resp.data.changes_count) {
      resp.message = `Empty MR created & closing....!`;
      resp.status = StatusCode.Warn;
      return resp;
    }
    resp.message = `MR created!`;
    return resp;
  });
}

export function parseFindSingleMR(promise: Promise<Response<IMerge[]>>) {
  return promise.then((resp) => {
    if (resp.data.length > 1) {
      resp.message = `More then one opened MR found!`;
      resp.status = StatusCode.Warn;
      return resp;
    }
    resp.message = `MR created!`;
    resp.data = resp.data[0] as any;
    return resp;
  });
}

export function parseAcceptMR(promise: Promise<Response<any>>) {
  return promise.then((resp) => {
    if (resp.data.state === 'merged') {
      resp.message = `MR merged!`;
      return resp;
    }
    resp.message = `MR accepted & awaiting to be merged!`;
    return resp;
  });
}
