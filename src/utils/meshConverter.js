import { useQuery } from '@tanstack/react-query';

const API_KEY = '1d4ccfa738c68098e6d65207184849e55408'; // In production, use an environment variable
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000); // Wait for 1 second before retrying
    }
  }
};

const fetchMeshTerms = async (searchTerm) => {
  try {
    const searchUrl = `${BASE_URL}esearch.fcgi?db=mesh&term=${encodeURIComponent(searchTerm)}&retmode=json&api_key=${API_KEY}`;
    const data = await fetchWithRetry(searchUrl);
    
    const meshIds = data.esearchresult.idlist;
    if (meshIds.length === 0) {
      return [];
    }
    
    const summaryUrl = `${BASE_URL}esummary.fcgi?db=mesh&id=${meshIds.join(',')}&retmode=json&api_key=${API_KEY}`;
    const meshData = await fetchWithRetry(summaryUrl);
    
    const meshTerms = Object.values(meshData.result)
      .filter(item => item.uid)
      .map(item => item.name);
    
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
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 60, // 1 hour
    onError: (error) => {
      console.error('Error in useMeshTerms:', error);
    },
  });
};

export const generateMeshCombinations = (meshTerms, maxCombinations = 5) => {
  if (!meshTerms || meshTerms.length === 0) {
    return [];
  }
  
  const combinations = [];
  const queue = meshTerms.map(term => ({ terms: [term], score: 1 }));
  
  while (combinations.length < maxCombinations && queue.length > 0) {
    const { terms, score } = queue.shift();
    combinations.push(terms.join(' AND '));
    
    if (terms.length < 3) { // Limit to 3-term combinations
      for (const term of meshTerms) {
        if (!terms.includes(term)) {
          queue.push({ 
            terms: [...terms, term], 
            score: score * (meshTerms.indexOf(term) + 1)
          });
        }
      }
      queue.sort((a, b) => a.score - b.score);
    }
  }
  
  return combinations;
};
