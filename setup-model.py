"""Prepare pinned public model/runtime assets. No user files are read or uploaded."""
import hashlib
import json
from pathlib import Path
import shutil
import urllib.request

ROOT = Path(__file__).resolve().parent
REVISION = '751bff37182d3f1213fa05d7196b954e230abad9'
MODEL = ROOT / 'models' / 'all-MiniLM-L6-v2'
VENDOR = ROOT / 'vendor'
DIST = ROOT / 'node_modules' / '@huggingface' / 'transformers' / 'dist'

def download(url, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        print('Downloading', target.relative_to(ROOT), flush=True)
        with urllib.request.urlopen(url, timeout=120) as response:
            temporary = target.with_suffix(target.suffix + '.partial')
            with temporary.open('wb') as output:
                shutil.copyfileobj(response, output)
            temporary.replace(target)

def main():
    if not DIST.exists():
        raise SystemExit('First run: npm ci --ignore-scripts')
    VENDOR.mkdir(exist_ok=True)
    for name in ['transformers.min.js', 'ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm']:
        shutil.copyfile(DIST / name, VENDOR / name)
    shutil.copyfile(DIST.parent / 'LICENSE', VENDOR / 'TRANSFORMERS-LICENSE')
    download('https://raw.githubusercontent.com/microsoft/onnxruntime/v1.21.0/LICENSE', VENDOR / 'ONNX-LICENSE')
    for name in ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'special_tokens_map.json', 'onnx/model_quantized.onnx']:
        download(f'https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/{REVISION}/{name}', MODEL / name)
    download('https://www.apache.org/licenses/LICENSE-2.0.txt', MODEL / 'LICENSE')
    download(f'https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/{REVISION}/README.md', MODEL / 'MODEL-CARD.md')
    manifest = {'model':'Xenova/all-MiniLM-L6-v2', 'revision':REVISION, 'license':'Apache-2.0', 'transformers':'3.8.1', 'sha256':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for folder in [MODEL,VENDOR] for p in folder.rglob('*') if p.is_file() and not p.name.endswith('.partial')}}
    manifest_path = ROOT / 'model-manifest.json'
    if manifest_path.exists():
        expected = json.loads(manifest_path.read_text())
        for filename, digest in expected.get('sha256', {}).items():
            # Ignore obsolete prepared files no longer used by the app.
            if filename.endswith('transformers.web.min.js'):
                continue
            actual = manifest['sha256'].get(filename)
            if actual != digest:
                raise SystemExit(f'Integrity mismatch for {filename}; setup stopped. Restore the pinned asset before continuing.')
        print('Prepared assets match the saved SHA-256 manifest.')
    else:
        manifest_path.write_text(json.dumps(manifest, indent=2)+'\n')
    print('Local model and runtime ready; inference needs no external network.')

if __name__ == '__main__':
    main()
