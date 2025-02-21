export interface Script {
  line: string;
  artDirection: string;
}

export interface GenerateScriptResponse {
  script: Script[];
}

export interface RefineScriptResponse {
  script: Script[];
}

export interface GenerateAudioResponse {
  audioUrl: string;
}

export interface ApiError {
  error: string;
}