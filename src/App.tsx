import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Readability } from '@mozilla/readability';
import Axios from 'axios';
import React, { useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import './App.scss';
import { AppearanceConfig, IAppearance } from './AppearanceConfig';
import { BEM } from './Helpers';
import { Store } from './Store';
import { StoreComponent } from './Store.Component';
import { RichText } from './RichText';

export const App: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [ article, setArticle ] = useState<string>();
  const [ showMenu, setShowMenu ] = useState<boolean>(false);
  const [ appearance ] = useState<IAppearance>(Store.State.Appearance);
  const urlInput = useRef<HTMLInputElement>(null);

  async function onReadButtonClick() {
    if (urlInput.current?.value) {
      const url = `https://cors-anywhere.herokuapp.com/${urlInput.current.value}`;

      const html = (await Axios.get(url)).data as string;

      const articleDiv = document.implementation.createHTMLDocument('innerArticleDocument');
      articleDiv.body.innerHTML = html;

      const reader = new Readability(articleDiv as unknown as Document);
      const article = reader.parse();

      const textHtml = (article?.content || '');

      setArticle(textHtml);
    }
  }

  return (
    <div className={block(showMenu ? 'ShowMenu' : null)}>
      <div className={elem('LeftSide')}>
        <div className={elem('MenuGroup')}>
          <StoreComponent />
        </div>
        <div className={elem('MenuGroup')}>
          <AppearanceConfig Appearance={appearance} onChanged={forceUpdate}/>
        </div>
        <div className={elem('MenuGroup')}>
          <input ref={urlInput} defaultValue='http://www.hpmor.com/chapter/1' /><button onClick={onReadButtonClick}>Read</button>
        </div>
      </div>
      <div className={elem('RightSide')}>
        <button className={elem('MenuButton')} onClick={() => setShowMenu(!showMenu)}><Icon icon={ showMenu ? faTimes : faBars } /></button>
        <div className={elem('Scroll')}>{ article ? <RichText Text={article} Appearance={appearance} /> : null }</div>
      </div>
    </div>
  );
}

const { block, elem } = BEM(nameof(App));
