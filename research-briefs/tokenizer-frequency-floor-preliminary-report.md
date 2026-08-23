# Tokenizer Frequency Floor — preliminary report draft

## Status and scope

This is a preliminary research report, not a claim of a universal vocabulary scaling law or a completed benchmark. The work studies how vocabulary size, realized token-frequency distribution, segmentation policy, and token-learning dynamics interact with language-model training. Its central question is whether there is a useful observation-per-token regime, whether distributing information more evenly across segments changes representation quality or training efficiency, and how learning objectives and vocabulary changes affect token representations.

The current evidence comes from controlled sweeps and segmentation analyses. Several settings reached the tested vocabulary ceiling, and some follow-up comparisons have limited seeds. Accordingly, the results below are descriptive and motivate further experiments rather than establishing causal conclusions about downstream model quality.

## Motivation

Vocabulary design creates a trade-off. Larger vocabularies can shorten sequences and expose recurring multi-byte patterns, but also create a long tail of types with little training exposure. A mean count per vocabulary item is not sufficient to describe that trade-off: rare and zero-count types, the realized distribution after tokenization, bytes per token, and the segmentation rule can all change together.

The project therefore separates two related questions:

1. What frequency floor and vocabulary size are usable at a given model scale and token budget?
2. Can segmentation policies explicitly control the information assigned to a segment, and does that control produce useful training behavior?
3. Under otherwise matched conditions, how do RL and SFT differ in their embedding-learning trajectories?
4. How does an altered posttraining context-frequency distribution affect unused and pretrained token embeddings under RL and SFT, with the tokenizer held fixed?

## Study questions

The work is organized around the following questions:

1. How does the usable observation-per-active-type regime change with model scale, vocabulary size, and training budget?
2. At matched mean frequency, does the shape of the realized frequency distribution matter beyond the average?
3. How much does information density vary across BPE and alternative segmentation policies at comparable average segment length?
4. Do information-guided segmentation policies show different training outcomes from a policy with no information criterion?
5. When a new merged token is introduced, how quickly can its embedding recover under fitted, mean, or random initialization?
6. How can dynamically added or replaced tokens be trained without destabilizing the prediction head and unembedding matrix?
7. Can a fixed pool of replaceable dynamic token slots manage vocabulary changes more stably than continual output-vocabulary expansion?

## Methods

### Frequency-floor and vocabulary sweep

The experimental sweep parameter-matches language models across model scales, vocabulary sizes, token budgets, seeds, and tokenizer frequency-floor controls. It records, per token, training count, validation count, negative log-likelihood, accuracy, byte length, and additive bits-per-byte contribution. The analysis uses realized token frequencies rather than treating a tokenizer-design floor as a guarantee of the frequency distribution encountered during language-model training.

### Segmentation policies and information-density scoring

The segmentation suite includes BPE controls, fixed-length chunks, entropy-threshold methods, constant-information budgeting, constant-expected-information budgeting, and learned H-Net chunkers. For the information-density analysis, one byte model determines segmentation and a separately trained byte model scores information density. This independent driving/scoring setup is intended to reduce the risk that a segmentation policy appears good only because it is evaluated by the same model that produced it.

The reported dispersion comparison uses FineWeb-Edu and matches policies by average segment length. Dispersion is summarized with the coefficient of variation of information density. This metric measures how evenly information is distributed under the chosen scoring model; it does not, by itself, establish that lower dispersion improves language-model performance.

### Merge-initialization follow-up

For selected token-merge pairs, the follow-up compares fitted initial embeddings with mean and random representations. It evaluates held-out loss at initialization and tracks whether online training closes any initial gap as the new token is observed.

### Controlled RL/SFT embedding-learning study and planned dynamic-tokenization work

The controlled RL/SFT comparison uses four independently pretrained causal language models. Within each seed, the model was cloned from the same checkpoint into KL-regularized group-relative REINFORCE RL and oracle behavior-cloning SFT arms; both received 512 posttraining updates across four seeds. The task was symbolic routing with four allowed action tokens. The analysis covered 16 previously unused destination input-embedding rows, matched pretrained destination controls, and action tokens.

The tokenizer remained fixed at 3,072 tokens. The experiment does not test tokenizer learning, tokenizer extension, vocabulary changes, or a dynamic prediction head. Its relevant intervention is the altered posttraining context-frequency distribution, and its outcome is embedding learning under the two objectives.

