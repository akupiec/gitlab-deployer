import { exec, execSync } from 'child_process';

export namespace nativeGit {
  export function push(path: string) {
    return promisedExec(`git push`, path);
  }

  export function pull(path: string) {
    return promisedExec(`git pull --ff-only`, path);
  }

  export function currentBranchName(path: string) {
    return promisedExec(`git branch --show-current`, path);
  }

  export function rebase(path: string, ref: string) {
    return new Promise((resolve, reject) =>
      exec(`git rebase ${ref}`, { cwd: path }, (error, stdout) => {
        if (error) {
          const newError: any = { ...error };
          exec(`git rebase --abort`, { cwd: path }, (err) => {
            if (err) {
              newError.message = 'Merge unknown Err!';
              reject(newError);
              return;
            }
            const currentBranch = String(
              execSync(`git branch --show-current`, { cwd: path }),
            ).trim();
            newError.message = `Merge have conflicts!\n called on: ${currentBranch} by git merge ${ref}`;
            reject(newError);
          });
        } else {
          resolve(stdout);
        }
      }),
    );
  }

  export function merge(path: string, ref: string, ffOnly: boolean) {
    let cmd = `git merge ${ref} `;
    cmd += ffOnly ? '--ff-only' : '';
    return new Promise((resolve, reject) =>
      exec(cmd, { cwd: path }, (error, stdout) => {
        if (error) {
          const message = error.message;
          const newError: any = { ...error, message };
          exec(`git merge --abort`, { cwd: path }, (err) => {
            const currentBranch = String(
              execSync(`git branch --show-current`, { cwd: path }),
            ).trim();
            const message = `Merge issues! called on: ${currentBranch}\n`;
            if (err) {
              newError.message = message + newError.message + err.message;
              newError.message.trim();
              reject(newError);
              return;
            }
            newError.message = message;
            newError.message.trim();
            reject(newError);
          });
        } else {
          resolve(stdout);
        }
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
