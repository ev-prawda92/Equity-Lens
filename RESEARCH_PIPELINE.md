# From Eval to Impact: How Counterfactual Fairness Research Enters the Model

*Evan Prawda — Operation Mincemeat LLC*

---

A common question about AI fairness research is how it connects to change. Evals produce findings, but findings are not yet fixes. The pipeline below describes how research produced by Equity Lens moves from observation to model-level and field-level impact.

---

## The Pipeline

**Evaluation → Findings**
Counterfactual fairness evaluation produces specific, measurable, reproducible claims about model behavior. Not "Claude seems biased" but "Claude scores an average of 1.8 on Economic Opportunity cases, with consistent differential treatment on age signals — the 54-year-old worker receives less ambitious career guidance than the 27-year-old across multiple independent runs." Specificity is what makes a finding actionable.

**Findings → Fine-Tuning**
Documented patterns of differential treatment become the basis for targeted retraining. Examples of equitable behavior get added to the training set. The model is retrained against the identified failure mode.

**Findings → Constitutional Updates**
Empirical gaps in model behavior surface new principles for AI governance frameworks. A finding that Claude systematically reduces the ambition of its guidance based on age signals could generate a constitutional addition specifying that Claude should not modulate assumed capability based on demographic signals.

**Findings → Publication and Field Standards**
Methodology and findings enter the peer-reviewed record — raising the standard for the field. A published counterfactual fairness methodology gives other developers, researchers, and auditors a reproducible instrument for testing their own systems.

**Findings → Institutional Deployment Decisions**
Cities, school districts, health systems, and public agencies use findings to audit AI tools before deployment in contexts that directly affect vulnerable populations.

---

## Why This Matters

The populations most likely to receive differential treatment from AI systems are also the populations with the least recourse when that treatment affects their access to education, healthcare, employment, or civic services.

Evals are not academic exercises. They are the upstream instrument for a downstream reality.

---

*© Evan Prawda — Operation Mincemeat LLC — All rights reserved*
*Provisional patent pending*
