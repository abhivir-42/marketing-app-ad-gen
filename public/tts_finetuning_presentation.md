# Emotive Speech TTS Model Finetuning

## Overview

This presentation outlines the process of finetuning the Parler TTS (Text-to-Speech) model to generate emotive speech rather than monotonous speech. The project involved:

1. Collecting and preparing datasets with emotional tags for speech
2. Processing these datasets to extract audio features
3. Generating natural language prompts that include emotional context
4. Finetuning the Parler TTS model on this enriched dataset

## Dataset Collection and Preparation

### Emotion-Labeled Speech Datasets

Four key datasets were used for this project:

- **CREMA-D**: A collection of 7,442 original clips from 91 actors expressing 6 different emotions
- **RAVDESS**: The Ryerson Audio-Visual Database of Emotional Speech and Song
- **SAVEE**: Surrey Audio-Visual Expressed Emotion database
- **TES**: Toronto Emotional Speech Set

These datasets provided speech samples labeled with various emotions, which served as the foundation for our training data.

### Data Processing Pipeline

1. **Label Extraction**: Custom scripts were developed to extract emotional labels from the file names and metadata of the audio samples
2. **Dataset Integration**: The datasets were merged and processed into a consistent format
3. **Feature Extraction**: Audio features like pitch, pace, noise level, and reverberation were extracted from each sample

## Feature Extraction Process

The DataSpeech framework was used and modified to extract quantitative audio features:

```
python main.py "c0derish/master_emotion_audio_features_extracted" \
  --configuration "default" \
  --text_column_name "transcript" \
  --audio_column_name "filepath" \
  --cpu_num_workers 8 \
  --rename_column \
  --repo_id "c0derish/master_parler_tts_features_extracted" \
  --apply_squim_quality_estimation
```

Key features extracted included:
- Pitch (mean values)
- Speaking rate
- Noise levels
- Reverberation
- Speech monotony (pitch variation)
- Speech quality metrics

## Quantitative to Qualitative Transformation

The next step involved transforming numerical feature values into qualitative bins to create meaningful natural language descriptions:

```
python ./scripts/metadataar_to_text.py \
    "c0derish/master_parler_tts_features_extracted" \
    --repo_id "master_parler_tts_features_extracted" \
    --configuration "default" \
    --cpu_num_workers 8 \
    --path_to_bin_edges "./examples/tags_to_annotations/v02_bin_edges.json" \
    --path_to_text_bins "./examples/tags_to_annotations/v02_text_bins.json" \
    --avoid_pitch_computation \
    --apply_squim_quality_estimation
```

This process:
1. Categorized continuous values into bins (e.g., high/medium/low pitch)
2. Mapped these bins to natural language descriptions
3. Prepared the data for prompt generation

## Natural Language Prompt Generation

A critical innovation in this project was modifying the DataSpeech framework to incorporate emotion into the natural language prompts:

1. The framework was tweaked to include emotion labels in the data structure
2. An LLM was used to generate natural language prompts from the quantitative features and emotion labels
3. The LLM transformed data like:
   - Pitch: 220Hz
   - Speaking rate: 5.2 syllables/second
   - Emotion: Happy
   
   Into a prompt like:
   
   *"A young woman speaks in a high-pitched, cheerful voice at a moderate pace, expressing happiness and excitement."*

This step ran locally and took approximately 4 hours to process the entire dataset.

## Voice Classification

To ensure consistency in generated voices:

1. Each emotion-tagged sample was tied to a specific voice from the source datasets
2. This allowed the model to maintain voice characteristics across different generations
3. The user interface was designed to abstract this complexity away from the end user

## Finetuning Process

The Parler TTS model was finetuned using the dataset with emotional prompts:

```
python ./examples/run_tts_finetuning.py \
    --train_dataset_name "c0derish/master_emotion_audio_features_extracted" \
    --train_metadata_dataset_name "c0derish/master_emotion_audio_with_natural_language_prompts" \
    --output_dir "./tts_output/" \
    --model_name_or_path "parler-tts/parler-tts-mini-2.5" \
    --eval_dataset_name "c0derish/master_emotion_audio_features_extracted" \
    --eval_metadata_dataset_name "c0derish/master_emotion_audio_with_natural_language_prompts" \
    --data_split_name "train" \
    --eval_data_split_name "train" \
    --per_device_train_batch_size 2 \
    --gradient_accumulation_steps 4 \
    --per_device_eval_batch_size 1 \
    --learning_rate 1e-5 \
    --use_flash_attention_2 True \
    --hub_model_id "c0derish/parler-tts-mini-emotional" \
    --push_to_hub True \
    --report_to "wandb" \
    --num_train_epochs 10 \
    --logging_steps 10 \
    --max_steps 12000 \
    --generation_quality_eval_steps 1000 \
    --eval_steps 1000 \
    --save_steps 1000 \
    --save_total_limit 10 \
    --logging_steps 10
```

Hyperparameter tuning was performed to optimize the model's performance, with key parameters including:
- Dropout
- Regularisation coefficient
- Learning rate: 1e-5
- Batch size: 2
- Gradient accumulation steps: 4
- Number of training epochs: 10

However it was later scrapped as we realised that we were not overfitting for sure.
Rather we were underfitting and need more emotive speech data to improve our TTS model.

## Results and Evaluation

The finetuned model demonstrated significant improvements:

1. **Expressive Speech**: The model could generate speech with appropriate emotional inflections
2. **Contextual Understanding**: The model learned to associate emotions with appropriate voice characteristics
3. **Natural Transitions**: Smooth transitions between different emotional states within the same audio clip

Regular evaluations were performed throughout the training process, with generation quality evaluated every 1000 steps.

## Integration with User Interface

The finetuned model was integrated into a user-friendly interface that:

1. Allows users to specify emotional tone without technical details
2. Maintains consistent voice characteristics
3. Provides natural-sounding speech with appropriate emotional content

## Conclusion

This project successfully adapted the Parler TTS model to generate emotive speech by:

1. Leveraging and merging multiple emotion-labeled speech datasets
2. Extracting and quantifying audio features
3. Generating natural language prompts that incorporate emotional context
4. Finetuning the Parler TTS model on this enriched dataset

The resulting model provides a significant improvement over monotonous TTS systems, enabling more engaging and natural-sounding speech generation with appropriate emotional expressiveness. 