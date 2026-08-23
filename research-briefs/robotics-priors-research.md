# LLM-Authored Priors for Robot Learning — preliminary portfolio brief

## Project focus

This research asks how an LLM-authored behavioral program should be connected to a PPO-trained robot policy. I explored two intentionally different points on an authority spectrum:

-Two promising strategies emerge:

- **Critic features:** the program supplies privileged, structured features to the value function only. The actor and reward remain unchanged, so the program cannot directly alter the optimal policy.
- **Motor tape:** the program produces a reset-anchored, open-loop trajectory that contributes directly to action, while learned residual, timing, and modulation heads correct it.

The shared goal is to use language-model reasoning to improve robot learning without obscuring where a prior helps, where it harms, and which causal mechanism is responsible.

## Critic-features technique

### Method

An LLM-generated staged program is converted into critic-only inputs: stage cursor, suggested prior action, prior magnitude, policy–prior disagreement, and per-stage success margins. The intended causal chain is improved value estimation, lower-variance generalized-advantage estimates, and a sharper policy gradient. The actor uses no feature path directly.

### Results

An early diversity study found that a union of several distinct program feature sets substantially outperformed a narrower parallel-gate version on the Shadow Hand cube-lift task. The union arm achieved a graded score of 0.988 and success around 0.45 in a large evaluation, versus roughly 0.13 success for the comparison arm.

However, the broader story is more nuanced. A composition study's matched-width noise control achieved higher success than some real-feature union arms. A later three-seed mechanism check resolved part of the question: real program features improved critic explained variance relative to width-matched noise at the clearest checkpoints, establishing a content-dependent value-fit effect. But that advantage did not translate into consistently better short-horizon behavioral metrics; noise matched or beat real features on mean graded objective at each post-initial checkpoint and on success at two of three.

### Interpretation

The evidence now supports the first mechanism link—LLM-derived critic features can improve value fit—while leaving the behavioral benefit unresolved and currently in tension with the short-duration results. The most important next experiment is a longer, matched real-versus-noise study that reports all checkpoint means, not selected peaks. This makes the project a useful investigation of when improved credit assignment actually converts into better exploration and control.

## Motor-tape technique

### Method

The LLM authors a reset-conditioned keyframe program that is compiled into a desired joint-target trajectory. PPO learns three correction channels around that plan: an additive residual with plan lookahead and tracking error, a timing/rate head, and optional bounded plan modulation. This creates a strong but auditable action prior: it can accelerate learning, but a bad tape can also block useful contact or drive the robot into a poor action basin.

### Results

In a generation-condition study, a tape authored with several sampled reset states produced the strongest trained result among the tested generation conditions. Exact fixed-position instructions were brittle under object-reset variation, despite appearing stronger at the fixed spawn. Revision feedback markedly improved the open-loop autopilot score by correcting a concrete coordinate/sign error, yet the revised tapes trained worse than the sampled-tape baseline. This exposed an important distinction: a better open-loop plan is not necessarily a better learning scaffold.

The central failure mode was contact harm. A tape that occupied the grasp workspace could prevent the policy from discovering grasp behavior even when it looked plausible under trajectory-level evaluation. Among mitigation experiments, a feedforward handoff that faded the tape as the hand approached the object was the most consistent: it beat the problematic tape's graded baseline in all four tested seeds and was the only mitigation to produce grasp episodes in most seeds. Grasp-gated reward shaping helped only intermittently, while a zero-contact near-miss revision was a clean null result—removing contact alone did not restore grasp formation.

### Interpretation

Motor tapes show that the right question is not “is the generated plan good?” but “how much authority should it retain as the policy reaches states where the plan becomes brittle or actively harmful?” The current evidence favors reset-robust plan authoring plus state-dependent handoff to learned control, with evaluation that separates autopilot quality, contact behavior, and policy-only performance.

## Where to find the underlying work

- `agent-mini-script-control/llm-framework/policy_bias_lab/docs/critic_features_and_motor_tape_findings.md` — primary results, caveats, and run index.
- `policy_bias_lab/experimental/alternative-methods/OVERVIEW_critic_features_directions.md` — critic-feature hypotheses and next experiments.
- `policy_bias_lab/experimental/motor-tape/DESIGN.md` — tape specification, compiler, and correction architecture.
- `policy_bias_lab/experimental/motor-tape/` — tape generation, PPO integration, robustness, and handoff studies.
- `policy_bias_lab/experimental/alternative-methods/` — critic-feature implementation and mechanism checks.


Aug 16 - testing bounds of lower level policy, found that a fixed bound works best, and needs to be small to work well.
Aug 17 - testing different bounds - learned bound, bound based off of robot and task geometry, and bound based off of motor tape error.  Error based bound appears to work best. Moving on to testing in more diverse environments.
Aug-18/19 - expanding testing to different objects, and testing single lower policy over all of them.  Rounded objects have low success rate.  Shared lower policy works.  Need to test if it works better though.  Hierarchical authoring works better than per task authoring.
Aug 19 - Found that the reward objective was making the policy stray from an effective tape - this also raises an intersting question - can we use LLM policies to check the effectiveness of shaped rewards.  Shaped rewards that pull the behaviour off the LLM policy in stages that are not failing are probably malformed.  
Aug 20 - Testing new shaped rewards that reward terminal stages more than beginning stages.  