import * as packageInfo from '../package.json';
import { tagCommand } from './commands/Tag';
import { checkCommand } from './commands/Check';
import { pipelineCommand } from './commands/Pipeline';
import { jobCommand } from './commands/Job';
import { initCommand } from './commands/Init';
import * as yargs from 'yargs';
import { branchCommand } from './commands/Branch';
import { mergeCommand } from './commands/Merge';
import { acceptCommand } from './commands/AcceptMR';
import { batmobilCommand } from './commands/Batmobil';
import { batarangCommand } from './commands/Batarang';

const ttyWidth = process.stdout.columns || 80;
yargs
  .command(initCommand)
  .command(checkCommand)
  .command(pipelineCommand)
  .command(jobCommand)
  .command(branchCommand)
  .command(tagCommand)
  .command(mergeCommand)
  .command(acceptCommand)
  .command(batmobilCommand)
  .command(batarangCommand)
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
