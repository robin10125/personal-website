# Predictive Coding Research — preliminary portfolio brief

## Project focus

I built and compared several hierarchical predictive-coding systems to test a basic question: can a higher-level state summarize longer-term structure and *usefully* improve a lower-level sequence model? The results so far are primarily negative. The work did produce useful tools, controls, and diagnoses, but it has not yet shown that an upper predictive state provides a robust downstream benefit beyond a strong local sequence model.

The project began with synthetic speech and symbolic controls, then moved to byte-level text. I treated representation stability, causal feedback, and parallelizable state updates as separate experimental problems rather than assuming that a lower prediction loss proved a useful hierarchy.

## What I built

- An end-to-end char byte to higher order byte sequence and word level representation system, designed to test whether a latent prediction system that predicts representations that predict long term behaviour converge onto world level representations. 
- A byte/word hierarchy built around a frozen causal byte Transformer and an L2 model that receives only completed-word representations.
- Alternatives to explicit word segmentation, including a gated fast/slow scan and causal linear attention, designed to be scan/chunk parallel.
- A faithful adaptation of Jiang and Rao-style dynamic predictive coding, evaluated against the parallel scan models.

## Methodology

To make failures interpretable, I built a sequence of increasingly controlled tests rather than relying on one end-to-end system.

-focus on methods that test compression of lower level data over varying time scales to see if higher order represntations and symbols emerge.  Predictive targets become representatons that compress long term behaviour.

## Results and difficulties

***Rewrite this***