import { Response, StatusCode } from '../api/api.adapter';

export const parseGit = (project) => (promise: Promise<any>) => {
  return promise.then(
    (data) => {
      return { status: StatusCode.Success, message: data, project };
    },
    (error) => {
      let message = `CMD: ${error.cmd}\n${error.message}`;
      return Promise.reject({ status: StatusCode.Error, message, project, data: error });
    },
  );
};

export function parseMerge(promise: Promise<Response<any>>) {
  return promise.then(
    (data) => {
      const msg = data.message.split('\n').slice(0, 2).join(' ');
      data.message = `Merge ${msg}`;
      return data;
    },
    (error) => {
      error.message = `Have conflicts! Resolve manually:
      git checkout ${error.data.currentBranch}; git merge ${error.data.ref}`;
      return Promise.reject(error);
    },
  );
}

export function errorsAreOk(promise: Promise<Response<any>>) {
  return promise.catch((e) => e);
}
