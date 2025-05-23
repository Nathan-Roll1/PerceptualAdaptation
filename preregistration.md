# Preregistration: Perceptual Adaptation to Accented Speech in Single vs. Multi-Talker Contexts

## Study Overview
This experiment investigates how listeners adapt to accented English speech when exposed to single versus multiple talkers during training and testing phases. We examine whether exposure to talker variability during training affects the specificity versus generality of perceptual learning.

## Design
Between-subjects design with 6 conditions manipulating speaker configuration during training (first 15 trials) and testing (last 15 trials) phases:
1. Single-single-same: Same speaker throughout
2. Single-single-diff-same-variety: Different speakers, same L1 background
3. Single-single-diff-diff-variety: Different speakers, different L1 backgrounds  
4. Single-multi-excl-single: Single speaker training, multiple speakers testing
5. Multi-multi-all-random: Random speakers throughout
6. Multi-excl-single-single: Multiple speakers training, single speaker testing

## Participants
1,380 native English speakers (230 per condition) recruited via Prolific from US, UK, and Canada, aged 18-35. Exclusion criteria: failing 2+ attention checks or timeouts, self-reported hearing issues, or not using headphones.

## Materials
- 30 sentences from 15 L2 English speakers (6 L1 backgrounds: Arabic, Mandarin, Hindi, Korean, Spanish, Vietnamese)
- 2 attention check sentences
- Sentences presented with missing content (blank) that participants must identify

## Primary Hypotheses

### H1: Talker-Specific Adaptation
Training with a single talker will show strongest improvement when tested with the same talker (Condition 1 > Conditions 2, 3).

### H2: Variety-General Adaptation  
Single-talker training may transfer to new talkers from the same L1 background (Condition 2 > Condition 3).

### H3: Specialization Effects
We test whether costs of specialization equal benefits: |Condition 3 - baseline| = |Condition 4 - baseline|. That is, does single-talker training hurt multi-talker test performance as much as multi-talker training helps single-talker test performance?

## Secondary Analyses

### S1: Blank Position Effects
We will analyze how accuracy varies based on where the blank appears in the sentence (beginning, middle, end). We hypothesize that later blanks will show lower accuracy due to increased memory demands, with this effect being stronger for less intelligible speakers.

### S2: Human-ASR Alignment
We will compare human error patterns with automatic speech recognition (ASR) model predictions. Specifically, we will correlate item-level accuracy between humans and ASR confidence scores to test whether computational models capture the same sources of difficulty in accented speech perception.

## Analysis Plan

### Primary Analyses
- Mixed-effects logistic regression: Accuracy ~ Condition × Phase + (1|Participant) + (1|Item)
- Planned contrasts testing H1-H3 using Bonferroni correction
- Effect sizes calculated as Cohen's d on log-odds transformed accuracy

### Secondary Analyses  
- S1: Accuracy ~ Blank_Position × Speaker_Intelligibility + (1|Participant) + (1|Item)
- S2: Pearson correlation between item-level human accuracy and ASR confidence scores

### Power Analysis
With 200 participants per condition after exclusions, we have 85% power to detect d = 0.27 (approximately 4% accuracy difference) between conditions.

## Data Collection
Data collection will proceed until we reach 200 valid participants per condition. We anticipate approximately 15% exclusion rate due to strikes and technical issues.

## Predictions
1. Adaptation will be strongest for talker-specific conditions
2. Some single-talker conditions will show cross-talker generalization
3. Blank position will interact with speaker intelligibility, with end-position blanks showing steeper accuracy declines for harder-to-understand speakers
4. Human and ASR difficulty patterns will be moderately correlated (r = 0.4-0.6)