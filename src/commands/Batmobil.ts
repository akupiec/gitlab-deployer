import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { compose } from 'ramda';
import { PipelineRunner } from './abstract/PipelineRunner';
import { nativeGit as git } from '../common/git/nativeGit';
import { errorsAreOk, parseGit, parseMerge } from '../common/git/nativeGit.adapter';
import { Response, StatusCode } from '../common/api/api.adapter';

export class Batmobil extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.cloneIfNeeded(project);
    resp = await this.stashChanges(resp);
    resp = await this.fetch(resp);

    let stages = this.config.stages.reverse();
    resp = await this.checkout(resp, stages[0]);
    resp = await this.pull(resp);

    for (let i = 0; i < stages.length - 1; i++) {
      resp = await this.runPerStage(resp, stages[i], stages[i + 1]);
    }
    return resp;
  }

  private async runPerStage(resp: Response<any>, stage: string, lowerStage: string) {
    if (resp.status === StatusCode.Error) {
      return resp;
    }
    resp = await this.checkout(resp, lowerStage);
    resp = await this.pull(resp);
    resp = await this.merge(resp, stage);
    resp = await this.push(resp);

    return resp;
  }

  private async cloneIfNeeded(project: Project) {
    const path = this.config.tempPath + '/' + project.name;
    const haveRepos = await git.haveRepo(path, project.repo);
    if (haveRepos) {
      return { status: StatusCode.Success, project };
    }

    this.screenPrinter.setProjectSpinner(project, 'cloning repo...');
    const exec = this.gitBasic(project, git.clone);
    return await exec(this.config.tempPath, project.repo, project.name);
  }

  private async fetch(resp: Response<any>) {
    this.screenPrinter.setProjectSpinner(resp.project, 'fetching changes...');
    const exec = this.gitBasic(resp.project, git.fetch);
    const path = this.config.tempPath + '/' + resp.project.name;
    return await exec(path);
  }

  private async stashChanges(resp: any) {
    this.screenPrinter.setProjectSpinner(resp.project, 'stashing changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.stash);
    return await exec(path);
  }

  private async checkout(resp: Response<any>, ref: string) {
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.checkout);
    return await exec(path, ref);
  }

  private async pull(resp: Response<any>) {
    this.screenPrinter.setProjectSpinner(resp.project, 'pulling changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.pull);
    return await exec(path);
  }

  private async push(resp: Response<any>) {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    this.screenPrinter.setProjectSpinner(resp.project, 'pushing changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = this.gitBasic(resp.project, git.push);
    return await exec(path);
  }

  private async merge(resp: Response<any>, ref: string) {
    this.screenPrinter.setProjectSpinner(resp.project, 'merging changes...');
    const path = this.config.tempPath + '/' + resp.project.name;
    const exec = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseMerge,
      parseGit(resp.project),
      git.merge,
    );
    return await exec(path, ref);
  }
  private gitBasic = (project, fn) =>
    compose(this.responsePrinter.bind(this), errorsAreOk, parseGit(project), fn);
}

export const batmobilCommand: CommandModule = {
  command: 'batmobil [projects]',
  describe: 'updated all stages, merge back changes to previews stages ex prod -> uat -> qa -> dev',
  builder: (yargs) =>
    yargs.positional('projects', {
      default: 'all',
      describe: 'name of affected projects separated by ,(comma)',
    }),
  handler: (argv) => {
    new Batmobil(argv).run();
  },
};
