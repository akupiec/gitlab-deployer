import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { awaitPipelineCompletion, getPipeline } from '../common/pipelines';
import { Yargs } from '../common/Yargs';
import { StatusCode } from '../common/api';

export function runCheck(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(_runPerProject(screenPrinter, config, yargs));
  screenPrinter.onEnd(promises);
}

function _runPerProject(screenPrinter: ScreenPrinter, config: Config, yargs: Yargs) {
  return async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    if (yargs.await) {
      return await awaitPipelineCompletion(project, config, yargs.ref, screenPrinter);
    } else {
      return await checkStatus(project, config, yargs, screenPrinter);
    }
  };
}

async function checkStatus(project: Project, config: Config, yargs: Yargs, painter: ScreenPrinter) {
  painter.setProjectSpinner(project, 'Searching pipeline...');

  const resp = await getPipeline(project, config, yargs.ref, painter);
  const data = resp.data;
  if (resp.status === StatusCode.Success) {
    const msg = `Pipeline status: ${data.status} last update ${data.created_at}`;
    painter.setProjectSuccess(project, msg);
  }
  return resp;
}
