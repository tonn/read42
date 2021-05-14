// https://developers.lingvolive.com/ru-ru/Help

import { IDictionaryIntegration } from "./DictionaryIntegration";
import { once } from "lodash-decorators/once";
import { treeSearch } from "../Helpers";
import { IsEmptyOrWhitespaces } from "../Helpers/String.extension";
import { Store } from "../Store";

const apiKey = 'NmE3YTZmNTYtODk0Yy00NWFkLThjZjItNzJjMjU4NWJjYmZmOjMzNGM0MTZhZTFiNzRiMTA5YzQ4ZGNiNzg2N2Q2YWMy';
const srcLang = 1033; // en
const dstLang = 1049; // ru

interface ArticleNode {
  Node: 'Comment' | 'Paragraph' | 'Text' | 'List' | 'ListItem' | 'Examples' | 'ExampleItem'
      | 'Example'	| 'CardRefs' | 'CardRefItem' | 'CardRef' | 'Transcription' | 'Abbrev'
      | 'Caption'	| 'Sound' | 'Ref' | 'Unsupported';
  Text: string
  Markup?: ArticleNode[];
  Items?: ArticleNode[];
}

interface ArticleModel {
  Title: string;
  Body: ArticleNode;
}

function normalizeWord(word: string): string {
  const result = /(a +|to +)(.*)/.exec(word);

  return result ? result[2] : word;
}

class _LingvoOnline implements IDictionaryIntegration {
  @once
  async Authorize(): Promise<string> {
    const url = 'https://developers.lingvolive.com/api/v1.1/authenticate';

    return (await Store.CORSProxy(url, { Proxy_Authorization: `basic ${apiKey}` }, 'POST')).data;
  }

  async GetWordInfo(word: string): Promise<string[]> {
    word = normalizeWord(word);

    const token = await this.Authorize();

    const url = `https://developers.lingvolive.com/api/v1/Translation?text=${word}&srcLang=${srcLang}&dstLang=${dstLang}&isCaseSensitive=false`;

    const response = (await Store.CORSProxy(url, { Proxy_Authorization: `bearer ${token}` })).data as ArticleModel[];

    const shards: string[] = [ '<b>Lingvo Online</b>' ];

    for (const articleModel of response) {
      shards.push(`<b>${articleModel.Title}</b>`);

      treeSearch<ArticleNode>(articleModel.Body,
        node => {
          return [...node.Items || [], ...node.Markup || []]
        },
        node => {
          if (!IsEmptyOrWhitespaces(node.Text) && node.Text.length > 3) {
            if (node.Node === 'Transcription') {
              shards.push(`[${node.Text}]`);
            } else if (node.Node === 'Text') {
              shards.push(node.Text);
            }
          }

          return false;
        });
    }

    return shards;
  }
}

export const LingvoOnline = new _LingvoOnline();