Dynamic tokenization remains a separate planned direction. The existing merge-initialization follow-up is relevant but narrower: it does not test a dynamically changing tokenizer or prediction head. Proposed future measurements include trajectories for input embeddings and output/unembedding representations, token exposure, held-out behavior, and stability during vocabulary changes.

## Preliminary experimental findings

### The usable frequency floor changes with scale

At the lowest tested budget, the small model's best vocabulary was approximately 1,536 active types, while the medium model's was approximately 3,072 active types. The large model was still improving at the tested vocabulary ceiling. This supports a scale-dependent trade-off rather than a single universal frequency floor. Because several larger-budget cells also reached the experimental ceiling, the observed relation among model size, vocabulary, and observations is descriptive rather than a fitted scaling law.

### Distribution matters beyond mean observations per type

Across tested matched cells, the higher-floor tokenizer outperformed the lower-floor control at matched mean frequency, with lower validation bits per byte and a less concentrated learned-token distribution. The result indicates that the mean alone is incomplete: the rare tail, zero-count types, segmentation pattern, and bytes per token remain relevant. It does not isolate any one of those mechanisms as the cause of the difference.

### Information-uniform segmentation is measurable

In the independent FineWeb-Edu analysis, constant-information segmentation reached a coefficient of variation of about 0.36, and the deployable constant-expected-information method reached about 0.49. At matched average segment length, BPE, H-Net, entropy-threshold chunking, and blind fixed-length segmentation clustered around 0.67–0.68. Thus, explicit information budgeting produced a lower-dispersion band than the deployed-style alternatives measured here. Whether this lower dispersion is useful for language modeling remains an open experimental question.

### Coherent information criteria have a preliminary training signal

The training sweep contains a replicated, non-monotonic preliminary pattern: at the same mean length and vocabulary, both high- and low-dispersion information-guided policies can outperform a segmentation with no information criterion. With limited seeds, this is not evidence that either direction of dispersion is generally optimal. It does motivate compute-matched follow-up experiments and suggests that a coherent information criterion may be more important than simply minimizing or maximizing dispersion.

### Merge initialization gives a temporary head start

For several merge pairs, fitted embeddings began with better held-out loss than mean or random initialization. Online training often closed the gap after tens to hundreds of occurrences, depending on the merge and learning rate. This identifies a transient cost when adding or changing vocabulary items, while showing that a poor initial representation can recover with sufficient exposure.

### Controlled RL/SFT comparison: both activate unused embeddings, SFT is more reproducible

In a controlled symbolic-routing posttraining experiment, RL and oracle SFT both activated previously unused token embeddings, but SFT produced higher task accuracy, larger role clustering, and more reproducible cross-seed embedding changes. RL achieved reward-relevant within-run organization but not a shared anchor-relative solution across seeds.

Oracle SFT achieved overall task accuracy of 79.4% ± 25.3, versus 45.3% ± 15.2 for RL; for rare destinations, the figures were 77.3% ± 28.7 for SFT and 50.7% ± 21.8 for RL. Rare-row displacement was 0.0964 under SFT and 0.0439 under RL, and the route-clustering gap was +0.0543 versus +0.0220. SFT also showed greater cross-seed stability: its median rare change-vector cosine was 0.492, compared with 0.000 for RL. SFT reached N50 at about 1,452 occurrences for a stable 0.95 direction; RL never reached N50.

RL exceeded random accuracy within the task, although one seed failed at the random baseline. On natural validation, RL had better median retention (a 5.4% loss increase, versus 14.6% for SFT), while its mean was failure-dominated. The result is about fixed-vocabulary embedding learning under changed posttraining context frequencies, not tokenizer learning or vocabulary adaptation.

No result in the available materials yet establishes that dynamic tokenization, dynamic prediction-head updates, or replaceable token slots are stable or effective.

## Corrected BPE measurement

An earlier BPE measurement incorrectly decoded individual incomplete UTF-8 token byte sequences. That made token boundaries drift relative to the byte-level surprisal signal and overstated BPE's measured information-density variance. The corrected byte-aligned measurement places BPE in the same narrow dispersion band as H-Net, entropy-threshold chunking, and fixed-stride segmentation.

