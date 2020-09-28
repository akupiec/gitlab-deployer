import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { createNewBranch } from '../common/api/api';
import { CommandModule } from 'yargs';
import { branchParser, errorsAreOk, parseNative, Response } from '../common/api/api.adapter';
import { IBranch } from '../common/api/model/iBranch';
import { compose } from 'ramda';

export class Branch extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.createBranch(project);
    return await this.awaitIfNeeded(resp, this.yargs.branchName);
  }

  private async createBranch(project: Project): Promise<Response<IBranch>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating New Branch');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      branchParser,
      parseNative(project),
      createNewBranch,
    );
    return fetch(this.config.uri, project.id, this.yargs.ref, this.yargs.branchName);
  }
}

export const branchCommand: CommandModule = {
  command: 'branch <ref> <branch-name>',
  describe: 'creates new branch',
  builder: (yargs) =>
    yargs
      .usage('creates new branch named <branch-name> using gitlab api on <ref>')
      .positional('ref', {
        describe: 'git ref position where new branch should be located',
        required: true,
      })
      .positional('branch-name', {
        describe: 'branch name to create',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new Branch(argv).run();
  },
};
