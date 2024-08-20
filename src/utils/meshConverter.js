import { useQuery } from '@tanstack/react-query';

const fetchMeshTerms = async (searchTerm) => {
  try {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=mesh&term=${encodeURIComponent(searchTerm)}&retmode=json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const meshIds = data.esearchresult.idlist;

    if (meshIds.length === 0) {
      console.log('No MeSH terms found for the given search term');
      return [];
    }

    const meshResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=mesh&id=${meshIds.join(',')}&retmode=json`);
    if (!meshResponse.ok) {
      throw new Error(`HTTP error! status: ${meshResponse.status}`);
    }
    const meshData = await meshResponse.json();
    
    const meshTerms = Object.values(meshData.result).filter(item => item.uid).map(item => item.name);
    
    if (meshTerms.length === 0) {
      console.log('No valid MeSH terms found in the response');
      return [];
    }
    
    return meshTerms;
  } catch (error) {
    console.error('Error fetching MeSH terms:', error);
    throw error;
  }
};

export const useMeshTerms = (searchTerm) => {
  return useQuery({
    queryKey: ['meshTerms', searchTerm],
    queryFn: () => fetchMeshTerms(searchTerm),
    enabled: !!searchTerm,
    retry: 1,
    onError: (error) => {
      console.error('Error in useMeshTerms:', error);
    },
  });
};

export const generateMeshCombinations = (meshTerms, maxCombinations = 5) => {
  if (!meshTerms || meshTerms.length === 0) {
    console.log('No MeSH terms provided for combinations');
    return [];
  }

  const combinations = [];
  
  for (let i = 0; i < meshTerms.length; i++) {
    combinations.push(meshTerms[i]);
    if (combinations.length >= maxCombinations) break;
    
    for (let j = i + 1; j < meshTerms.length; j++) {
      combinations.push(`${meshTerms[i]} AND ${meshTerms[j]}`);
      if (combinations.length >= maxCombinations) break;
    }
    
    if (combinations.length >= maxCombinations) break;
  }
  
  return combinations.slice(0, maxCombinations);
};