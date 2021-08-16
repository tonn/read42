import React, { useEffect, useState } from 'react';
import { BEM, cn } from './BEM';
import { Map } from './Map';
import './Tabs.scss';

interface Tab { Title: string, Render: () => React.ReactNode }

export const Tabs: React.FC<{ Tabs: Tab[], className?: string }> = ({ Tabs, className }) => {
  const [ currentTab, setCurrentTab ] = useState<Tab>();

  useEffect(() => {
    setCurrentTab(Tabs[0]);
  }, [Tabs]);

  return (
    <div className={cn(block(), className)}>
      <div className={elem('Buttons')}>
        <div className={elem('Spacer', 'Left')} />

        <Map items={Tabs} render={(tab, index) =>
          <button key={index} className={elem('Tab', currentTab === tab && 'Selected')} onClick={() => setCurrentTab(tab)}>{tab.Title}</button>
        } />

        <div className={elem('Spacer')} />
      </div>
      <div className={elem('Content')}>
        {currentTab?.Render()}
      </div>
    </div>
  );
}

const { block, elem } = BEM('Tabs');
