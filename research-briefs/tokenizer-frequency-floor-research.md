# Tokenizer Frequency Floor Research — preliminary portfolio brief

## Project focus

This project investigates how vocabulary size, token-frequency distribution, segmentation policy, and token-learning dynamics interact with language-model training. The motivating question is not simply “what vocabulary is best?” but whether there is a meaningful observation-per-token regime, whether tokenizers that equalize information across segments lead to better representations or training efficiency, and how the training objective changes the way token embeddings are learned.


## What I built

- A parameter-matched language-model sweep across model scales, vocabulary sizes, token budgets, seeds, and tokenizer frequency-floor controls.
- Per-token accounting for training count, validation count, NLL, accuracy, byte length, and additive bits-per-byte contribution.
- A suite of segmentation policies: BPE controls, fixed-length chunks, entropy-threshold methods, constant-information and expected-information budgeting, and learned H-Net chunkers.
- Independent scoring methodology: one byte model drives segmentation while another, separately trained model measures information density.
- Follow-up initialization experiments that test how quickly a newly merged token embedding catches up when initialized from a fitted, mean, or random representation.

## Current study directions

### RL versus SFT embedding-learning dynamics

A controlled symbolic-routing posttraining experiment compares embedding learning under KL-regularized group-relative REINFORCE RL and oracle behavior-cloning SFT. Four independently pretrained causal language models were each cloned from the same checkpoint within seed, then received 512 posttraining updates under each method across four seeds. The task permitted four action tokens. Analysis examined 16 previously unused destination input-embedding rows, matched pretrained destination controls, and the action tokens.

The tokenizer was fixed at 3,072 tokens throughout. This is not a tokenizer-learning, tokenizer-extension, or vocabulary-change experiment: it tests embedding learning after the posttraining context-frequency distribution is altered.

### Tokenization and token-learning dynamics

A second active direction studies tokenization itself as a changing part of training: how new, merged, replaced, or otherwise dynamically managed tokens acquire useful input and output representations. The existing merge-initialization experiments provide evidence about a limited version of that problem—initialization and catch-up for selected merged tokens—but do not yet resolve dynamic tokenization in general.

The central open engineering question is how to train the prediction head, especially the unembedding matrix, for newly introduced tokens without destabilizing the network. One proposed design to test is a fixed pool of dynamic token slots that can be replaced rather than continually increasing the output vocabulary. This is a hypothesis for evaluation, not a validated solution.


## Main findings

The findings below are the currently supported experimental observations. The controlled RL/SFT comparison adds an embedding-learning result; dynamic-tokenization and prediction-head changes remain open work.
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

### RL and oracle SFT both activate unused embeddings, with different cross-seed structure

In a controlled symbolic-routing posttraining experiment, RL and oracle SFT both activated previously unused token embeddings, but SFT produced higher task accuracy, larger role clustering, and more reproducible cross-seed embedding changes. RL achieved reward-relevant within-run organization but not a shared anchor-relative solution across seeds.

SFT reached overall task accuracy of 79.4% ± 25.3, compared with RL at 45.3% ± 15.2; on rare destinations, SFT reached 77.3% ± 28.7 and RL 50.7% ± 21.8. Rare-row displacement was 0.0964 for SFT and 0.0439 for RL, while the route-clustering gap was +0.0543 for SFT and +0.0220 for RL. SFT's median rare change-vector cosine across seeds was 0.492 versus 0.000 for RL, and SFT reached N50 at roughly 1,452 occurrences for a stable 0.95 direction whereas RL did not reach N50. RL exceeded random accuracy within the task, but one seed remained at the random baseline.

RL retained natural validation better by median: a 5.4% loss increase versus SFT's 14.6%. RL's mean retention result was dominated by the failed seed. These findings are limited to this controlled posttraining setting; they do not imply that either objective generally learns embeddings better.

## Scope and status

The project has established several controlled empirical directions, but not a universal vocabulary law or a causal guarantee that uniform-information tokens improve downstream model quality. The next stage is a larger, compute-matched training study across more data, scales, and corpora, reporting learning curves rather than only endpoint selections. It also includes replication and extension of the RL/SFT embedding-trajectory study, plus dynamic-tokenization experiments that separately assess input embeddings, output/unembedding representations, and training stability.

The RL/SFT result has important limitations: the environment is narrow and symbolic, only four actions are permitted, oracle SFT uses privileged targets, the study has four seeds with one RL failure, and the controls differ in natural-language history. Anchor embeddings can move, and the measured rows are untied input embeddings. These constraints limit the result to the stated controlled comparison.

## Full-program preliminary synthesis

The saved website also contains a detailed, claim-separated synthesis covering the fixed-budget vocabulary surface, corrected segmentation measurements, negative proxy-to-downstream transfer result, embedding initialization and convergence follow-ups, controlled RL/SFT posttraining, posttraining distribution shift, and explicitly superseded retrieval work. See `tokenizer-frequency-floor-full-preliminary-report.md` and its browser-viewable PDF companion for numerical setup, results, and provenance pointers.

## Where to find the underlying work

- `research-playground/tokenizer-frequency-floor/README.md` and `RESULTS.md` — frequency-floor sweep and limitations.
- `DESIGN.md` — study design and measurement definitions.
- `adaptive-tokens/SEGMENTATION_INFORMATION_FINAL.md` — corrected independent information-density analysis.
- `adaptive-tokens/Q1_RESULTS.md` and `Q1_SCALING.md` — compute-matched training findings and follow-up design.
- `adaptive-tokens/TRAINING_RESULTS.md` — merge-initialization/catch-up measurements.
- `embedding-convergence/RL_POSTTRAINING_RESULTS.md` and its RL posttraining artifact reports — controlled RL-versus-oracle-SFT embedding-learning comparison.
- Dynamic-tokenization and prediction-head changes remain ongoing questions rather than completed result sets.
