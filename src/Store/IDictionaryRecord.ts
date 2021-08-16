import { IDictionaryRecordLearning } from './IDictionaryRecordLearning';

export interface IDictionaryRecord {
  BaseWord: string;
  Transcription?: string;
  Translations?: string[];
  Tags?: string[];
  Learning?: IDictionaryRecordLearning;
}
