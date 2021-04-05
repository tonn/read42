import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM } from './Helpers';
import './AppLayout.scss';

export interface ToolBarButton {
  Icon: IconDefinition,
  OnClick?: () => any,
  OpenSidePanel?: boolean,
}

export interface AppLayoutRef {
  hideSidePanel: () => void;
}

interface AppLayoutProps {
  ToolBarButtons: ToolBarButton[],
  SidePanelChildren: React.ReactNode,
  children: React.ReactNode
}

export const AppLayout = forwardRef<AppLayoutRef, AppLayoutProps>(({ ToolBarButtons, SidePanelChildren, children }, ref) => {
  const [ sidePanelVisible, setSidePanelVisible ] = useState(false);
  const sideMenuContentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, (): AppLayoutRef => ({
    hideSidePanel: () => {
      setSidePanelVisible(false);
    }
  }));

  const onButtonClickCallback = useRef((button: ToolBarButton) => {
    if (button.OpenSidePanel) {
      setSidePanelVisible(true);
    }

    if (button.OnClick) {
      button.OnClick();
    }
  });

  const onSideMenuClick = useRef((e: React.MouseEvent) => {
    if (sideMenuContentRef.current && e.target !== sideMenuContentRef.current && !sideMenuContentRef.current.contains(e.target as any)) {
      setSidePanelVisible(false);
      e.stopPropagation();
    }
  });

  return <div className={block()}>
    <div className={elem('SidePanel', sidePanelVisible ? 'Visible' : undefined)} onClick={onSideMenuClick.current}>
      <div className={elem('SidePanelContent', sidePanelVisible ? 'Visible' : undefined)} ref={sideMenuContentRef}>
        {SidePanelChildren}
      </div>
    </div>

    <div className={elem('Toolbar')}>
      { ToolBarButtons.map((button, i) => <div className={elem('Button')} key={i} onClick={() => onButtonClickCallback.current(button)}><FAIcon icon={button.Icon} /></div>) }
    </div>

    <div className={elem('Content')}>
      { children }
    </div>
  </div>;
});

const { block, elem } = BEM(nameof(AppLayout));
