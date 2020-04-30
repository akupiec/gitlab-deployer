import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { awaitPipelineCompletion } from '../common/pipelines';
import { createPipeline, StatusCode } from '../common/api';
import { Yargs } from '../common/Yargs';

export function runPipeline(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    const resp = await triggerPipeline(project, config, yargs, screenPrinter);
    if (resp === StatusCode.Success) {
      return awaitComplete(project, config, yargs, screenPrinter);
    }
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
  await awaitPipelineCompletion(project, config, yargs.ref, screenPrinter);
}

function triggerPipeline(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
) {
  return createPipeline(config.uri, project.id, yargs.ref).then(
    () => {
      screenPrinter.setProjectSuccess(project, 'Pipeline crated');
      return StatusCode.Success;
    },
    err => {
      screenPrinter.setProjectError(project, 'Pipeline not created ' + err);
      return StatusCode.Error;
    },
  );
}
