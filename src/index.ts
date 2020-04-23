import * as packageInfo from '../package.json';
import { runTags } from './tags';
import { runCheck } from './check';
import { runPipeline } from './pipeline';
import { runDeploy } from './deploy';
import { runInit } from './init';
import * as yargs from 'yargs';
import { CommandModule } from 'yargs';

const tagCommand: CommandModule = {
  command: 'tag <ref> <tag-name> [project]',
  describe: 'creates new tags on configured projects',
  builder: yargs =>
    yargs
      .positional('ref', {
        describe:
          'git ref position where new tag should be located can be tag, branch or commit hash',
        required: true,
      })
      .positional('tag-name', {
        describe: 'tag name to remove/delete',
      })
      .positional('project', {
        default: 'all',
        describe: 'name of affected project',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: argv => runTags(argv),
};

const checkCommand: CommandModule = {
  command: 'check <ref> [project]',
  describe: 'check status of pipeline',
  builder: yargs =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .positional('project', {
        default: 'all',
        describe: 'name of affected project',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: false,
        description: 'awaits pipeline completion',
      }),
  handler: argv => runCheck(argv),
};

const pipelineCommand: CommandModule = {
  command: 'pipeline <ref> [project]',
  describe: 'trigger pipeline',
  builder: yargs =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .positional('project', {
        default: 'all',
        describe: 'name of affected project',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: argv => runPipeline(argv),
};
const deployCommand: CommandModule = {
  command: 'deploy <ref> [stage] [project]',
  describe: 'runs deploy pipelines',
  builder: yargs =>
    yargs
      .positional('ref', {
        describe: 'git ref position what should be deployed',
      })
      .positional('stage', {
        default: 'dev',
        describe: 'name of stage job that will be triggered',
      })
      .positional('project', {
        default: 'all',
        describe: 'name of affected project',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: argv => runDeploy(argv),
};

const initCommand: CommandModule = {
  command: 'init',
  describe: 'Create configuration file',
  handler: argv => runInit(argv),
};

const ttyWidth = process.stdout.columns || 80;
yargs
  .command(tagCommand)
  .command(checkCommand)
  .command(pipelineCommand)
  .command(deployCommand)
  .command(initCommand)
  .option('config', {
    type: 'string',
    default: 'config.yml',
    describe: 'path to config file',
  })
  .option('init', {
    type: 'boolean',
    global: false,
    describe: 'create new deployment configuration file',
  })
  .demandCommand(1, 'You need at least one command before moving on.')
  .wrap(ttyWidth)
  .help()
  .version(packageInfo.version).argv;
