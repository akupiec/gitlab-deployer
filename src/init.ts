import { Project, Yargs } from './common/config';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as packageInfo from '../package.json';
import { findProject } from './common/api';

var inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const YAML = require('yaml');

export async function runInit(args) {
  const yargs = new Yargs(args);

  checkIfFileExists(yargs);

  const { basicAPI } = await basicAPIaaa();
  const { projectNumber } = await inquirerNumProjects();
  const projects = await inquirerProjects(basicAPI, projectNumber);
  const { stages } = await inquirerStages();
  let { isGenericJobs } = await isGenericNames();
  let { refresh } = await inquirerRefreshTime();
  // questions for non-generic-names

  const config = {
    version: packageInfo.version,
    'base-api': basicAPI,
    projects: mapProjects(projects),
    deploy: mapStages(projects, stages, isGenericJobs),
    'refresh-time': refresh,
  };
  //preview config

  fs.writeFileSync(yargs.configPath, YAML.stringify(config));
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

async function isGenericNames() {
  return inquirer.prompt({
    name: 'isGenericJobs',
    message:
      'Is deployment jobs named like stages, ex.: "dev" stage will be triggered by "dev" job ',
    type: 'confirm',
  });
}

async function inquirerStages() {
  return inquirer.prompt({
    name: 'stages',
    message: 'Provide deployment stages separated by comma',
    type: 'input',
    filter: function(input: string) {
      return input.split(',').map(stage => stage.trim());
    },
  });
}

async function inquirerRefreshTime() {
  return inquirer.prompt({
    name: 'refresh',
    message: 'Provide refresh time in [ms] how often pipelines will be checked',
    type: 'number',
    default: 10000,
  });
}

function basicAPIaaa() {
  return inquirer.prompt({
    name: 'basicAPI',
    message: 'Provide gitlab api v4 url',
    type: 'input',
    default: 'https://git.signintra.com/api/v4',
    validate: function(input: string) {
      if (!input.startsWith('https://')) {
        return 'Protocol need to be a "https"';
      }
      if (!input.includes('/api/v4') || !input.includes('git')) {
        return 'Invalid url, it should looks line https://git.<your-domain>.com/api/v4';
      }
      return true;
    },
  });
}

function inquirerNumProjects() {
  return inquirer.prompt({
    name: 'projectNumber',
    message: 'How many subprojects you want to configure?',
    type: 'number',
    default: 4,
  });
}

async function inquirerProjects(url: string, num: number) {
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
