import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { createTagOnRef, Response, StatusCode } from '../common/api';
import { awaitPipelineCompletion } from '../common/pipelines';
import { Yargs } from '../common/Yargs';

export function runTags(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    const tag = await crateTag(project, config, yargs, screenPrinter);
    if (yargs.await) {
      return await awaitPipelineCompletion(project, config, yargs.tagName, screenPrinter);
    }
    return tag;
  });

  screenPrinter.onEnd(promises);
}

async function crateTag(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
): Promise<Response<any>> {
  screenPrinter.setProjectMessage(project, 'Creating Tag');
  return createTagOnRef(config.uri, project.id, yargs.tagName, yargs.ref).then(
    () => {
      screenPrinter.setProjectSuccess(project, 'New Tag crated');
      return {
        status: StatusCode.Success,
      };
    },
    error => {
      const message = 'Cant create tag (already exists ?): ' + error;
      screenPrinter.setProjectError(project, message);
      return {
        status: StatusCode.Error,
        message,
      };
    },
  );
}
