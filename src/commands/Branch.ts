import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { createNewBranch, Response, StatusCode } from '../common/api/api';
import { CommandModule } from 'yargs';

export class Branch extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const promise = await this.createBranch(project);
    if (this.yargs.await && promise.status === StatusCode.Success) {
      return await this.awaitForFuturePipe(project, this.yargs.branchName);
    } else {
      return promise;
    }
  }

  private async createBranch(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating New Branch');
    return createNewBranch(this.config.uri, project.id, this.yargs.ref, this.yargs.branchName).then(
      () => {
        this.screenPrinter.setProjectSuccess(project, 'New Branch crated');
        return { status: StatusCode.Success };
      },
      (error) => {
        const message = 'Cant create branch (already exists ?): ' + error;
        this.screenPrinter.setProjectError(project, message);
        return { status: StatusCode.Error, message };
      },
    );
  }
}

export const branchCommand: CommandModule = {
  command: 'branch <ref> <branch-name> [projects]',
  describe: 'creates new branch on configured projects',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position where new branch should be located',
        required: true,
      })
      .positional('branch-name', {
        describe: 'branch name to remove/delete',
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
    new Branch(argv).run();
  },
};