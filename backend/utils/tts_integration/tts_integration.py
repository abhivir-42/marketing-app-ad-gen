import os
import shutil
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import torch
import soundfile as sf
from typing import List, Optional, Tuple
from pydub import AudioSegment

output_dir = "/home/azureuser/marketing-app-ad-gen/backend/output/"
result_path = "/home/azureuser/marketing-app-ad-gen/full_script_audio.wav"


async def generate_audio_from_text(model, tokenizer, device, transcript, art_dir, line_num) -> str:
    """
    Generate audio from text using the Parler TTS model.
    Returns a base64-encoded data URL for the audio.
    
    For now, this is a mock implementation since we don't have direct access to the virtual machine.
    The real implementation would:
    1. Load the model (using the cache)
    2. Generate the audio
    3. Apply any speed/pitch adjustments
    4. Return the audio as a data URL
    """
    prompt = transcript
    description = art_dir

    description_tokenized = tokenizer(
        text=description,
        return_tensors="pt",
    )
    description_input_ids = description_tokenized.input_ids.to(device)
    # if you remove this attention mask adn look below
    description_attn_mask = description_tokenized.attention_mask.to(device)

    prompt_tokenized = tokenizer(
        text=prompt,
        return_tensors="pt",
    )
    prompt_input_ids = prompt_tokenized.input_ids.to(device)
    prompt_attn_mask = prompt_tokenized.attention_mask.to(device)

    # and remove the setting of the attention mask here, you should see the pad and eos token error
    print("starting generation")
    generation = model.generate(input_ids=description_input_ids, prompt_input_ids=prompt_input_ids, attention_mask=description_attn_mask)
    print("generation done")
    audio_arr = generation.cpu().numpy().squeeze()

    sf.write(f"{output_dir}line_{line_num}.wav", audio_arr, model.config.sampling_rate)
    

async def generate_audio_from_script(script_lines: List[Tuple[str, str]]) -> str:
    """
    Generate audio from a list of script lines and their art directions.
    This concatenates the lines and generates a single audio file.
    """
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    model = ParlerTTSForConditionalGeneration.from_pretrained("c0derish/parler-tts-mini-v1-segp-colab").to(device)
    tokenizer = AutoTokenizer.from_pretrained("c0derish/parler-tts-mini-v1-segp-colab")
    
    # make directory for output
    if os.path.isdir(output_dir):
        shutil.rmtree(output_dir)
    os.mkdir(output_dir)
    
    for i, pair in enumerate(script_lines):
        transcript, art_dir = pair
        await generate_audio_from_text(model, tokenizer, device, transcript, art_dir, i)
    
    try:
        return await merge_audio()
    finally:
        shutil.rmtree(output_dir)

async def merge_audio():
    dir = output_dir
    files = os.listdir(dir)
    output = AudioSegment.from_file(dir + files[0], format="wav")
    for i in range(1, len(files)):
        sound = AudioSegment.from_file(dir + files[i], format="wav")
        output = output.append(sound, crossfade=0)
    output.export(result_path, format="wav")
    return result_path

async def call_parler_tts_api(script: List[Tuple[str]]):
    """
    Process an audio request using the Parler TTS model.
    This is the main entry point from the FastAPI endpoint.
    """
    try:
        audio_url = await generate_audio_from_script(script)
        
        return audio_url
    except Exception as e:
        print(f"Error in call_parler_tts_api: {str(e)}")
        raise Exception(f"Failed to generate audio: {str(e)}") 