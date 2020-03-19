import { Config, Project, Yargs } from './mix/config';
import { ScreenPrinter } from './mix/ScreenPrinter';
import { createTagOnRef, StatusCode } from './mix/api';
import { awaitPipelineCompletion } from './mix/pipelines';

export function runTags(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    await crateTag(project, yargs, screenPrinter);
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
  await awaitPipelineCompletion(project, yargs.tagName, screenPrinter, config.refreshTime);
}

async function crateTag(project: Project, yargs: Yargs, screenPrinter: ScreenPrinter) {
  screenPrinter.setProjectMessage(project, 'Creating Tag');
  return createTagOnRef(project.id, yargs.tagName, yargs.ref).then(
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
