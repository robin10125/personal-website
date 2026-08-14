# Tokenizer Frequency Floor Research — preliminary portfolio brief

## Project focus

This project investigates how vocabulary size, token-frequency distribution, and segmentation policy interact with language-model training. The motivating question is not simply “what vocabulary is best?” but whether there is a meaningful observation-per-token regime, and whether tokenizers that equalize information across segments lead to better representations or training efficiency.

## What I built

- A parameter-matched language-model sweep across model scales, vocabulary sizes, token budgets, seeds, and tokenizer frequency-floor controls.
- Per-token accounting for training count, validation count, NLL, accuracy, byte length, and additive bits-per-byte contribution.
- A suite of segmentation policies: BPE controls, fixed-length chunks, entropy-threshold methods, constant-information and expected-information budgeting, and learned H-Net chunkers.
- Independent scoring methodology: one byte model drives segmentation while another, separately trained model measures information density.
- Follow-up initialization experiments that test how quickly a newly merged token embedding catches up when initialized from a fitted, mean, or random representation.

## Main findings

### The usable frequency floor changes with scale

The preliminary sweep found that larger models could productively support fewer average observations per active vocabulary item. At the lowest tested budget, the small model's best vocabulary was around 1,536 active types while the medium model's was around 3,072; the large model was still improving at the tested vocabulary ceiling. This is evidence for a scale-dependent tradeoff, not a universal constant. Several larger-budget cells hit the experimental ceiling, so the fitted relation between observations, vocabulary, and model size is descriptive rather than a scaling law.

### Distribution matters beyond average observations per type

At matched mean frequency, the higher-floor tokenizer beat the lower-floor control across all tested matched cells, with lower validation bits per byte and a less concentrated learned-token distribution. This suggests that average observations per vocabulary item is an incomplete summary: the rare tail, zero-count types, segmentation, and bytes per token all matter. The work deliberately measures realized frequencies rather than assuming the tokenizer-design floor remains exact during language-model training.

### Information-uniform segmentation is measurable, but usefulness remains open

With independent driving and scoring models on FineWeb-Edu, constant-information and constant-expected-information policies substantially reduced information-density dispersion relative to conventional segmentation. At matched average segment length, constant information reached a coefficient of variation around 0.36 and the deployable expected-information method about 0.49; BPE, H-Net, entropy-threshold chunking, and even blind fixed-length segmentation clustered near 0.67–0.68. The result is descriptive, not a claim that lower information variance is inherently better for language modeling.

### A correction strengthened the measurement discipline

I found and corrected a BPE measurement bug caused by decoding individual incomplete UTF-8 token byte sequences. The bug made token boundaries drift against the byte-level surprisal signal and overstated BPE variance. After correction, BPE sits within the same narrow dispersion band as H-Net, entropy-threshold chunking, and fixed stride. That made the key result clearer: several very different deployed-style segmenters converge to similar dispersion, while explicit information budgeting reaches a substantially lower band.

### Any coherent information criterion may matter more than its direction

The training sweep's most interesting preliminary pattern is a replicated non-monotonic result: both high- and low-dispersion information-guided policies can outperform a segmentation with no information criterion at the same mean length and vocabulary. This is a preliminary observation with limited seeds, but it motivates the next compute-matched training experiments more strongly than a simple “maximize versus minimize variance” story.

### Good merge initialization provides a temporary head start

For several token-merge pairs, fitted initial embeddings began with better held-out loss than mean or random initialization. Online training often caught up after tens to hundreds of occurrences, depending on the merge and learning rate. This identifies a practical transient cost of adding or changing vocabulary items, while also showing that an initially poor representation can recover with exposure.

## Scope and status

The project has established several controlled empirical directions, but not a universal vocabulary law or a causal guarantee that uniform-information tokens improve downstream model quality. The next stage is a larger, compute-matched training study across more data, scales, and corpora, reporting learning curves rather than only endpoint selections.

## Where to find the underlying work

- `research-playground/tokenizer-frequency-floor/README.md` and `RESULTS.md` — frequency-floor sweep and limitations.
- `DESIGN.md` — study design and measurement definitions.
- `adaptive-tokens/SEGMENTATION_INFORMATION_FINAL.md` — corrected independent information-density analysis.
- `adaptive-tokens/Q1_RESULTS.md` and `Q1_SCALING.md` — compute-matched training findings and follow-up design.
- `adaptive-tokens/TRAINING_RESULTS.md` — merge-initialization/catch-up measurements.
