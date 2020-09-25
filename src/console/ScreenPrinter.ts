import { Project } from '../common/Config';
import chalk from 'chalk';
import { Instance, render } from 'ink';
import { InkPainter } from './InkPainter';
import { createElement } from 'react';
import { LineData, LineType } from './Interfaces';
import { Response, StatusCode } from '../common/api/api.adapter';

export class ScreenPrinter {
  private projectsLines: Map<Project, LineData> = new Map();
  private ink: Instance;

  constructor() {
    this.ink = render(
      createElement(InkPainter, { name: 'deployer', projects: this.projectsLines }),
      { experimental: true },
    );
  }

  addProject(project: Project) {
    this.projectsLines.set(project, {});
    return this;
  }

  setProjectSpinner(project: Project, message: string) {
    const data = this.projectsLines.get(project);
    data.message = message;
    data.type = LineType.Spinner;
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

  setRespMsg(resp: Response<any>) {
    switch (resp.status) {
      case StatusCode.Error:
        return this.setProjectError(resp.project, resp.message);
      case StatusCode.Warn:
        return this.setProjectWarn(resp.project, resp.message);
      case StatusCode.Success:
        return this.setProjectSuccess(resp.project, resp.message);
    }
  }

  setProjectMessage(project: Project, message: string) {
    const data = this.projectsLines.get(project);
    data.message = message;
    data.type = LineType.String;
    this.projectsLines.set(project, data);
    this.print();
    return this;
  }

  print() {
    this.ink.rerender(
      createElement(InkPainter, { name: 'deployer', projects: this.projectsLines }),
    );
  }

  onEnd(promises: Promise<Response<any>>[]) {
    Promise.all(promises).then(
      (resp) => {
        this.ink.unmount();
        if (resp.every((r) => r.status === StatusCode.Success)) {
          console.log(chalk.green('[Success] ') + 'All done!');
        } else if (resp.some((r) => r.status === StatusCode.Error)) {
          console.log(chalk.red('[Error] ') + 'Something went wrong!');
        } else {
          console.log(chalk.red('[Warn] ') + 'Something went wrong!');
        }
      },
      (err) => {
        this.ink.unmount();
        console.log(chalk.red('[Error] ') + 'Something went wrong!' + err);
      },
    );
  }
}
