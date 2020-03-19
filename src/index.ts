#!/usr/bin/env node
import * as packageInfo from '../package.json';
import { runTags } from './tags';

require('yargs')
  .command(
    'tag <ref> <tag-name> [project]',
    'bulk git tag management',
    yargs => {
      yargs
        .positional('ref', {
          describe: 'git ref position where tag should be located',
        })
        .positional('tag-name', {
          describe: 'tag name to remove/delete',
        })
        .positional('project', {
          default: 'all',
          describe: 'name of project if should affect only one',
        })
        .option('create', {
          alias: 'c',
          type: 'boolean',
          default: true,
          description: 'indicates new tag to be created',
        })
        .option('delete', {
          alias: 'd',
          type: 'boolean',
          description: 'indicates tag to be deleted',
        });
    },
    argv => runTags(argv),
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
