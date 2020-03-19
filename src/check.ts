import { Config, Project, Yargs } from './mix/config';
import { ScreenPrinter } from './mix/ScreenPrinter';
import { awaitPipelineCompletion, getPipeline, Pipeline } from './mix/pipelines';

export function runCheck(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    await checkStatus(project, config, yargs, screenPrinter);
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
  await awaitPipelineCompletion(project, yargs.ref, screenPrinter, config.refreshTime);
}


async function checkStatus(project: Project, config: Config, yargs: Yargs, screenPrinter: ScreenPrinter) {
  const resp = await getPipeline(project, yargs.ref, screenPrinter) as Pipeline;
  if (resp && resp.status) {
    screenPrinter.setProjectSuccess(project, 'Pipeline status: ' + resp.status + ' last update ' + resp.created_at);
  }

}


