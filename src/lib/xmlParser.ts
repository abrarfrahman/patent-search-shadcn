import { XMLParser } from 'fast-xml-parser';
import { Claim, ClaimText } from '@/data/patentDataSchema';

// Recursive function to handle nested claim text
function parseNestedClaimText(claimTextObj: any): (string | ClaimText)[] {
  if (Array.isArray(claimTextObj)) {
    // Recursively handle arrays of claim-text nodes
    return claimTextObj.map(item => parseNestedClaimText(item)).flat();
  }

  if (typeof claimTextObj === 'object' && claimTextObj !== null) {
    const nestedClaimTexts: (string | ClaimText)[] = [];

    // Check for text content in the current node
    if (claimTextObj['#text']) {
      nestedClaimTexts.push(claimTextObj['#text']);
    }

    // Check for nested <claim-text> elements and recursively parse them
    if (claimTextObj['claim-text']) {
      // Recursively parse nested claim-text tags
      const nested = parseNestedClaimText(claimTextObj['claim-text']);
      nestedClaimTexts.push(...nested);
    }

    // Return the ClaimText object with both text and nested elements
    return [{
      text: claimTextObj['#text'] || undefined,
      nested: nestedClaimTexts.length > 1 ? nestedClaimTexts : undefined
    }];
  }

  // Base case: return the string directly if it's not an object or array
  if (typeof claimTextObj === 'string') {
    return [claimTextObj];
  }

  // Return an empty array for unsupported types
  return [];
}

export function parseClaimsXml(claimsXml: string): Claim[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      trimValues: true,
    });
    const result = parser.parse(claimsXml);

    // Ensure that result.claims.claim is always an array
    let claims = result.claims.claim;
    if (!Array.isArray(claims)) {
      claims = [claims];
    }

    const parsedClaims: Claim[] = claims.map((claim: any) => {
      return {
        id: claim.id,
        num: claim.num,
        'claim-text': parseNestedClaimText(claim['claim-text']),
      };
    });

    return parsedClaims;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}
