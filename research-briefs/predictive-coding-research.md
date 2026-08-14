# Predictive Coding Research — preliminary portfolio brief

## Project focus

I built and compared several hierarchical predictive-coding systems to test a basic question: can a higher-level state summarize longer-term structure and *usefully* improve a lower-level sequence model? The results so far are primarily negative. The work did produce useful tools, controls, and diagnoses, but it has not yet shown that an upper predictive state provides a robust downstream benefit beyond a strong local sequence model.

The project began with synthetic speech and symbolic controls, then moved to byte-level text. I treated representation stability, causal feedback, and parallelizable state updates as separate experimental problems rather than assuming that a lower prediction loss proved a useful hierarchy.

## What I built

- An end-to-end audio-oriented hierarchy with discrete and continuous L1 representations, exact synthetic speech alignments, diagnostics, and evaluation tooling.
- An oracle phone/word control that isolates hierarchical optimization from acoustic discovery. L1 predicts phones and exposes word-end latents; L2 predicts future word latents.
- A byte/word hierarchy built around a frozen causal byte Transformer and an L2 model that receives only completed-word representations.
- Alternatives to explicit word segmentation, including a gated fast/slow scan and causal linear attention, designed to be scan/chunk parallel.
- A faithful adaptation of Jiang and Rao-style dynamic predictive coding, evaluated against the parallel scan models.

## Methodology

To make failures interpretable, I built a sequence of increasingly controlled tests rather than relying on one end-to-end system.

- **Synthetic acoustic and oracle controls:** exact phone and word alignment separates acoustic-discovery questions from hierarchical optimization. The oracle version gives L1 ground-truth phone sequences and tests whether L2 can form and predict continuous word-end states.
- **Moving-target ablations:** naïve joint training, frozen targets, EMA teachers, trust penalties, and slower lower-level learning isolate the instability created when L1 is both learning and supplying L2's targets.
- **Objective and interface controls:** direct latent regression is compared with rotation-invariant relative-geometry losses. Calibration-only and streaming Procrustes alignment test whether a poor coordinate metric reflects missing information or merely a changing latent basis.
- **Causal feedback ablations:** an L2 prediction is routed only after a completed word and only to the following word's lower-level predictions. Feedback-on, feedback-off, and frozen-controller variants distinguish a genuine top-down gain from co-adaptation or overfitting.
- **Byte-level and boundary-free systems:** a frozen byte Transformer provides a strong local baseline. Explicit completed spans, gated fast/slow scans, linear attention, shuffled-state controls, state-rank diagnostics, delimiter-update statistics, and throughput measurements test whether a proposed upper state is both useful and computationally viable.
- **Reference-model comparison:** a faithful adaptation of Jiang and Rao dynamic predictive coding tests whether explicit iterative state inference offers a better route than one-pass, scan-parallel alternatives.

## Results and difficulties

### Moving targets can be stabilized, but stability did not create useful hierarchy

In the oracle control, an EMA target teacher was the most reliable co-adaptive stabilization method. In a longer matched run it reduced target drift by about 90% relative to naïve joint training while slightly improving persistence-normalized L2 prediction skill. Freezing L1 was useful as a zero-drift control, but it prevents lower-level adaptation. Slowing L1 or adding a trust penalty improved selected metrics but did not match EMA's overall skill/drift tradeoff.

This is a methodological success, not evidence that predictive coding solved the main problem. Training stabilized, but late training did not monotonically improve the representation and the resulting upper state did not produce a reliable lower-level benefit.

### Coordinate-free objectives exposed a measurement problem, not a performance win

I compared direct latent regression with a rotation-invariant relative-geometry loss. Raw coordinate metrics initially made the geometry model look much worse. After fitting a Procrustes alignment on separate calibration data, its one-word prediction skill was close to pointwise prediction, showing that much of the apparent deficit was a rotating coordinate system rather than lost predictive information. A streaming Procrustes interface reduced cross-checkpoint representation drift by roughly 85–87% and preserved a fixed downstream decoder.

However, geometry did not beat direct pointwise prediction, and a momentum-queue variant did not earn its added complexity. The main difficulty was that an invariant objective can learn a representation in a valid but moving coordinate system; a coordinate-bound downstream consumer then fails unless an explicit interface is maintained.

### The central negative result: top-down feedback did not improve the lower level

The causal L2-to-L1 feedback controller did not deliver a durable next-phone benefit in the synthetic grammar. It learned non-generalizing lexical corrections: a frozen-controller check found, at most, a tiny calibration improvement and no useful signal at the causally important first phone of the next word.

This identifies a core experimental difficulty. The synthetic language made abstract category transitions predictable, but made exact next-word identity mostly uncertain; meanwhile, the lower-level model already captured much of the available category signal. The hierarchy could organize or forecast a representation without containing information that L1 genuinely needed. A stronger feedback test needs persistent latent state that predicts information unavailable to local lower-level context.

### Boundary-free memories formed structured state, but their feedback was still imperfect

On the byte hierarchy, explicit completed-word spans gave the largest raw cross-entropy gain, but much of that gain survived state shuffling. The boundary-free gated scan and linear-attention memories had smaller raw gains but much stronger dependence on the correct high-level state, learned stronger updates at delimiters without boundary labels, and remained highly parallelizable. The gated scan was the better of the two.

Neither approach solved the downstream-control problem. Both helped early characters of a word but became harmful after enough local evidence accumulated, motivating a locally conditioned feedback gate. The key challenge is to make high-level context defer to increasingly informative local evidence rather than apply a fixed-strength prior.

### Literal dynamic predictive coding was not the right computational tradeoff

The Jiang–Rao adaptation produced a slow, non-collapsed upper state and stronger boundary-sensitive updates, but it did not carry useful word-scale content or improve broad held-out byte prediction. It was also about 43 times slower than the one-scan alternative because of sequential inner activity inference. This redirected the project toward amortized, parallel state updates that retain the useful “state selects dynamics” idea without the expensive inference loop.

## Overall interpretation

These are mechanistic controls and research prototypes, not claims of discovered phonemes from raw audio or a production-ready hierarchical language model. The strongest current contributions are the carefully controlled negative results: stabilizing moving targets is possible but insufficient; coordinate-invariant prediction requires an interface; causal top-down feedback did not yet improve L1; and literal iterative inference is too slow without delivering useful higher-level content.

The work narrows the design space for future hierarchical systems. The next version should use a task with persistent latent state, preserve parallelizable updates, evaluate state-specific contribution with shuffle controls, and give feedback a local confidence mechanism that can yield to evidence from the observed prefix.

## Where to find the underlying work

- `research-playground/predictive-coding-implementation-1/README.md` — main architecture and experiment map.
- `oracle-pc-results.md`, `oracle-pc-moving-feedback-report.md`, and `oracle-pc-geometry-report.md` — stabilization, feedback, and geometry findings.
- `text-pc-results.md` — byte/word hierarchy controls.
- `experimental/completed_span_hierarchy/README.md` and `experimental/boundary_free_hierarchy/README.md` — completed-span and boundary-free results.
- `experimental/rao_dynamic_predictive_coding/README.md` — Jiang–Rao comparison.
- `sparse-predictive-coding/RESULTS.md` — an earlier discrete latent text baseline with interpretable lossy bigram-like codes and a contextual next-latent prediction gain.
