// @ts-nocheck
import compareVersions from 'compare-versions';
import { MINIMUM_CONFIG_VERSION } from '../costansts';

export function isConfigOld(config) {
  return compareVersions.compare(config.version, MINIMUM_CONFIG_VERSION, '<');
}

export function validateConfig(config) {
  const deepCmp = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let isOk = 1;
  isOk &= !isConfigOld(config);
  isOk &= !!config['base-api'];
  isOk &= config['base-api'].includes('http');
  isOk &= config['base-api'].includes('git');
  isOk &= config.projects != undefined;
  isOk &= config.deploy != undefined;
  isOk &= !!config['refresh-time'];
  isOk &= deepCmp(Object.keys(config.projects), Object.keys(config.deploy));
  isOk &= !!Object.keys(config.projects).length;
  return isOk;
}