This correction strengthens the comparison discipline but does not convert the dispersion result into a training-quality claim. The supported conclusion is narrower: under the corrected measurement, explicit information budgeting is substantially lower-dispersion than the measured deployed-style segmenters, whose corrected dispersion values are similar to one another.

## Interpretation and caveats

The current record supports a scale-dependent vocabulary/frequency trade-off and shows that explicit information budgeting can measurably alter segment-level information dispersion. It also suggests that frequency-distribution shape is relevant beyond an average count. The controlled posttraining result establishes a difference between RL and oracle SFT embedding trajectories in the stated symbolic-routing setting, but does not establish a general property of RL or SFT. The merge-initialization findings motivate, but do not answer, questions about dynamic token learning. None of these observations establishes a universal optimal vocabulary, a universal frequency floor, a causal benefit of uniform-information tokens for downstream tasks, or a validated procedure for changing tokens during training.

Important caveats are:

- The vocabulary ceiling limits interpretation of cells that were still improving at the boundary.
- The reported training pattern has limited seeds and should not be generalized beyond the tested conditions.
- Information density and its coefficient of variation depend on the scoring setup; lower variance is a descriptive property, not an objective proven to improve training.
- The corrected BPE result addresses a UTF-8 byte-alignment error in the measurement. It should be used in place of the earlier inflated BPE-variance reading.
- Merge-initialization results are conditional on the selected merges and learning rates; recovery time varied from tens to hundreds of occurrences.
- The RL/SFT comparison is limited to a narrow symbolic environment with four permitted actions; oracle SFT has privileged targets.
- The study has only four seeds, including an RL failure, and its controls differ in natural-language history.
- Anchor embeddings can move, and the comparison measures untied input embeddings.
- The RL/SFT evidence concerns fixed-vocabulary embedding learning under altered posttraining context frequencies; it does not support claims about tokenizer learning, tokenizer extension, vocabulary changes, or dynamic-tokenization behavior.

## Next experiments

1. Run larger compute-matched training studies across more data, model scales, and corpora, and report learning curves alongside endpoint metrics.
2. Extend vocabulary ranges where prior cells hit the ceiling, so the scale/frequency trade-off can be tested without a boundary-limited optimum.
3. Increase seed counts for information-guided segmentation comparisons and separate effects of criterion, dispersion direction, mean segment length, and vocabulary.
4. Replicate the corrected BPE byte-aligned analysis across additional corpora and tokenizer configurations.
5. Test dynamic tokenization and token-learning methods, with particular attention to initializing and training the prediction head and unembedding matrix for new tokens.
6. Evaluate a fixed pool of dynamic tokens that can be replaced, as a possible way to manage vocabulary changes without continually expanding the output head.
7. Replicate and extend the matched RL-versus-SFT comparison across additional tasks, action spaces, seeds, and controls for natural-language history; continue reporting trajectories, token exposure, output-head behavior, and held-out performance.
8. In dynamic-tokenization experiments, separately test input-embedding updates, output/unembedding updates, and replacement policies, while measuring training stability rather than assuming any proposed scheme is safe.

## Source-note pointers

The source materials named in the existing project notes are not included in this website repository. They are pointers for provenance and follow-up rather than independently reproduced evidence in this draft:

- `research-playground/tokenizer-frequency-floor/README.md` and `RESULTS.md` — frequency-floor sweep and limitations.
- `research-playground/tokenizer-frequency-floor/DESIGN.md` — study design and measurement definitions.
- `adaptive-tokens/SEGMENTATION_INFORMATION_FINAL.md` — corrected independent information-density analysis.
- `adaptive-tokens/Q1_RESULTS.md` and `Q1_SCALING.md` — compute-matched training findings and follow-up design.
- `adaptive-tokens/TRAINING_RESULTS.md` — merge-initialization and catch-up measurements.
- `embedding-convergence/RL_POSTTRAINING_RESULTS.md` and its RL posttraining artifact reports — controlled RL-versus-oracle-SFT embedding-learning comparison.
- Dynamic-tokenization and prediction-head changes remain ongoing research questions rather than evidence-bearing result sets.

## Relationship to the existing portfolio brief

This standalone draft expands the preliminary findings recorded in `tokenizer-frequency-floor-research.md`. It retains the preliminary framing and distinguishes measured observations, corrections, interpretations, and next experiments so that it can be reviewed independently of the shorter portfolio-oriented brief.
