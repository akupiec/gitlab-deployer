import { Project } from '../common/Config';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as packageInfo from '../../package.json';
import { findProject } from '../common/api';
import { Yargs } from '../common/Yargs';

var inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const YAML = require('yaml');

export async function runInit(args) {
  const yargs = new Yargs(args);

  checkIfFileExists(yargs);

  const basicAPI = await askBasicApi();
  const projectNumber = await askNumberOfProjects();
  const projects = await askProjects(basicAPI, projectNumber);
  const stages = await askStages();
  const isGenericJobs = await askIsJobsNamesGeneric();
  const refresh = await askRefreshTime();
  // questions for non-generic-names

  const config = {
    version: packageInfo.version,
    'base-api': basicAPI,
    projects: mapProjects(projects),
    deploy: mapStages(projects, stages, isGenericJobs),
    'refresh-time': refresh,
  };
  const openEditor = await askOpenEditor();
  let data = YAML.stringify(config);

  if (openEditor) {
    data = await askData(data);
  }

  fs.writeFileSync(yargs.configPath, data);
}

function askData(data: string) {
  return inquirer
    .prompt({
      name: 'data',
      message: 'You can edit and/or validate generated config.',
      type: 'editor',
      default: data,
    })
    .then(resp => resp.data);
}

function askOpenEditor() {
  return inquirer.prompt({
    name: 'openEditor',
    message: 'Would you like to preview & edit your configuration ?',
    type: 'confirm',
    default: false,
  }).then(resp => resp.openEditor);
}

function mapProjects(projects: Project[]) {
  let ret = {};
  projects.forEach(project => {
    ret[project.name.replace(' ', '_')] = project.id;
  });
  return ret;
}

function mapStages(projects: Project[], stages: string[], isGenericJobs: boolean) {
  let ret = {};
  projects.forEach(project => {
    let projectStages = {};
    stages.forEach(stage => {
      projectStages[stage] = isGenericJobs ? stage : `job-name-for-${stage}`;
    });
    ret[project.name.replace(' ', '_')] = projectStages;
  });
  return ret;
}

async function askIsJobsNamesGeneric() {
  return inquirer
    .prompt({
      name: 'isGenericJobs',
      message:
        'Is deployment jobs named like stages, ex.: "dev" stage will be triggered by "dev" job ',
      type: 'confirm',
    })
    .then(resp => resp.isGenericJobs);
}

async function askStages() {
  return inquirer
    .prompt({
      name: 'stages',
      message: 'Provide deployment stages separated by comma',
      type: 'input',
      filter: function(input: string) {
        return input.split(',').map(stage => stage.trim());
      },
    })
    .then(resp => resp.stages);
}

async function askRefreshTime() {
  return inquirer
    .prompt({
      name: 'refresh',
      message: 'Provide refresh time in [ms] how often pipelines will be checked',
      type: 'number',
      default: 10000,
    })
    .then(resp => resp.refresh);
}

function askBasicApi() {
  return inquirer
    .prompt({
      name: 'data',
      message: 'Provide gitlab api v4 url',
      type: 'input',
      default: 'https://git.<your_inner_domain>.com/api/v4',
      validate: function(input: string) {
        if (!input.startsWith('https://')) {
          return 'Protocol need to be a "https"';
        }
        if (!input.includes('/api/v4') || !input.includes('git')) {
          return 'Invalid url, it should looks line https://git.<your_inner_domain>.com/api/v4';
        }
        return true;
      },
    })
    .then(resp => resp.data);
}

function askNumberOfProjects() {
  return inquirer
    .prompt({
      name: 'projectNumber',
      message: 'How many subprojects you want to configure?',
      type: 'number',
      default: 4,
    })
    .then(resp => resp.projectNumber);
}

async function askProjects(url: string, num: number) {
  const projects = [];
  for (let i = 0; i < num; i++) {
    const { project } = await inquirer.prompt({
      name: 'project',
      message: 'Provide name of ' + i + ' project',
      type: 'autocomplete',
      source: function(answersSoFar, input) {
        return findProject(url, input).then(resp =>
          resp.map(project => ({
            name: project.name,
            value: project,
          })),
        );
      },
    });
    projects.push(project);
  }
  return projects;
}

function checkIfFileExists(yargs: Yargs) {
  let path = yargs.configPath;
  if (fs.existsSync(path)) {
    console.error(chalk.red('[ERROR] configuration file is exists, try using different filename'));
    process.exit(-1);
  }
}
