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

export function parseFetch(promise: Promise<any>) {
  return promise.then((resp) => {
    resp.message += 'Fetch success!';
    return resp;
  });
}

export function parsePush(promise: Promise<any>) {
  return promise.then((resp) => {
    resp.message += 'Push success!';
    return resp;
  });
}

export function parseMerge(promise: Promise<Response<any>>) {
  return promise.then(
    (data) => {
      const msg = data.message.split('\n').slice(0, 2).join(' ');
      data.message = `Merge ${msg}`;
      return data;
    },
    (error) => {
      if (error.haveConflict) {
        error.message = `Have conflicts! Resolve manually:
git checkout ${error.data.currentBranch}; git merge ${error.data.ref}`;
      } else {
        error.message = `unknown merge error, ${error.message}`;
      }
      return Promise.reject(error);
    },
  );
}

export function errorsAreOk(promise: Promise<Response<any>>) {
  return promise.catch((e) => e);
}
