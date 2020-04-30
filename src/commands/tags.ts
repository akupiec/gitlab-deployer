import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { createTagOnRef, StatusCode } from '../common/api';
import { awaitPipelineCompletion } from '../common/pipelines';
import { Yargs } from '../common/Yargs';

export function runTags(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    await crateTag(project, config, yargs, screenPrinter);
    return awaitComplete(project, config, yargs, screenPrinter);
  });

  screenPrinter.onEnd(promises);
}

async function awaitComplete(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
) {
  if (!yargs.await) return;
  await awaitPipelineCompletion(project, config, yargs.tagName, screenPrinter);
}

async function crateTag(project: Project, config: Config, yargs: Yargs, screenPrinter: ScreenPrinter) {
  screenPrinter.setProjectMessage(project, 'Creating Tag');
  return createTagOnRef(config.uri, project.id, yargs.tagName, yargs.ref).then(
    () => {
      screenPrinter.setProjectSuccess(project, 'New Tag crated');
      return StatusCode.Success;
    },
    error => {
      screenPrinter.setProjectError(project, 'Cant create tag (already exists ?): ' + error);
      return StatusCode.Error;
    },
  );
}
