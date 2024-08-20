import { useQuery } from '@tanstack/react-query';

const fetchMeshTerms = async (searchTerm) => {
  const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=mesh&term=${encodeURIComponent(searchTerm)}&retmode=json`);
  const data = await response.json();
  const meshIds = data.esearchresult.idlist;

  if (meshIds.length === 0) {
    return [];
  }

  const meshResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=mesh&id=${meshIds.join(',')}&retmode=json`);
  const meshData = await meshResponse.json();
  
  return Object.values(meshData.result).filter(item => item.uid).map(item => item.name);
};

export const useMeshTerms = (searchTerm) => {
  return useQuery({
    queryKey: ['meshTerms', searchTerm],
    queryFn: () => fetchMeshTerms(searchTerm),
    enabled: !!searchTerm,
  });
};

export const generateMeshCombinations = (meshTerms, maxCombinations = 5) => {
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