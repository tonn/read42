import { faArrowAltCircleUp, faBars, faExpand, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Readability } from '@mozilla/readability';
import Axios from 'axios';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import './App.scss';
import { AppearanceConfig, IAppearance } from './AppearanceConfig';
import { BEM, DebounceFn, GetIndicator, Indicator, timeout$ } from './Helpers';
import { RichText } from './RichText';
import * as serviceWorker from './serviceWorkerRegistration';
import { PWAUpdateAvailable } from './serviceWorkerRegistration';
import { Store } from './Store';
import { StoreComponent } from './Store.Component';

export const App: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [ newAppVersionAvailable, setNewAppVersionAvailable ] = useState<boolean>(false);
  const [ article, setArticle ] = useState<string>();
  const [ showMenu, setShowMenu ] = useState<boolean>(false);
  const [ appearance ] = useState<IAppearance>(Store.ShareState.Appearance);
  const urlInput = useRef<HTMLInputElement>(null);
  const scrollElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { LastSource: lastSource } = Store.Get();

    if (lastSource?.Raw) {
      openRawHtml(lastSource.Raw);
    }

    const subscription = PWAUpdateAvailable.subscribe(() => {
      setNewAppVersionAvailable(true);
    })

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function openUrl(url: string) {
    return GetIndicator().Wrap$(async () => {
      let { SharedState: shared, LastSource: lastSource } = Store.Get();

      let sharedSource = shared.Sources.find(s => s.Url === url);

      if (!sharedSource) {
        sharedSource = {
          Url: url,
          Position: 0,
          Date: new Date()
        }

        shared.Sources.push(sharedSource);
      } else {
        sharedSource.Date = new Date();
      }

      if (lastSource?.Url === url) {
        lastSource.Position = sharedSource.Position;
        lastSource.Date = sharedSource.Date;
      } else {
        const throughCORSUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        const html = (await Axios.get(throughCORSUrl)).data as string;

        lastSource = { ...sharedSource, Raw: html };
      }

      Store.Set({ SharedState: shared, LastSource: lastSource });

      openRawHtml(lastSource.Raw);
    });
  }

  async function openRawHtml(html: string) {
    return GetIndicator().Wrap$(async () => {
      const articleDiv = document.implementation.createHTMLDocument('innerArticleDocument');
      articleDiv.body.innerHTML = html;

      const reader = new Readability(articleDiv as unknown as Document);
      const article = reader.parse();

      const textHtml = (article?.content || '');

      setArticle(textHtml);

      await timeout$();

      const lastSource = Store.Get().LastSource;

      if (scrollElement.current && lastSource) {
        scrollElement.current.scrollTop = scrollElement.current.scrollHeight * lastSource.Position;
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
    const { LastSource: source, SharedState: shared } = Store.Get();

    if (source) {
      source.Position = scrollElement.current!.scrollTop / scrollElement.current!.scrollHeight;
      source.Date = new Date();


      const sharedSource = shared.Sources.find(s => s.Url === source.Url);

      if (sharedSource) {
        sharedSource.Position = source.Position;
        sharedSource.Date = source.Date;
      }

      Store.Set({ LastSource: source, SharedState: shared });
    }
  }, 1000));

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  async function forcePWAUpdate() {
    await serviceWorker.unregister();
    window.location.reload();
  }

  return (<>
    <div className={block()}>
      <div className={elem('Scroll')} onScroll={onTextScroll.current} ref={scrollElement}>{ article ? <RichText Text={article} Appearance={appearance} /> : null }</div>

      <div className={elem('Menu', showMenu ? 'Opened' : undefined)}>
        <div className={elem('MenuGroup')}>
          <input ref={urlInput} defaultValue='http://www.hpmor.com/chapter/1' /><button onClick={onReadButtonClick}>Read</button>
        </div>
        <div className={elem('MenuGroup')}>
          <StoreComponent  OnSourceClick={source => openUrl(source.Url)}/>
        </div>
        <div className={elem('MenuGroup')}>
          <AppearanceConfig Appearance={appearance} onChanged={forceUpdate}/>
        </div>
      </div>

      <div className={elem('Buttons')}>
        <button className={elem('Button')} onClick={() => setShowMenu(!showMenu)}><Icon icon={ showMenu ? faTimes : faBars } /></button>
        <button className={elem('Button')} onClick={toggleFullscreen}><Icon icon={faExpand} /></button>
        { newAppVersionAvailable ? <button className={elem('Button', 'Update')} onClick={forcePWAUpdate}><Icon icon={faArrowAltCircleUp} /><br/>App update</button> : null }
      </div>
    </div>

    <Indicator Main={true} />
  </>);
}

const { block, elem } = BEM(nameof(App));
