import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { checkDiff, createNewMergeRequest } from '../common/api/api';
import { CommandModule } from 'yargs';
import { compose } from 'ramda';
import {
  diffParser,
  errorsAreOk,
  parseMerge,
  parseNative,
  Response,
  StatusCode,
} from '../common/api/api.adapter';
import { ICompare } from '../common/api/model/iCompare';

export class Merge extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let resp: any = await this.checkDiff(project);
    resp = await this.createMR(resp);
    resp = await this.awaitIfNeeded(resp, resp.data.sha);
    return resp;
  }

  private checkDiff(project: Project): Promise<Response<ICompare>> {
    this.screenPrinter.setProjectSpinner(project, 'Checking diff for MR');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      diffParser,
      parseNative(project),
      checkDiff,
    );
    return fetch(this.config.uri, project.id, this.yargs.sourceRef, this.yargs.targetRef);
  }

  private async createMR<T>(resp: Response<T>): Promise<Response<T>> {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    this.screenPrinter.setProjectSpinner(resp.project, 'Creating New MergeRequest');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseMerge,
      parseNative(resp.project),
      createNewMergeRequest,
    );
    return await fetch(
      this.config.uri,
      resp.project.id,
      this.yargs.sourceRef,
      this.yargs.targetRef,
      this.yargs.title,
    );
  }
}

export const mergeCommand: CommandModule = {
  command: 'merge <sourceRef> <targetRef> <title> [projects]',
  describe:
    'creates new MergeRequest from <sourece> to <target> named by <title> on given [projects]',
  builder: (yargs) =>
    yargs
      .positional('sourceRef', {
        describe: 'git ref of source branch',
        required: true,
      })
      .positional('targetRef', {
        describe: 'git ref of source branch',
        required: true,
      })
      .positional('title', {
        describe: 'title marge request',
        required: true,
      })
      .positional('projects', {
        default: 'all',
        describe: 'name of affected projects separated by ,(comma)',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new Merge(argv).run();
  },
};
