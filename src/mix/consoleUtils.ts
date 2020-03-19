import * as chalk from 'chalk';
import { logo } from './logo';
import { MIN_CONSOLE_WIDTH } from '../costansts';

export function clearConsole() {
  process.stdout.cursorTo(0, 0);
  process.stdout.clearScreenDown();
}

export function checkConsole() {
  let isOk = true;
  if (process.stdout.columns < MIN_CONSOLE_WIDTH) {
    console.error(
      chalk.red.bold(
        `[CRITICAL] Your console not meet required criteria of window width: ${MIN_CONSOLE_WIDTH}, your console is only ${process.stdout.columns} character width`,
      ),
    );
    isOk = false;
  }

  if (process.stdout.cursorTo === undefined || process.stdout.clearScreenDown === undefined) {
    console.error(
      chalk.red.bold(
        `[CRITICAL] Your console not meet one of basic criteria..... of using something decent\nTry using one of:`,
      ),
    );
    console.log('MacOS: Terminal.app');
    console.log('MacOS: iTerm');
    console.log('Windows: ConEmu');
    console.log('Windows: cmd.exe');
    console.log('Windows: Powershell');
    console.log('Windows: Cygwin');
    console.log('Linux: gnome-terminal');
    console.log('Linux: terminator');
    console.log('Linux: konsole');

    isOk = false;

    // @ts-ignore
    process.stdout.cursorTo = process.stdout.cursorTo || (() => {
    });
    // @ts-ignore
    process.stdout.clearScreenDown = process.stdout.clearScreenDown || (() => {
    });
    // @ts-ignore
    process.stdout.clearLine = process.stdout.clearLine || (() => {
    });
  }

  if (!isOk) {
    console.error(
      chalk.red.bold(`[CRITICAL] Consider yourself warned! This app still may work but will look like crap.`),
    );
  }
  return isOk;
}

export function printLogo() {
  console.log(chalk.yellow(logo));
}

export function initConsole() {
  let ifOk = checkConsole();
  if (ifOk) {
    clearConsole();
    printLogo();
  }
}