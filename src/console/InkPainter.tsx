import React, { Component } from 'react';
import { Box } from 'ink';
import Spinner from 'ink-spinner';
import { InkProps, LineType } from './Interfaces';

const a = `
                          _  _
                _____*~~~  **  ~~~*_____      
             __* ___     |\\__/|     ___ *__
           _*  / 888~~\\__(8OO8)__/~~888 \\  *_
         _*   /88888888888888888888888888\\   *_
         *   |8888888888888888888888888888|   *
        /~*  \\8888/~\\88/~\\8888/~\\88/~\\8888/  *~
        / ~*  \\88/   \\/   (88)   \\/   \\88/  *~
       /   ~*  \\/          \\/          \\/  *~
       /     ~~*_                      _*~~/
       /         ~~~~~*___ ** ___*~~~~~  /
      /                   ~  ~         /
      /                              /
      /                            /
     /                           /
     /          _________       /
     /         | ####### |    / 
    /     ___  | ####### |   /         _______      
__gitlab__I_I  | ####### |  /         | ooooo |
 ##########  | | ####### |__deployer__| ooooo |
 ##########  | | ####### |oo%Xoox%ooxo| ooooo |
 ##########  | | ####### |%%x/oo/xx%xo| ooooo |
 ##########  | | ####### |xxooo%%/xo%o| ~~$~~ |
 ##########  | | ####### |oox%%o/x%%ox| ooooo |
 ##########  | | ####### |x%oo%x/o%//x| ooooo |
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
`;

const ProjectLine = ({ projectName, children }) => {
  return (
    <>
      <Box>===== {projectName} =====</Box>
      <Box marginLeft={6}>{children}</Box>
    </>
  );
};

const Logo = ({ isTTY, columns }) => {
  if (!isTTY) return <></>;
  if (columns < 90) return <></>;
  return <Box width={50}>{a}</Box>;
};

export class InkPainter extends Component<InkProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      columns: process.stdout.columns,
    };
  }

  render() {
    const lines = [];
    this.props.projects.forEach((v, k) => {
      const text = <>{v.message || ''}</>;
      const spinner = (
        <>
          <Spinner type="arrow3" /> {v.message}
        </>
      );
      const showSpinner = v.type === LineType.Spinner && process.stdout.isTTY;
      lines.push(
        <ProjectLine projectName={k.name} key={k.id}>
          {showSpinner ? spinner : text}
        </ProjectLine>,
      );
    });

    return (
      <Box flexDirection={'row'} width={this.state.columns}>
        <Logo isTTY={process.stdout.isTTY} columns={this.state.columns} />
        <Box flexDirection={'column'}>{lines}</Box>
      </Box>
    );
  }

  componentDidMount(): void {
    process.stdout.on('resize', () => {
      this.setState({ columns: process.stdout.columns });
    });
  }
}
