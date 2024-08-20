import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPubMedResults = async () => {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=10`);
    const data = await response.json();
    const ids = data.esearchresult.idlist;
    
    const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
    const summaryData = await summaryResponse.json();
    
    return Object.values(summaryData.result).filter(item => item.uid);
  };

  const { data: results, isLoading, isError, refetch } = useQuery({
    queryKey: ['pubmedSearch', searchTerm],
    queryFn: fetchPubMedResults,
    enabled: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">PubMed Search</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter your search query in casual language"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching results. Please try again.</p>}

      {results && (
        <div className="grid gap-4">
          {results.map((result) => (
            <Card key={result.uid}>
              <CardHeader>
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

export default Search;