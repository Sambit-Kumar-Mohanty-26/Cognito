export type ProvenanceStatus = 
  | 'unverified'
  | 'pending'
  | 'verified-authentic'
  | 'caution-advised'
  | 'warning-manipulated';

export interface ProvenanceResult {
  status: ProvenanceStatus;
  findings: string; 
}

export interface ResearchCard {
  id: number; 
  type: 'text' | 'image';
  content: string | Blob; 
  sourceUrl: string; 
  createdAt: number; 
  summary: string; 
  tags: string[]; 
  provenance?: ProvenanceResult; 
}
export type View = 'Notebook' | 'Dashboard' | 'WritingStudio' | 'Dev';