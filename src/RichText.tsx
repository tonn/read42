import React from 'react';
import nameof from 'ts-nameof.macro';
import { IAppearance } from './Appearance';
import { BEM } from './Helpers';

export const RichText: React.FC<{ Text: string, Appearance: IAppearance }> = (props) => {
    const { Appearance } = props;

    return (<>
        <style>
            .{block()} {`{`}
                font-family: {Appearance.FontFamily};
                font-size: {Appearance.FontSize}vw;
                color: {Appearance.Color};
                background: {Appearance.Background};
                line-height: {Appearance.LineHeight};
                padding: {Appearance.Padding.map(p => `${p}vw`).join(' ')};
            {`}`}
        </style>
        <div className={block()} dangerouslySetInnerHTML={{ __html: props.Text }}></div>
    </>);
}

const { block, /*elem*/ } = BEM(nameof(RichText));
