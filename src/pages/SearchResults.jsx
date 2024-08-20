import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get('query') || '';
  const [selectedResults, setSelectedResults] = useState([]);

  const fetchPubMedResults = async () => {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=10`);
    const data = await response.json();
    const ids = data.esearchresult.idlist;
    
    const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
    const summaryData = await summaryResponse.json();
    
    return Object.values(summaryData.result).filter(item => item.uid);
  };

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['pubmedSearch', searchTerm],
    queryFn: fetchPubMedResults,
    enabled: !!searchTerm,
  });

  const handleResultSelection = (uid) => {
    setSelectedResults(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSaveSelection = () => {
    console.log('Selected results:', selectedResults);
    // Here you would handle saving the selected results to the project
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{searchTerm}"</h1>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching results. Please try again.</p>}

      {results && (
        <div className="mb-4">
          <Button onClick={handleSaveSelection}>Save Selected Results</Button>
        </div>
      )}

      {results && (
        <div className="grid gap-4">
          {results.map((result) => (
            <Card key={result.uid}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Checkbox
                  id={`result-${result.uid}`}
                  checked={selectedResults.includes(result.uid)}
                  onCheckedChange={() => handleResultSelection(result.uid)}
                />
                <CardTitle>{result.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Authors: {result.authors.map(author => author.name).join(', ')}</p>
                <p className="text-sm text-gray-600">Published: {result.pubdate}</p>
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${result.uid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View on PubMed
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;