import { Config, Project, Yargs } from './mix/config';
import { ScreenPrinter } from './mix/ScreenPrinter';
import { createTagOnRef, getPipelineByRef } from './mix/api';
import * as chalk from 'chalk';

enum StatusCode {
  Error,
  Success,
  Warn,
}

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

  Promise.all(promises).then(
    () => console.log(chalk.green('[Success] ') + 'All done!'),
    err => {
      console.log(chalk.red('[Error] ') + 'Something went wrong!' + err);
    },
  );
}

function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

async function awaitComplete(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
) {
  if (!config.awaitTags) return;
  screenPrinter.setProjectSpinner(project, 'Awaiting pipeline...');
  let isCompleted = false;
  while (!isCompleted) {
    await sleep(config.refreshTime);
    isCompleted = await pipelineCompleted(project, yargs.tagName, screenPrinter);
  }
  screenPrinter.stopProjectSpinner(project);
}

async function crateTag(project: Project, yargs: Yargs, screenPrinter: ScreenPrinter) {
  screenPrinter.setProjectMessage(project, 'Creating Tag');
  return createTagOnRef(project.id, yargs.tagName, yargs.ref).then(
    () => {
      screenPrinter.setProjectSuccess(project, 'New Tag crated');
      return StatusCode.Success;
    },
    (error) => {
      screenPrinter.setProjectError(project, 'Cant create tag: ' + error);
      return StatusCode.Error;
    },
  );
}

async function pipelineCompleted(project: Project, tagName: string, screenPrinter: ScreenPrinter) {
  return getPipelineByRef(project.id, tagName).then(
    data => {
      if (!data) {
        screenPrinter.setProjectWarn(project, 'Pipeline Not Found');
        return true;
      } else {
        screenPrinter.setProjectSuccess(project, 'Tag created and pipeline done!');
        return data.status === 'success';
      }
    },
    error => {
      screenPrinter.setProjectError(project, error.message);
      return true;
    },
  );
}
