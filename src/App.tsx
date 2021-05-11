import { faArrowAltCircleUp, faBars, faCogs, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Readability } from '@mozilla/readability';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import './App.scss';
import { AppearanceConfig, DefaultAppearance, IAppearance } from './Appearance';
import { AppLayout, AppLayoutRef, ToolBarButton } from './AppLayout';
import { DictionaryPage } from './DictionaryPage';
import { BEM, DebounceFn, GetIndicator, Indicator, timeout$ } from './Helpers';
import { RichText } from './RichText';
import * as serviceWorker from './serviceWorkerRegistration';
import { PWAUpdateAvailable } from './serviceWorkerRegistration';
import { Store } from './Store';
import { StoreComponent } from './Store.Component';

type PageType = 'read' | 'dict';

export const App: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [ newAppVersionAvailable, setNewAppVersionAvailable ] = useState<boolean>(false);
  const [ article, setArticle ] = useState<string>();
  const [ appearance ] = useState<IAppearance>(DefaultAppearance);
  const [ appPage, setAppPage ] = useState<PageType>('dict');
  const [ sidePanelContent, setSidePanelContent ] = useState<{ render: () => React.ReactNode }>();
  const urlInput = useRef<HTMLInputElement>(null);
  const scrollElement = useRef<HTMLDivElement>(null);
  const appLayout = useRef<AppLayoutRef>(null);

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
        const html = (await Store.CORSProxy(url)).data as string;

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

  function openPage(pageName: PageType) {
    setAppPage(pageName);
    appLayout.current?.hideSidePanel();
  }

  function getToolbarButtons() {
    const result: ToolBarButton[] = [{
      Icon: faBars,
      OpenSidePanel: true,
      OnClick: () => {
        const renderer = { render: () => <>
          <div className={elem('MenuNavigationItem', appPage === 'read' ? 'Active' : undefined)} onClick={() => openPage('read')}>Reading</div>
          <div className={elem('MenuNavigationItem', appPage === 'dict' ? 'Active' : undefined)} onClick={() => openPage('dict')}>Dictionary</div>

          <div className={elem('MenuGroup')}>
            <input ref={urlInput} defaultValue='http://www.hpmor.com/chapter/1' /><button onClick={onReadButtonClick}>Read</button>
          </div>
        </> };

        setSidePanelContent(renderer);
      }
    }, {
      Icon: faCogs,
      OpenSidePanel: true,
      OnClick: () => setSidePanelContent({ render: () => <>
        <div className={elem('MenuGroup')}>
          <StoreComponent OnSourceClick={source => openUrl(source.Url)} />
        </div>
        <div className={elem('MenuGroup')}>
          <AppearanceConfig Appearance={appearance} onChanged={forceUpdate} />
        </div>
      </>})
    }, {
      Icon: faExpand,
      OnClick: toggleFullscreen
    }];

    if (newAppVersionAvailable) {
      result.push({
        Icon: faArrowAltCircleUp,
        OnClick: forcePWAUpdate
      });
    }

    return result;
  }

  return (<>
    <div className={block()}>
      <AppLayout ToolBarButtons={getToolbarButtons()} SidePanelChildren={sidePanelContent?.render()} ref={appLayout}>
        <div className={elem('Scroll')} onScroll={onTextScroll.current} ref={scrollElement}>
          { (appPage === 'read' && article) ? <RichText Text={article} Appearance={appearance} /> :
            appPage === 'dict' ? <DictionaryPage /> : null }
        </div>
      </AppLayout>
    </div>

    <Indicator Main={true} />
  </>);
}

const { block, elem } = BEM(nameof(App));
