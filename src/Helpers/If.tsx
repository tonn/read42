import React, { ReactNode } from 'react';

type IfParams = { condition: boolean };

export const If: React.FC<IfParams> =
  ({ condition, children }) => <> {condition ? children : null} </>;

type IfDivProps = IfParams & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const IfDiv: React.FC<IfDivProps> =
  ({ condition, children, ...divParams }) => <If condition={condition}><div {...divParams}>{children}</div></If>;
