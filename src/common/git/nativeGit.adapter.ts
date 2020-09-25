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
      data.message = `Merge ${data.message}`;
      return data;
    },
    (error) => {
      error.message = 'Merge have conflicts!\n' + error.data.message;
      return Promise.reject(error);
    },
  );
}

export function errorsAreOk(promise: Promise<Response<any>>) {
  return promise.catch((e) => e);
}
