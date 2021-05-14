export interface IDictionaryIntegration {
  GetWordInfo(word: string): Promise<string[]>;
}
