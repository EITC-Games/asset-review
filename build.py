"""Create an explicit static publication bundle. No user content or parent files."""
from pathlib import Path
import shutil
import hashlib
import json
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
APP = ['index.html','style.css','app.mjs','analyze.mjs','demo.mjs','semantic.mjs']
RUNTIME = ['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm','TRANSFORMERS-LICENSE','ONNX-LICENSE']
MODEL = ['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_quantized.onnx','LICENSE','MODEL-CARD.md']
FILES = APP + ['vendor/'+p for p in RUNTIME] + ['models/all-MiniLM-L6-v2/'+p for p in MODEL]
def main():
    OUT.mkdir(exist_ok=True)
    existing=[p.relative_to(OUT).as_posix() for p in OUT.rglob('*') if p.is_file()]
    unexpected=set(existing)-set(FILES)
    if unexpected:
        raise SystemExit(f'Unexpected dist files: {unexpected}; review before publishing.')
    manifest=[]
    for name in FILES:
        src=ROOT/name; dest=OUT/name
        if not src.is_file(): raise SystemExit(f'Missing {name}; run setup-model.py first.')
        dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(src,dest)
        manifest.append({'path':name,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
    (ROOT/'dist-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Built {len(FILES)} allowlisted files, {sum(x["bytes"] for x in manifest):,} bytes in dist/')
if __name__=='__main__':main()
