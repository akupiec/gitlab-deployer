import { Project } from './config';
import { initConsole } from './consoleUtils';
import { LOGO_HEIGHT } from './logo';
import * as chalk from 'chalk';
import { Spinner } from '../spinner';

enum LineType {
  String,
  Spinner,
}

interface LineData {
  yOffset: number;
  type?: LineType;
  message?: any;
  lineObj?: Spinner;
}

export class ScreenPrinter {
  private projectsLines: Map<Project, LineData> = new Map();
  private nextOffset = LOGO_HEIGHT;

  constructor() {
    initConsole();
  }

  private static clearOldData(data: LineData) {
    if (data.type === LineType.Spinner) {
      data.lineObj.stop();
      data.lineObj = undefined;
    }
  }

  print() {
    this.projectsLines.forEach((value, key) => {
      process.stdout.cursorTo(0, value.yOffset);
      console.log(`===== ${key.name} =====`);
      this.handlePrintString(value, key);
      this.handlePrintSpinner(value);
    });
  }

  addProject(project: Project) {
    this.nextOffset += 2;
    this.projectsLines.set(project, {
      yOffset: this.nextOffset,
    });
    return this;
  }

  setProjectSpinner(project: Project, message: string) {
    const data = this.projectsLines.get(project);
    ScreenPrinter.clearOldData(data);
    data.message = message;
    data.type = LineType.Spinner;
    data.lineObj = new Spinner(message, ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'], 250);
    this.projectsLines.set(project, data);
    this.print();
    return this;
  }

  setProjectError(project: Project, message: string) {
    return this.setProjectMessage(project, chalk.red.bold('[ERROR] ') + chalk.red(message));
  }

  setProjectSuccess(project: Project, message: string) {
    return this.setProjectMessage(project, chalk.green.bold('[Success] ') + message);
  }

  setProjectWarn(project: Project, message: string) {
    return this.setProjectMessage(project, chalk.yellow.bold('[Warn] ') + message);
  }

  setProjectMessage(project: Project, message: string) {
    const data = this.projectsLines.get(project);
    ScreenPrinter.clearOldData(data);
    data.message = message;
    data.type = LineType.String;
    this.projectsLines.set(project, data);
    this.print();
    return this;
  }

  stopProjectSpinner(project: Project) {
    const data = this.projectsLines.get(project);
    ScreenPrinter.clearOldData(data);
  }

  private handlePrintSpinner(value: LineData) {
    if (value.type === LineType.Spinner && !value.lineObj.isSpinning()) {
      process.stdout.cursorTo(0, value.yOffset + 1);
      process.stdout.clearLine(0);
      value.lineObj.start(4, value.yOffset + 1);
    }
  }

  private handlePrintString(value: LineData, key: Project) {
    if (value.type === LineType.String) {
      console.log(`      ${value.message}`);
      return;
    }
  }

  public updateProjectSpinner(project: Project, message: string) {
    const data = this.projectsLines.get(project);
    if (data.type === LineType.Spinner) {
      data.lineObj.message(message);
    }
  }

  public onEnd(promises: Promise<void>[]) {
    Promise.all(promises).then(
      () => console.log(chalk.green('[Success] ') + 'All done!'),
      err => {
        console.log(chalk.red('[Error] ') + 'Something went wrong!' + err);
      },
    );
  }
}
