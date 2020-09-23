import { Project } from '../common/Config';
import { createTagOnRef, Response, StatusCode } from '../common/api/api';
import { PipelineRunner } from './abstract/PipelineRunner';
import { CommandModule } from 'yargs';

export class Tag extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const tag = await this.crateTag(project);

    if (this.yargs.await && tag.status === StatusCode.Success) {
      return await this.awaitForFuturePipe(project, this.yargs.tagName);
    }
    return tag;
  }

  private async crateTag(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating Tag');
    return createTagOnRef(this.config.uri, project.id, this.yargs.tagName, this.yargs.ref).then(
      () => {
        this.screenPrinter.setProjectSuccess(project, 'New Tag crated');
        return { status: StatusCode.Success };
      },
      (error) => {
        const message = 'Cant create tag (already exists ?): ' + error;
        this.screenPrinter.setProjectError(project, message);
        return { status: StatusCode.Error, message };
      },
    );
  }
}

export const tagCommand: CommandModule = {
  command: 'tag <ref> <tag-name> [projects]',
  describe: 'creates new tags on configured projects',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe:
          'git ref position where new tag should be located can be tag, branch or commit hash',
        required: true,
      })
      .positional('tag-name', {
        describe: 'tag name to remove/delete',
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
    new Tag(argv).run();
  },
};