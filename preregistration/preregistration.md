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
- 30 sentences from 15 L2 English speakers (6 L1 backgrounds: Arabic, Mandarin, Hindi, Korean, Spanish, Vietnamese; balanced by speaker gender)
- 2 attention check sentences (requiring single-word responses)
- Sentences presented as audio only; participants transcribe the full sentence they hear
- Exit survey collecting: listener gender, first language, other language exposure, English learning history

## Task
Participants listen to sentences and type exactly what they hear. They can begin typing while the audio plays but cannot submit their response until the audio finishes. They have 15 seconds after audio completion to finish typing. All responses are automatically formatted to lowercase without punctuation (except apostrophes) to reduce orthographic variability and focus on speech perception accuracy.

## Primary Hypotheses
### H1: Talker-Specific Adaptation
Training with a single talker will show strongest improvement when tested with the same talker (Condition 1 > Conditions 2, 3).

### H2: Variety-General Adaptation  
Single-talker training may transfer to new talkers from the same L1 background (Condition 2 > Condition 3).

### H3: Specialization Effects
We test whether costs of specialization equal benefits: |Condition 3 - baseline| = |Condition 4 - baseline|. That is, does single-talker training hurt multi-talker test performance as much as multi-talker training helps single-talker test performance?

## Secondary Analyses
### S1: Word-Level Error Patterns
We will analyze which types of words are most commonly misperceived in accented speech (e.g., function words vs. content words, word frequency effects, phonological neighborhood density). We hypothesize that function words and high-frequency words will show higher accuracy due to top-down support, while words with many phonological neighbors will show lower accuracy.

### S2: Serial Position Effects
We will examine whether word accuracy follows a U-shaped pattern across sentence positions, with higher accuracy for initial and final words compared to middle words. We hypothesize that primacy and recency effects will be present, but may be modulated by speaker intelligibility—less intelligible speakers may show stronger recency effects as listeners rely more heavily on recently heard information when processing is difficult.

### S3: Human-ASR Alignment
We will compare human error patterns with automatic speech recognition (ASR) model predictions. Specifically, we will correlate item-level accuracy between humans and ASR confidence scores to test whether computational models capture the same sources of difficulty in accented speech perception.

### S4: Gender Matching Effects
We will test whether listener-talker gender matching affects speech perception accuracy. Previous research suggests mixed effects of gender matching in accented speech perception. We will examine whether same-gender pairings show higher accuracy than different-gender pairings, potentially due to acoustic-phonetic similarities or social factors.

### S5: Cross-Linguistic Facilitation
We will investigate whether listeners who report regular exposure to languages other than English show improved accuracy when listening to speakers whose L1 matches those languages. For example, do listeners with Spanish exposure better understand Spanish-accented English? This tests whether multilingual experience provides specific perceptual advantages for processing accent patterns from familiar language backgrounds.

## Analysis Plan
### Primary Analyses
- Mixed-effects logistic regression: Accuracy ~ Condition × Phase + (1|Participant) + (1|Item)
- Planned contrasts testing H1-H3 using Bonferroni correction
- Effect sizes calculated as Cohen's d on log-odds transformed accuracy
- Accuracy calculated using normalized string matching (lowercase, no punctuation except apostrophes)

### Secondary Analyses  
- S1: Word-level accuracy ~ Word_Type × Word_Frequency × Neighborhood_Density + (1|Participant) + (1|Item)
- S2: Word accuracy ~ Serial_Position (beginning/middle/end) × Speaker_Intelligibility + (1|Participant) + (1|Item)
- S3: Pearson correlation between item-level human accuracy and ASR confidence scores
- S4: Accuracy ~ Listener_Gender × Talker_Gender + (1|Participant) + (1|Item)
- S5: Accuracy ~ Listener_L2_Match (matches/doesn't match talker L1) × Talker_L1 + (1|Participant) + (1|Item)

### Power Analysis
With 200 participants per condition after exclusions, we have 85% power to detect d = 0.27 (approximately 4% accuracy difference) between conditions.

## Data Collection
Data collection will proceed until we reach 200 valid participants per condition. We anticipate approximately 15% exclusion rate due to strikes and technical issues.

## Predictions
1. Adaptation will be strongest for talker-specific conditions
2. Some single-talker conditions will show cross-talker generalization
3. Function words and high-frequency words will show higher accuracy across all conditions
4. Word accuracy will show a U-shaped pattern across sentence positions, with beginning and end words showing higher accuracy than middle words
5. Human and ASR difficulty patterns will be moderately correlated (r = 0.4-0.6)
6. Gender matching effects, if present, will be small (d < 0.2) and may interact with talker L1 background
7. Listeners with L2 experience will show 3-5% accuracy improvement when the L2 matches the talker's L1, suggesting transfer of accent-specific perceptual knowledge
