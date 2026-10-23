import test from 'node:test';
import assert from 'node:assert/strict';
import {rank,embedTexts,MODEL} from './semantic.mjs';
import {mkdtemp,copyFile,symlink,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

test('real local MiniLM ranks meaning, not shared keywords', async () => {
  const records = [
    {path:'gear.wav',description:'Clockwork gears click inside a metal robot'},
    {path:'forest.svg',description:'A green forest tree and leaves'},
    {path:'coast.wav',description:'Waves crash against rocks on a windy beach'},
  ];
  const result = await rank('sound of the ocean', records);
  assert.equal(result[0].path, 'coast.wav');
  assert.ok(result[0].score > 0.3);
  assert.ok(result[0].score > result[1].score + 0.1);
  console.log(JSON.stringify({model:MODEL.id,revision:MODEL.revision,result},null,2));
});
test('embeddings have actual expected shape and normalization', async () => {
  const [vector] = await embedTexts(['A bright yellow star']);
  assert.equal(vector.length,384);
  assert.ok(Math.abs(vector.reduce((s,v)=>s+v*v,0)-1)<0.0001);
});
test('empty input and validation', async () => {
  assert.deepEqual(await embedTexts([]),[]);
  await assert.rejects(()=>rank('',[]));
  await assert.rejects(()=>embedTexts([null]));
});
test('a missing local model fails rather than fabricating or fetching results', async () => {
  const temp=await mkdtemp(join(tmpdir(),'asset-model-negative-'));
  try {
    await copyFile(new URL('./semantic.mjs',import.meta.url),join(temp,'semantic.mjs'));
    await symlink(new URL('./node_modules',import.meta.url).pathname,join(temp,'node_modules'),'dir');
    const script=`import {rank} from './semantic.mjs'; try { await rank('wounded player',[{path:'vial.svg',description:'A healing potion'}]); process.exit(2); } catch(e) { if(!e.message.includes('No substitute results') || !String(e.cause).includes('file was not found locally')) { console.error(e); process.exit(3); } }`;
    const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:temp,encoding:'utf8',timeout:15000});
    assert.equal(result.status,0,result.stderr);
  } finally { await rm(temp,{recursive:true,force:true}); }
});

test('shipped sample retrieves a restorative item from a wounded-player query', async () => {
  const {demo}=await import('./demo.mjs');
  const result=await rank('Something to help a wounded player',demo().index.assets);
  assert.equal(result[0].path,'sprites/item_04.svg');
  assert.ok(result[0].score>result[1].score);
});
