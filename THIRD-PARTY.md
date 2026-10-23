# Third-party components

Original application source: MIT; see LICENSE.

- Xenova/all-MiniLM-L6-v2: Apache-2.0, model revision `751bff37182d3f1213fa05d7196b954e230abad9`. https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Hugging Face Transformers.js 3.8.1: Apache-2.0. https://github.com/huggingface/transformers.js
- ONNX Runtime: MIT. https://github.com/microsoft/onnxruntime

`package-lock.json` pins npm dependencies. `setup-model.py` downloads the fixed model revision, retains its model card and Apache license, and copies the installed Transformers.js runtime plus license. It also downloads the ONNX Runtime license. `model-manifest.json` checks prepared artifact SHA-256 hashes. Generated model weights and vendor bundles are deliberately not committed. First setup needs internet access; subsequent local inference does not call a remote inference API.

The model produces 384-dimensional normalized text embeddings, compared with cosine similarity. It does not inspect image pixels or sound. Scores are not confidence probabilities; long inputs are truncated and sparse metadata limits retrieval quality.
