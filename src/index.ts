import * as chalk from "chalk";
import {name} from "./name";
import * as Optionator from "optionator";
import * as packageInfo from "../package.json";

console.log(chalk.yellow(name));

interface AAA {
  test: number;
}

export const a: AAA = {
  test: 1
};

const optionator = Optionator({
  // prepend: "Usage: cmd [options]",
  append: "Version " + packageInfo.version,
  options: [
    {
      option: "help",
      alias: "h",
      type: "Boolean",
      description: "displays help"
    },
    {
      option: "tag",
      alias: "c",
      type: "Int",
      description: "number of things",
      example: "cmd --count 2"
    }
  ]
});

var options = optionator.parseArgv(process.argv);
if (options.help) {
  console.log(optionator.generateHelp());
}
