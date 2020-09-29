import * as packageInfo from '../package.json';
import { tagCommand } from './commands/Tag';
import { checkCommand } from './commands/Check';
import { pipelineCommand } from './commands/Pipeline';
import { jobCommand } from './commands/Job';
import { initCommand } from './commands/Init';
import * as yargs from 'yargs';
import { branchCommand } from './commands/Branch';
import { batarangCommand } from './commands/Batarang';
import { batBombCommand } from './commands/BatBomb';
import { mergeCommand } from './commands/Merge';

const ttyWidth = process.stdout.columns || 120;
yargs
  .usage('Useful little tool in deploying multiple microservices at once when using gitlab')
  .command(initCommand)
  .command(checkCommand)
  .command(pipelineCommand)
  .command(jobCommand)
  .command(branchCommand)
  .command(tagCommand)
  .command(mergeCommand)
  .command(batarangCommand)
  .command(batBombCommand)
  .option('config', {
    type: 'string',
    default: 'config.yml',
    describe: 'path to config file',
  })
  .option('projects', {
    alias: 'p',
    array: true,
    default: 'all',
    describe: 'name of affected projects separated by space',
  })
  .demandCommand(1, 'You need at least one command before moving on.')
  .wrap(ttyWidth)
  .help()
  .version(packageInfo.version).argv;
