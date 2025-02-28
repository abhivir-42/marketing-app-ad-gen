export interface Script {
  line: string;
  artDirection: string;
}

export interface GenerateScriptResponse {
  success: boolean;
  script: Script[];
}

export interface ValidationMetadata {
  had_unauthorized_changes: boolean;
  reverted_changes: Array<{
    index: number;
    original: Script;
    attempted: Script;
  }>;
  had_length_mismatch: boolean;
  original_length: number;
  received_length: number;
  error?: string;
}

export interface RefineScriptResponse {
  status: string;
  data: Script[];  // Now contains only modified sentences
  modified_indices: number[];  // Indices of sentences that were modified
  validation?: ValidationMetadata;
}

export interface GenerateAudioResponse {
  audioUrl: string;
}

export interface ApiError {
  error: string;
}