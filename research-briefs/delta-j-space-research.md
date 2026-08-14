# Delta‑J-Space Research — preliminary portfolio brief

## Project focus

Delta‑J-Space is a mechanistic-interpretability research toolkit for studying whether small language models maintain task-relevant content in a distributed internal workspace before they verbalize it. The project combines Jacobian-lens readout, sparse decomposition of residual-stream states, and causal interventions to turn qualitative “the model seems to know this” questions into targeted experiments.

## What I built

- A model registry and fitting pipeline optimized for the real cost of Jacobian-lens fitting: residual width, depth, vocabulary size, and GPU memory.
- A Jacobian-lens readout that maps an earlier layer's residual state into the model's output space, enabling token-rank queries across a layer band without materializing prohibitively large logits tensors.
- J-vectors: residual-space directions derived from the effective unembedding and the fitted layer Jacobian. These are used as interpretable atoms for sparse pursuit and as intervention directions.
- Sparse workspace decoding, including gradient pursuit over vocabulary-derived directions.
- Causal intervention tools for adding, suppressing, or swapping candidate content directions in the residual stream.
- A structured experiment harness and datasets for selectivity, probe-swap, verbal-report, top-down summoning, ignition, broadcast contrast, capacity, and related workspace hypotheses.

## Research questions

The project asks whether internally represented content can be:

1. read out before it appears in the generated answer;
2. distinguished from superficial lexical association by matched controls;
3. localized as a distributed layer/position band rather than a single neuron or logit;
4. causally manipulated so that interventions change the predicted or reported content; and
5. tracked across tasks where an answer must be held silently, selected, swapped, or reported later.

The experiment library includes controlled prompt sets for semantic categories, language identification, verbal introspection, and interference-style probe swaps. It also contains automatic and explicit question variants, allowing the project to compare latent content readout against observable task performance.

## Current status and preliminary interpretation

Delta‑J-Space is primarily an experimental platform and research program rather than a completed benchmark with a single headline score. The codebase contains the core lens, readout, sparse-pursuit, and intervention machinery together with pre-specified experiment datasets and test coverage. This is important because the central claims are intended to be causal: evidence should come from readout controls and targeted residual interventions, not just a correlational probe.

The next research deliverable is to run the suite across the selected small open models, compare Jacobian-lens readout against ordinary logit-lens controls, quantify selectivity and capacity, and report whether candidate workspace content predicts and causally affects later outputs. The design deliberately begins with smaller deep-and-narrow models because they make layer-band structure observable while keeping Jacobian fitting feasible on a single consumer GPU.

## Where to find the underlying work

- `delta-j-space/pyproject.toml` — project scope and dependencies.
- `deltaj/models.py` — model registry and resource-aware fitting strategy.
- `deltaj/readout.py` — efficient cross-layer Jacobian-lens readout.
- `deltaj/jvectors.py` — construction and use of residual-space J-vectors.
- `deltaj/pursuit.py` and `deltaj/interventions.py` — sparse decomposition and causal interventions.
- `deltaj/experiments/` — experiment harnesses for selectivity, probe swapping, verbal report, directed modulation, capacity, and broadcast tests.
- `deltaj/data/experiments/` — controlled task datasets and prompt templates.
