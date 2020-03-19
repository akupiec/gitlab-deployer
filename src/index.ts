#!/usr/bin/env node
import * as packageInfo from '../package.json';
import { runTags } from './tags';
import { runCheck } from './check';

require('yargs')
  .command(
    'tag <ref> <tag-name> [project]',
    'creates new tags on configured projects',
    yargs => {
      yargs
        .positional('ref', {
          describe: 'git ref position where new tag should be located can be tag, branch or commit hash',
        })
        .positional('tag-name', {
          describe: 'tag name to remove/delete',
        })
        .positional('project', {
          default: 'all',
          describe: 'name of project if should affect only one',
        })
        .option('await', {
          alias: 'a',
          type: 'boolean',
          default: true,
          description: 'awaits pipeline completion',
        });
      // .option('create', {
      //   alias: 'c',
      //   type: 'boolean',
      //   default: true,
      //   description: 'indicates new tag to be created',
      // })
      // .option('delete', {
      //   alias: 'd',
      //   type: 'boolean',
      //   description: 'indicates tag to be deleted',
      // });
    },
    argv => runTags(argv),
  )
  .command(
    'check <ref> [project]',
    'check status of pipeline',
    yargs => {
      yargs
        .positional('ref', {
          describe: 'git ref position can be tag, branch or hash',
        })
        .positional('project', {
          default: 'all',
          describe: 'name of project if should affect only one',
        })
        .option('await', {
          alias: 'a',
          type: 'boolean',
          default: false,
          description: 'awaits pipeline completion',
        });
    },
    argv => runCheck(argv),
  )
  .command(
    'deploy <ref> <target> [stage]',
    'runs deploy pipelines',
    yargs => {
      yargs
        .positional('ref', {
          describe: 'git ref position what should be deployed',
        })
        .positional('target', {
          describe: '',
        });
    },
    argv => runTags(argv),
  )
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
  // .option("confirm-all", {
  //   alias: "y",
  //   description: ""
  // })
  .version(packageInfo.version).argv;
