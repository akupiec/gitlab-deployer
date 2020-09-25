import { exec, execSync } from 'child_process';

export namespace nativeGit {
  export function push(path: string) {
    return promisedExec(`git push`, path);
  }

  export function pull(path: string) {
    return promisedExec(`git pull`, path);
  }

  export function merge(path: string, ref: string) {
    return new Promise((resolve, reject) =>
      exec(`git merge ${ref}`, { cwd: path }, (error, stdout) => {
        if (error) {
          execSync(`git merge --abort`, { cwd: path });
          const branch = execSync(`git branch --show-current`, { cwd: path });
          error.message += `Current Branch: ${branch}`;
          reject(error);
          return;
        }
        resolve(stdout);
      }),
    );
  }

  export function checkout(path: string, ref: string) {
    return promisedExec(`git checkout ${ref}`, path);
  }

  export function fetch(path: string) {
    return promisedExec('git fetch', path);
  }

  export function stash(path: string) {
    return promisedExec('git stash', path);
  }

  export function clone(path: string, repo: string, dir: string) {
    return promisedExec(`git clone -q ${repo} ${dir}`, path);
  }

  export function haveRepo(path: string, repo: string): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`git remote get-url origin | grep -q ${repo}`, { cwd: path }, (error) => {
        if (error) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  function promisedExec(cmd, path) {
    return new Promise((resolve, reject) =>
      exec(cmd, { cwd: path }, (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }),
    );
  }
}
