class FishVoiceModel():
    def __init__(self, api_key: str):
        self.api_key = api_key
        from fish_audio_sdk import Session, TTSRequest
        self.client = Session(api_key)
        self.TTSRequest = TTSRequest
    
    def tts(self, text: str, **kwargs) -> bytes:
        voice = kwargs.get("voice", "default")
        model_id = kwargs.get("model_id")
        
        if model_id:
            request = self.TTSRequest(text=text, reference_id=model_id)
        else:
            request = self.TTSRequest(text=text, voice=voice)
        
        audio_data = b""
        for chunk in self.client.tts(request):
            audio_data += chunk
        return audio_data
    
    def train_custom_voice(self, title: str, description: str, voice_files: list, 
                         texts: list, visibility: str = "private", **kwargs) -> str:
        """训练自定义语音模型"""
        voices = []
        for voice_file in voice_files:
            with open(voice_file, "rb") as f:
                voices.append(f.read())
        
        model = self.client.create_model(
            title=title,
            description=description,
            voices=voices,
            texts=texts,
            visibility=visibility
        )
        print(f"Created voice model: {model.id}")
        return model.id
    
    def tts_to_file(self, text: str, output_file: str, **kwargs):
        audio_data = self.tts(text, **kwargs)
        with open(output_file, "wb") as f:
            f.write(audio_data)
        print(f"Audio saved to: {output_file}")

if __name__ == "__main__":
    api_key = ""
    fish_model = FishVoiceModel(api_key=api_key)
    fish_model.tts_to_file("Hello, this is a test.", "output.wav", voice="default")