# Perceptual Adaptation to L2-Accented Speech: A Replication Study

## Overview

This repository contains the data, analysis code, and results from a partial replication of Bradlow, Bassard, & Paller (2023)'s study on perceptual adaptation to second-language (L2) speech. The study investigates how listeners adapt to accented English speech when exposed to single versus multiple talkers during training and testing phases.

**Key Question**: Does exposure to talker variability during training affect the specificity versus generality of perceptual learning?

## Study Design

### Experimental Conditions
We employed a between-subjects design with 6 conditions (n=917 participants total):

1. **Single-single-same**: Same speaker throughout all trials
2. **Single-single-diff-same-variety**: Different speakers, same L1 background
3. **Single-single-diff-diff-variety**: Different speakers, different L1 backgrounds
4. **Single-multi-excl-single**: Single speaker training, multiple speakers testing
5. **Multi-multi-all-random**: Random speakers throughout
6. **Multi-excl-single-single**: Multiple speakers training, single speaker testing

### Materials
- **Corpus**: L2-ARCTIC (15 speakers from 6 L1 backgrounds: Arabic, Mandarin, Hindi, Korean, Spanish, Vietnamese)
- **Stimuli**: 30 sentences (2.0-4.45 seconds duration) + 2 attention checks
- **Task**: Full sentence transcription with 15-second response window

## Key Findings

### Summary Results by Condition

Overall, participants improved from training (86.6%) to testing (87.3%) phases. The table below shows the accuracy patterns:

| Condition | Direction | Description |
|-----------|-----------|-------------|
| **Same Speaker** | Training < Testing | Highest testing accuracy overall; strongest talker-specific benefit |
| **Diff Speaker, Same Variety** | Training ≈ Testing | Small improvement; no L1-based advantage |
| **Diff Speaker, Diff Variety** | Training ≈ Testing | Maintained performance across L1 backgrounds |
| **Single→Multi** | Training ≈ Testing | Slight improvement despite speaker variability increase |
| **Multi→Multi** | Training ≈ Testing | Baseline condition; consistent improvement |
| **Multi→Single** | Training > Testing | Only condition showing decreased performance |

*The relative adaptation benefit analysis (centered on the overall mean improvement) confirmed significant variation across conditions, with Multi→Single showing the only clear negative adaptation effect.*

### Main Conclusions

1. **Overall learning effect**: Participants showed improved performance from training (86.6%) to testing (87.3%) across all conditions

2. **Talker-specific adaptation confirmed**: Same-speaker training/testing showed significantly better performance than different-speaker conditions (p < 0.05)

3. **Limited variety-general effects**: L1 background similarity showed minimal impact on adaptation (p = 0.083)

4. **Balanced specialization costs**: Training with one speaker hurts multi-speaker testing as much as multi-speaker training helps single-speaker testing

5. **Substantial speaker variability**: Individual speaker intelligibility ranged from 74.3% to 93.0% accuracy

## Key Differences from Original Study

This is a "partial" replication focusing on the training phase effects:
- **Corpus**: L2-ARCTIC instead of ALLSSTAR
- **Trials**: 30 sentences (vs. 60 in original)
- **Noise**: No added noise (original used 0 dB SNR)
- **Timing**: 15-second response window with time pressure
- **Delay**: No 11-hour consolidation period between phases
- **Response**: Full sentence transcription (vs. keyword identification)
- **Platform**: Web-based using jsPsych (vs. laboratory setting)

## Ethics and Data Collection

- **Platform**: Prolific
- **Participants**: 917 native English speakers (18-35 years, US/UK/Canada)
- **Compensation**: $12/hour 
- **Completion time**: Median 8:13 minutes
- **Exclusions**: 453 participants (33.1%) excluded based on preregistered criteria.

## Citation

If you use this data or code, please cite:

Original study:
```bibtex
@article{bradlow2023generalized,
  author = {Bradlow, Ann R. and Bassard, Adriel John and Paller, Ken A.},
  title = {Generalized perceptual adaptation to second-language speech: 
           Variability, similarity, and intelligibility},
  journal = {Journal of the Acoustical Society of America},
  year = {2023}
}
```

## Acknowledgments

We thank the 1,370 Prolific participants who completed our study, and the creators of the L2-ARCTIC corpus for making their materials publicly available.
