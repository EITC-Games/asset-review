// All inference runs locally. Model/runtime assets must be prepared before use.
export const MODEL = Object.freeze({id: 'Xenova/all-MiniLM-L6-v2', revision: '751bff37182d3f1213fa05d7196b954e230abad9', dimensions: 384, license: 'Apache-2.0'});
let extractorPromise;
export async function init(progress = () => {}) {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node);
      const {pipeline, env} = await import(isNode ? '@huggingface/transformers' : './vendor/transformers.min.js');
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.localModelPath = isNode ? decodeURIComponent(new URL('./models/', import.meta.url).pathname) : new URL('./models/', import.meta.url).href;
      env.useBrowserCache = false;
      env.backends.onnx.wasm.wasmPaths = new URL('./vendor/', import.meta.url).href;
      env.backends.onnx.wasm.numThreads = 1;
      return pipeline('feature-extraction', 'all-MiniLM-L6-v2', {device:isNode ? 'cpu' : 'wasm', dtype:'q8', local_files_only:true, progress_callback:progress});
    })().catch(error => { extractorPromise = undefined; throw new Error('Local AI model could not load. Run the model setup and retry. No substitute results were generated.', {cause:error}); });
  }
  return extractorPromise;
}
export async function embedTexts(texts) {
  if (!Array.isArray(texts) || texts.some(t => typeof t !== 'string')) throw new TypeError('Expected an array of text strings.');
  if (!texts.length) return [];
  const extractor = await init();
  const result = await extractor(texts, {pooling:'mean', normalize:true, truncation:true});
  return result.tolist();
}
export function cosine(a, b) { return a.reduce((sum, value, i) => sum + value * b[i], 0); }
export async function rank(query, records) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('Enter a search description.');
  if (!records.length) return [];
  const texts = records.map(r => [r.path || r.name || '', r.description || '', Array.isArray(r.tags) ? r.tags.join(' ') : ''].join(' ').slice(0, 4000));
  const vectors = await embedTexts([query.slice(0, 2000), ...texts]);
  return records.map((record, i) => ({...record, score:cosine(vectors[0], vectors[i+1])})).sort((a,b) => b.score-a.score);
}
