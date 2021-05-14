import Axios, { AxiosResponse } from 'axios';
import Merriam from 'mw-collegiate';
import _ from 'lodash';
import { IsEmptyOrWhitespaces } from '../Helpers/String.extension';

const ApiKeys = {
  Intermediate: '8455853d-046c-4aaf-8ae6-ecd78b7deb66', // Intermediate Dictionary
  Elementary: '5ee7a311-4a59-48b2-824a-b020fddbb46e' // Elementary Dictionary
}

function isSense(o: Merriam.Senses): o is Merriam.Sense {
  return o[0] === 'sense';
}

function isSenseObject(o: 'sense' | Merriam.SenseObject): o is Merriam.SenseObject {
  return !!(o as Merriam.SenseObject).dt;
}

function formatString(dt: string): string {
  return dt.replaceAll(/{.*}/g, '');
}

function normalizeWord(word: string): string {
  const result = /(a *|to *)(.*)/.exec(word);

  return result ? result[2] : word;
}

class _MerriamWebster {
  async GetWordInfo(word: string) {
    word = normalizeWord(word);

    const result = (await Axios({
      url: `https://www.dictionaryapi.com/api/v3/references/sd3/json/${word}?key=${ApiKeys.Intermediate}`
    }) as AxiosResponse<Merriam.Entry[]>).data;

    const shards: string[] = [];

    for (const entry of result) {
      shards.push(entry.hwi.hw);
      if (entry.fl) { shards.push(entry.fl); }

      for (const prs of entry.hwi.prs || []) {
        if (prs.mw) {
          shards.push(`[${prs.mw}]`);
        }
      }

      for (const defSection of entry.def || []) {
        for (const senses of defSection.sseq) {
          for (const sense of _.flattenDeep(senses)) {
            if (sense !== 'sense') {
              const variant = formatString(sense.dt[0][1]);

              if (!IsEmptyOrWhitespaces(variant)) {
                shards.push(variant);
              }
            }
          }
        }
      }
    }

    return shards;
  }
}

export const MerriamWebster = new _MerriamWebster();
