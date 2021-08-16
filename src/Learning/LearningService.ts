import _ from "lodash";
import { IDictionaryRecord } from "../Store/IDictionaryRecord";
import { Store } from "../Store";

function normal(mu: number = 0, sigma: number = 1, nsamples: number = 6){
  var run_total = 0;

  for(var i = 0 ; i < nsamples ; i++){
     run_total += Math.random();
  }

  return sigma * (run_total - nsamples / 2) / (nsamples / 2) + mu;
}

function positiveNormal(mu: number = 0, sigma: number = 1, nsamples: number = 6) {
  while(true) {
    const result = normal(mu, sigma, nsamples);

    if (result > 0) {
      return result;
    }
  }
}

class _LearningService {
  GetNextWord() {
    let dict = Store.Get().SharedState.Dictionary.filter(r => r.Translations?.some(() => true));

    dict = _(dict).shuffle().orderBy(r => r.Learning?.Points || 0).value();

    const nextIndex = Math.ceil(positiveNormal(0, dict.length));

    return dict[nextIndex];
  }

  UpdateRecord(record: IDictionaryRecord, status: 'right' | 'wrong') {
    if (!record.Learning) {
      record.Learning = {
        Points: 0,
        LastRepeat: new Date()
      }
    }

    record.Learning.Points = record.Learning.Points + Math.max(status === 'right' ? 1 : -1, 0);
    record.Learning.LastRepeat = new Date();

    Store.Set({}); // TODO: remove hack
  }
}

export const LearningService = new _LearningService();
