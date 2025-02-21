export interface Script {
  line: string;
  artDirection: string;
}

export interface GenerateScriptResponse {
  success: boolean;
  script: Script[];
}

export interface RefineScriptResponse {
  status: string;
  data: Script[];
}

export interface GenerateAudioResponse {
  audioUrl: string;
}

export interface ApiError {
  error: string;
}