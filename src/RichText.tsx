import React from 'react';
import nameof from 'ts-nameof.macro';
import { IAppearance } from './AppearanceConfig';
import { BEM } from './Helpers';

export const RichText: React.FC<{ Text: string, Appearance: IAppearance }> = (props) => {
    const { Appearance } = props;

    function onDoubleClick() {
      // if (document.fullscreenElement) {
      //   document.exitFullscreen();
      // } else {
      //   document.body.requestFullscreen();
      // }
    }

    return (<>
        <style>
            .{block()} {`{`}
                font-family: {Appearance.fontFamily};
                font-size: {Appearance.fontSize}vw;
                color: {Appearance.color};
                background: {Appearance.background};
                line-height: {Appearance.lineHeight};
                padding: {Appearance.padding.map(p => `${p}vw`).join(' ')};
            {`}`}
        </style>
        <div className={block()} onDoubleClick={onDoubleClick} dangerouslySetInnerHTML={{ __html: props.Text }}></div>
    </>
    );
}

const { block, /*elem*/ } = BEM(nameof(RichText));
