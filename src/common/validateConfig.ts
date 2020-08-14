// @ts-nocheck

export function validateConfig(config) {
  const deepCmp = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let isOk = 1;
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
