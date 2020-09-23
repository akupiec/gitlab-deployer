import * as packageInfo from '../package.json';
import { tagCommand } from './commands/Tag';
import { checkCommand } from './commands/Check';
import { pipelineCommand } from './commands/Pipeline';
import { jobCommand } from './commands/Job';
import { initCommand } from './commands/Init';
import * as yargs from 'yargs';
import { branchCommand } from './commands/Branch';

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
