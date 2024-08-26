export interface Patent {
    id: string;
    country_code: string;
    kind_code: string;
    title?: string;
    abstract?: string;
    description?: string;
    description_xml?: string;
    claims?: string;
    claims_xml?: string;
    publication_date?: string;
    filing_date?: string; 
    grant_date?: string; 
    priority_date?: string; 
    inventors: string[];
    assignees: string[];
}
  
export interface PatentSearchResult {
    id: string;
    title: string;
    abstract: string;
    priority_date?: string;
    inventors: string;
    assignees: string;
}

export interface Claim {
    id: string;
    num: string;
    'claim-text': (string | ClaimText)[];
}
  
export interface ClaimText {
    text?: string;
    nested?: (string | ClaimText)[];
}
  
  