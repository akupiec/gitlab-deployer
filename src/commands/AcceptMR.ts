import { Project } from '../common/Config';
import { findMergeRequests } from '../common/api/api';
import { CommandModule } from 'yargs';
import { compose } from 'ramda';
import { errorsAreOk, parseFindSingleMR, parseNative } from '../common/api/api.adapter';
import { MergeRunner } from './abstract/MergeRunner';

export class AcceptMR extends MergeRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.findMR(project);
    resp = await this.mergeMR(resp);
    resp = await this.awaitIfNeeded(resp, resp.data.sha);
    return resp;
  }

  private findMR(project: Project) {
    this.screenPrinter.setProjectSpinner(project, 'Searching MRs');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseFindSingleMR,
      parseNative(project),
      findMergeRequests,
    );
    return fetch(this.config.uri, project.id, this.yargs.title, false);
  }
}

export const acceptCommand: CommandModule = {
  command: 'accept <title> [projects]',
  describe: 'accept & autoMerge <title> merge request in [projects]',
  builder: (yargs) =>
    yargs
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
    new AcceptMR(argv).run();
  },
};
