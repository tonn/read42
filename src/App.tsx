import { faBars, faExpand, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Readability } from '@mozilla/readability';
import Axios from 'axios';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import './App.scss';
import { AppearanceConfig, IAppearance } from './AppearanceConfig';
import { BEM, DebounceFn, timeout$ } from './Helpers';
import { RichText } from './RichText';
import { Store } from './Store';
import { StoreComponent } from './Store.Component';

export const App: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [ article, setArticle ] = useState<string>();
  const [ showMenu, setShowMenu ] = useState<boolean>(false);
  const [ appearance ] = useState<IAppearance>(Store.ShareState.Appearance);
  const urlInput = useRef<HTMLInputElement>(null);
  const scrollElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Store.LocalState.LastSource?.Raw) {
      openRawHtml(Store.LocalState.LastSource.Raw);
    }
  }, []);

  async function openUrl(url: string) {
    let sharedSource = Store.ShareState.Sources.find(s => s.Url === url);

    if (!sharedSource) {
      sharedSource = {
        Url: url,
        Position: 0,
        Date: new Date()
      }
      Store.ShareState.Sources.push(sharedSource);
    } else {
      sharedSource.Date = new Date();
    }

    if (Store.LocalState.LastSource?.Url === url) {
      Store.LocalState.LastSource.Position = sharedSource.Position;
      Store.LocalState.LastSource.Date = sharedSource.Date;
    } else {
      const throughCORSUrl = `https://cors-anywhere.herokuapp.com/${url}`;

      const html = (await Axios.get(throughCORSUrl)).data as string;

      Store.LocalState.LastSource = { ...sharedSource, Raw: html };
    }

    Store.SaveLocalState();

    openRawHtml(Store.LocalState.LastSource.Raw);
  }

  function openRawHtml(html: string) {
    const articleDiv = document.implementation.createHTMLDocument('innerArticleDocument');
    articleDiv.body.innerHTML = html;

    const reader = new Readability(articleDiv as unknown as Document);
    const article = reader.parse();

    const textHtml = (article?.content || '');

    setArticle(textHtml);

    timeout$().then(() => {
      if (scrollElement.current && Store.LocalState.LastSource) {
        scrollElement.current.scrollTop = scrollElement.current.scrollHeight * Store.LocalState.LastSource.Position;
      }
    });
  }

  async function onReadButtonClick() {
    const originalUrl = urlInput.current?.value;

    if (originalUrl) {
      openUrl(originalUrl);
    }
  }

  const onTextScroll = useRef(DebounceFn(() => {
    if (Store.LocalState.LastSource) {
      const source = Store.LocalState.LastSource;

      source.Position = scrollElement.current!.scrollTop / scrollElement.current!.scrollHeight;
      source.Date = new Date();
      Store.SaveLocalState();

      const sharedSource = Store.ShareState.Sources.find(s => s.Url === source.Url);
      if (sharedSource) {
        sharedSource.Position = source.Position;
        sharedSource.Date = source.Date;
      }
    }
  }, 1000));

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }


  return (
    <div className={block(showMenu ? 'ShowMenu' : null)}>
      <div className={elem('LeftSide')}>
        <div className={elem('MenuGroup')}>
          <StoreComponent  OnSourceClick={source => openUrl(source.Url)}/>
        </div>
        <div className={elem('MenuGroup')}>
          <AppearanceConfig Appearance={appearance} onChanged={forceUpdate}/>
        </div>
        <div className={elem('MenuGroup')}>
          <input ref={urlInput} defaultValue='http://www.hpmor.com/chapter/1' /><button onClick={onReadButtonClick}>Read</button>
        </div>
      </div>
      <div className={elem('RightSide')}>
        <div className={elem('Buttons')}>
          <button className={elem('Button')} onClick={() => setShowMenu(!showMenu)}><Icon icon={ showMenu ? faTimes : faBars } /></button>
          <button className={elem('Button')} onClick={toggleFullscreen}><Icon icon={faExpand} /></button>
        </div>

        <div className={elem('Scroll')} onScroll={onTextScroll.current} ref={scrollElement}>{ article ? <RichText Text={article} Appearance={appearance} /> : null }</div>
      </div>
    </div>
  );
}

const { block, elem } = BEM(nameof(App));
