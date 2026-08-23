# Tokenizer Frequency Floor Research Program — full preliminary synthesis

## Status and reading guide

This document is a program-level preliminary synthesis. It distinguishes confirmed measurements from pilots, superseded results, and planned work. It does not claim a universal vocabulary law, an optimal tokenizer, or a general advantage for any posttraining objective.

## Confirmed fixed-budget vocabulary evidence

The core sweep holds total trainable parameters, analytic training FLOPs per token, architecture, optimizer, target-token checkpoints, and validation byte string fixed within scale. Vocabulary parameters trade exactly against FFN width; embeddings are tied to the output head. Three scales (525,568; 1,969,536; 4,987,392 parameters), four checkpoints (131,072–1,048,576 target tokens), three seeds, 11 F=32 vocabularies, and four matched F=128 controls yield 492 checkpoints. Target windows are drawn without replacement; tokenizer-design data ends before LM training data.

At 131,072 target tokens, the empirical F=32 optimum was V=1,536 (K=N/V=85.3) at 525,568 parameters and V=3,072 (K=42.7) at 1,969,536 parameters. Both are bracketed. The 4,987,392-parameter model was still improving at the feasible ceiling V=5,278, so K<24.8 is a one-sided bound. At larger budgets many cells likewise hit the vocabulary ceiling. The descriptive fit log2(K*)=-1.485-0.356log2(P)+0.834log2(N) is not a scaling law.

Matched F=128 tokenizers beat F=32 in all 48 matched cells by 0.002–0.087 validation BPB. At the final checkpoint they reduced learned-token Gini by 0.020–0.049, usually reduced zero-count types, and represented 0.011–0.021 more raw bytes per training token. This establishes that equal N/V does not determine performance; it does not isolate a causal Gini or floor coefficient because floor, segmentation, token identity, and bytes/token all change together. At the N=131,072 F=32 optima, types seen under 16 times contributed 0.264 BPB (638 types; 4.5% validation mass) at small scale, 0.736 BPB (2,208; 12.7%) at medium, and 1.039 BPB (4,505; 17.2%) at large scale.

## Confirmed information-density measurements

The corrected FineWeb-Edu analysis uses independent byte models for cutting and scoring, with policies matched by mean segment length. Explicit constant-information budgeting reached information-density CV about 0.36 and deployable expected-information budgeting about 0.49. Corrected Qwen3 BPE was 0.678 and matched BPE 0.671; H-Net, BLT-style entropy thresholding, and fixed stride were near 0.68. A prior BPE procedure decoded incomplete UTF-8 byte tokens individually and overstated BPE variance (0.892→0.678 and 0.908→0.671). Lower dispersion is descriptive, not a demonstrated LM-quality objective.

H-Net depth work found 1-stage L/XL around 4.68/4.56 bytes per chunk and bits-CV 0.679/0.669. At level two, chunks were about 6.92/6.88 bytes with bits-CV 0.649/0.633; the intermediate level was more variable (0.735/0.771). This is a two-depth, one-corpus measurement, not a depth law.

## Confirmed and limited segmentation-search results

At fixed 16,384-token vocabulary, a 16K architecture pilot trained on 128 random 64-byte FineWeb-Edu windows and evaluated on 32 held-out windows. Lattice and split/merge/edit imitation of BPE achieved boundary F1 0.956 and 0.940 with 100% raw and deployed validity; unconstrained seq2seq achieved F1 0.384 and 0% raw validity (source-constrained decoding restored validity). This establishes feasible structured segmentation imitation, not downstream benefit.

The three-seed downstream search used a 1,795,200-parameter Transformer and fixed-compute 150-update arms (153,600 tokens; estimated 1.6766e12 FLOPs), plus fixed-data controls. Lattice and edit improved their bigram proxy from greedy BPE 3.0932 to 3.0346/3.0370 proxy BPB, but worsened downstream fixed-compute BPB from 3.0366 to 3.0532/3.0520 and fixed-data BPB from 3.5185 to 3.5698/3.5676 in every paired seed. The shortest-path compression heuristic improved downstream BPB to 3.0218 fixed-compute and 3.5002 fixed-data, but is an explicitly separate compression arm, not evidence that downstream-guided search worked.

## Embedding construction and convergence

For 24 frozen-model merge pairs, a fitted new row achieved median held-out KL 0.0247 versus 0.1472 for a mean and 0.4216 for a random token (6.01× median reduction versus mean); it was best on all 24 pairs. This is a capacity/initialization result, not online learning. Frozen-backbone rankings do not fully transfer: in a follow-up, Gaussian remained worst but ordering among other initializations changed when the body trained. A 32× embedding learning-rate multiplier worsened all 12 runs by 0.31–0.52 nats/token per pair.

Natural-pretraining convergence experiments use untied input embeddings, anchor-relative geometry, and censored cross-seed curves. Width discovery (32–512, four seeds each; 768/1,024 held out) found learned N50 declining from 119 at width 32 to 30 at width 512; sealed checks observed 30 and 33 at 768 and 1,024. A 2,048-width, 213.95M-parameter confirmation with four seeds and 2,097,152 unique target tokens rejected the extrapolation: observed N50/N75/N90 were 511/1,530/3,948 rather than 25–40/50–75/150–230. Thus there is no universal observations-per-token convergence floor; total exposure, context diversity, and the stability criterion matter.

