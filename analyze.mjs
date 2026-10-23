export const LIMITS={files:250,bytes:25*1024*1024};
export function canonical(path){return path.replaceAll('\\','/').replace(/^\.\//,'');}
export function validateIndex(value){
 if(!value||typeof value!=='object'||!Array.isArray(value.assets))throw new Error('asset-index.json must contain an assets array.');
 if(value.assets.length>LIMITS.files)throw new Error('The index has too many records. Maximum: 250.');
 const seen=new Set();
 return value.assets.map((a,i)=>{if(!a||typeof a.path!=='string'||!a.path.trim())throw new Error(`Record ${i+1} needs a path.`);const path=canonical(a.path);if(path.startsWith('/')||/^[a-zA-Z]:/.test(path)||path.includes('\0')||path.split('/').includes('..'))throw new Error(`Unsafe record path: ${path}`);if(seen.has(path))throw new Error(`Repeated index path: ${path}`);seen.add(path);for(const k of ['description','creator','license','source'])if(a[k]!=null&&typeof a[k]!=='string')throw new Error(`${path}: ${k} must be text.`);if(a.references!=null&&(!Array.isArray(a.references)||!a.references.every(x=>typeof x==='string')))throw new Error(`${path}: references must be text paths.`);return {...a,path};});
}
export async function inspect(files,index){
 if(files.length>LIMITS.files)throw new Error('Choose 250 files or fewer.');
 const total=files.reduce((n,f)=>n+f.size,0);if(total>LIMITS.bytes)throw new Error('Choose a folder smaller than 25 MB.');
 const records=validateIndex(index),paths=new Set(files.map(f=>f.path));const byPath=new Map(records.map(x=>[x.path,x]));const findings=[];const add=(severity,kind,path,message)=>findings.push({severity,kind,path,message});
 const groups=new Map(),casePaths=new Map();
 const assets=[];
 for(const file of files){
  if(file.path==='asset-index.json')continue;
  const record=byPath.get(file.path);const asset={path:file.path,size:file.size,description:record?.description||'',creator:record?.creator||'',license:record?.license||'',source:record?.source||''};assets.push(asset);
  if(!record)add('review','metadata',file.path,'No asset-index.json record. Add a description and provenance fields.');
  else{const missing=['creator','license','source'].filter(k=>!record[k]?.trim());if(missing.length)add('review','metadata',file.path,`Missing recorded ${missing.join(', ')}. Verify the source and required credit yourself.`);}
  if(file.size===0)add('warning','empty',file.path,'Empty file; confirm this belongs in the release.');
  if(/(^|\/)(\.DS_Store|Thumbs\.db|\.env(?:\..*)?)$|\.(bak|tmp)$/i.test(file.path))add('warning','packaging',file.path,'Possible local-only or temporary file. Review before sharing.');
  const lower=file.path.toLowerCase();if(casePaths.has(lower))add('warning','case',file.path,`Case-only path collision with ${casePaths.get(lower)}; some filesystems cannot distinguish them.`);else casePaths.set(lower,file.path);
  const bytes=await file.arrayBuffer();const digest=Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(!groups.has(digest))groups.set(digest,[]);groups.get(digest).push(file.path);
 }
 for(const record of records){if(!paths.has(record.path))add('warning','missing',record.path,'Indexed asset is not present in the selected folder.');for(const ref of record.references||[]){const p=canonical(ref);if(!paths.has(p))add('warning','reference',record.path,`Declared reference not found: ${p}`);}}
 for(const group of groups.values())if(group.length>1)add('review','duplicate',group[0],`Identical file bytes: ${group.join(' · ')}. Duplication may be intentional.`);
 return {version:1,files:assets.length,totalBytes:total,assets,findings,scope:'SHA-256 duplicates, empty/temp files, case collisions, index records and declared references only. Not legal clearance or a complete dependency scan.'};
}
