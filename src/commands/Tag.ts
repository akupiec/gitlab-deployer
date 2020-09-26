import { Project } from '../common/Config';
import { createTagOnRef } from '../common/api/api';
import { PipelineRunner } from './abstract/PipelineRunner';
import { CommandModule } from 'yargs';
import { errorsAreOk, parseNative, parseTagOnRef, Response } from '../common/api/api.adapter';
import { compose } from 'ramda';

export class Tag extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const resp = await this.crateTag(project);

    return await this.awaitIfNeeded(resp, this.yargs.tagName);
  }

  private async crateTag(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating Tag');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseTagOnRef,
      parseNative(project),
      createTagOnRef,
    );
    return fetch(this.config.uri, project.id, this.yargs.tagName, this.yargs.ref);
  }
}

export const tagCommand: CommandModule = {
  command: 'tag <ref> <tag-name> [projects]',
  describe: 'creates new tag',
  builder: (yargs) =>
    yargs
      .usage('creates new tag with <tag-name> using gitlab api on <ref>')
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