Curriculum timing matters. In a d=192, four-layer, V=3,072/F=32 study with 48 focal types and four seeds, moving occurrences frontloaded rather than random reduced convergence by 64 by 0.281–0.352 depending on LR schedule (paired 95% CIs exclude zero). Raw count predicted held-out convergence better than tested LR-weighted coordinates (RMSE 0.1048 versus 0.1069 and 0.1429). At width 512, anchor-relative N50/N75/N90 were 412/1,626/4,008, versus raw-direction 549/2,225/4,989; embeddings continued moving rather than becoming static.

## Controlled RL versus oracle SFT posttraining

Four independently pretrained width-512, four-layer 15.74M causal LMs were cloned within seed into KL-regularized group-relative REINFORCE and oracle behavior-cloning SFT. Both ran 512 updates over four seeds on six-step symbolic routing with four actions and 25% random accuracy. The tokenizer was fixed at 3,072 types; 16 unused destination input rows, 16 common controls, and four action tokens were studied. This is altered posttraining context-frequency embedding learning, not tokenizer learning, extension, or vocabulary change.

Both arms activated unused embeddings. SFT achieved 79.4%±25.3 overall accuracy and 77.3%±28.7 rare-destination accuracy, versus RL 45.3%±15.2 and 50.7%±21.8. Rare-row displacement was 0.0964 SFT versus 0.0439 RL; the route-clustering gap rose to +0.0543 versus +0.0220. Median rare change-vector cosine across seeds was 0.492 for SFT and 0.000 for RL. SFT reached N50 around 1,452 occurrences for stable 0.95 direction; RL did not. RL was reward-effective within run but did not select a shared anchor-relative solution across seeds. Median natural-validation loss increased 5.4% under RL versus 14.6% under SFT, while RL's mean was dominated by one failed seed (+98.4% loss, random-baseline reward).

Limitations: the environment is narrow; only four actions are allowed; SFT has privileged targets; four seeds include an RL failure; controls differ in natural-language history; anchors can move; and rows are untied input embeddings.

## Posttraining distribution shift and exploratory mechanisms

Using a fixed 16,384-type BPE and a FineWeb-Edu byte scorer on three 8MB corpora, pretraining text measured 1.643 bits/byte and 4.274 bytes/token. Qwen3-0.6B GSM8K rollouts measured 1.940 and 3.333, with 7,919 distinct types; tool-call transcripts measured 2.028 and 2.814, with 45.6% single-byte tokens. Tool scaffolding was 15.2% of bytes, 21.5% of tokens, and 26.5% of measured bits; a JSON key averaged 5.35 tokens (n=52,805). These are distribution measurements under frozen instruments, not evidence that refitting a tokenizer improves RL.

In a frozen Qwen3-0.6B intervention on 35 frequent rollout n-grams, long reasoning frames had endpoint resultant length 0.979 versus 0.868 for last-token-matched controls. Replacing an eight-token frame with a placeholder plus one stored mean mid-layer residual changed continuation KL from 3.86 ablated and 1.59 placeholder to 0.58 (0.59 with the occurrence-specific vector), recovering 86% of the sequence effect over an eight-token horizon. This is mechanism evidence on one model/domain, not task or latency evidence.

## Explicitly superseded, negative, and incomplete work

The long-context retrieval headline is superseded: its earlier four-record task permitted a query-ignoring 25% heuristic, while every reported result was below that level. It must not be cited as retrieval evidence. A later production surface reports low absolute accuracy and a coverage advantage, but the file retains the superseded warning; it is not used as a program headline here. A linear-attention baseline remained at 16-way chance after 20,000 updates, so it does not test tokenizer-size effects. Dynamic-tokenization, dynamic output-head updates, and replaceable token slots remain unvalidated planned work.

## What the program establishes and what remains open

Supported conclusions: (1) useful frequency/vocabulary regimes depend on scale and budget; (2) realized distribution shape matters beyond N/V; (3) explicit information budgeting changes measured dispersion but has no demonstrated general training benefit; (4) simple proxy-driven segmentation search can fail to transfer downstream; (5) embeddings can be initialized or activated effectively without implying a universal count floor; and (6) RL and oracle SFT can produce functionally useful but geometrically different embedding learning under a fixed tokenizer.

Open work: broader-scale/corpus replication; stronger neural downstream segmentation rewards; dynamic-token input/output-head stability; RL/SFT replication beyond symbolic routing; and causal tests of whether posttraining distribution shift warrants adaptive representations.

## Provenance pointers

- `README.md`, `DESIGN.md`, `RESULTS.md`, and `artifacts-token-count/` — core fixed-budget sweep.
- `adaptive-tokens/SEGMENTATION_INFORMATION_FINAL.md`, `Q1_RESULTS.md`, and `TRAINING_RESULTS.md` — segmentation and merge studies.
- `embedding-convergence/RL_POSTTRAINING_RESULTS.md`, `WIDTH_SCALING_RESULTS.md`, and `LARGE_WIDTH_CONFIRMATION_RESULTS.md` — embedding dynamics.
- `q2/RESULTS.md` and `segmentation_search/DOWNSTREAM_SEARCH_RESULTS.md` — posttraining-distribution and segmentation-search studies.
