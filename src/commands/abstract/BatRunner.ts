import { PipelineRunner } from './PipelineRunner';
import { errorsAreOk, parseGit, parseMerge } from '../../common/git/nativeGit.adapter';
import { Project } from '../../common/Config';
import { nativeGit as git } from '../../common/git/nativeGit';
import { Response, StatusCode } from '../../common/api/api.adapter';
import { compose } from 'ramda';

export abstract class BatRunner extends PipelineRunner {
  private gitBasic = (project, fn) =>
    compose(this.responsePrinter.bind(this), errorsAreOk, parseGit(project), fn);

  protected async cloneIfNeeded(project: Project) {
    const path = this.config.tempPath + '/' + project.name;
    const haveRepos = await git.haveRepo(path, project.repo);
    if (haveRepos) {
      return { status: StatusCode.Success, project };
    }

    this.screenPrinter.setProjectSpinner(project, 'cloning repo...');
    const exec = this.gitBasic(project, git.clone);
    return await exec(this.config.tempPath, project.repo, project.name);
  }

  protected async fetch(resp: Response<any>) {
    this.screenPrinter.setProjectSpinner(resp.project, 'fetching changes...');
    const exec = this.gitBasic(resp.project, git.fetch);
    const path = this.config.tempPath + '/' + resp.project.name;
    return await exec(path);
  }

  protected async stashChanges(resp: any) {
    this.screenPrinter.setProjectSpinner(resp.project, 'stashing changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.stash);
    return await exec(path);
  }

  protected async checkout(resp: Response<any>, ref: string) {
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.checkout);
    return await exec(path, ref);
  }

  protected async pull(resp: Response<any>) {
    this.screenPrinter.setProjectSpinner(resp.project, 'pulling changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.pull);
    return await exec(path);
  }

  protected async push(resp: Response<any>) {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    this.screenPrinter.setProjectSpinner(resp.project, 'pushing changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.push);
    return await exec(path);
  }

  protected async merge(resp: Response<any>, ref: string, ffOnly = false) {
    this.screenPrinter.setProjectSpinner(resp.project, 'merging changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseMerge,
      parseGit(resp.project),
      git.merge,
    );
    return await exec(path, ref, ffOnly);
  }
}
