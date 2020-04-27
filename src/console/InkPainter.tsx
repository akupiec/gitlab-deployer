import React, { Component } from 'react';
import { Box, Color } from 'ink';
import BigText from 'ink-big-text';
import Spinner from 'ink-spinner';
import { InkProps, LineType } from './Interfaces';

const ProjectLine = ({ projectName, children }) => {
  return (
    <>
      <Box>===== {projectName} =====</Box>
      <Box marginLeft={6}>{children}</Box>
    </>
  );
};

const Logo = ({ isTTY, columns, name }) => {
  if (!isTTY) return <></>;
  if (columns < 75) return <></>;
  return (
    <Box>
      <Color yellow>
        <BigText text={name} align="center"/>
      </Color>
    </Box>
  );
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
          <Spinner type="arrow3"/> {v.message}
        </>
      );
      lines.push(
        <ProjectLine projectName={k.name} key={k.id}>
          {v.type === LineType.Spinner ? spinner : text}
        </ProjectLine>,
      );
    });

    return (
      <>
        <Logo isTTY={process.stdout.isTTY} columns={this.state.columns} name={this.props.name}/>
        {lines}
      </>
    );
  }

  componentDidMount(): void {
    process.stdout.on('resize', () => {
      this.setState({ columns: 0 });
    });
  }
}
