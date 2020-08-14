import * as packageInfo from '../package.json';
import { Tags } from './commands/tags';
import { Check } from './commands/check';
import { Pipeline } from './commands/pipeline';
import { Job } from './commands/job';
import { runInit } from './commands/init';
import * as yargs from 'yargs';
import { CommandModule } from 'yargs';
import { Branch } from './commands/branch';

const tagCommand: CommandModule = {
  command: 'tag <ref> <tag-name> [project]',
  describe: 'creates new tags on configured projects',
  builder: (yargs) =>
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
  handler: (argv) => {
    new Tags(argv).run();
  },
};

const branchCommand: CommandModule = {
  command: 'branch <ref> <branch-name> [project]',
  describe: 'creates new branch on configured projects',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position where new branch should be located',
        required: true,
      })
      .positional('branch-name', {
        describe: 'branch name to remove/delete',
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
  handler: (argv) => {
    new Branch(argv).run();
  },
};

const checkCommand: CommandModule = {
  command: 'check <ref> [project]',
  describe: 'check status of pipeline',
  builder: (yargs) =>
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
  handler: (argv) => {
    new Check(argv).run();
  },
};

const pipelineCommand: CommandModule = {
  command: 'pipeline <ref> [project]',
  describe: 'trigger pipeline',
  aliases: ['redeploy'],
  builder: (yargs) =>
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
  handler: (argv) => new Pipeline(argv).run(),
};
const jobCommand: CommandModule = {
  command: 'job <ref> [stage] [project]',
  describe: 'runs single pipeline job',
  aliases: ['deploy'],
  builder: (yargs) =>
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
  handler: (argv) => {
    new Job(argv).run();
  },
};

const initCommand: CommandModule = {
  command: 'init',
  describe: 'Create configuration file',
  handler: (argv) => runInit(argv),
};

const ttyWidth = process.stdout.columns || 80;
yargs
  .command(tagCommand)
  .command(branchCommand)
  .command(checkCommand)
  .command(pipelineCommand)
  .command(jobCommand)
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
