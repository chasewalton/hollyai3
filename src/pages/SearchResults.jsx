import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get('query') || '';
  const [selectedResults, setSelectedResults] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');

  const fetchPubMedResults = async () => {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=20`);
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

  const handleDownloadPDFs = () => {
    // This is a placeholder function. In a real-world scenario, you'd need to
    // check for freely available PDFs and handle the download process.
    console.log('Downloading PDFs for:', selectedResults);
    alert('Downloading PDFs for selected articles. This feature requires integration with PubMed Central API.');
  };

  const filteredResults = results?.filter(result => {
    const yearMatch = !yearFilter || result.pubdate.includes(yearFilter);
    const authorMatch = !authorFilter || result.authors.some(author => 
      author.name.toLowerCase().includes(authorFilter.toLowerCase())
    );
    return yearMatch && authorMatch;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{searchTerm}"</h1>

      <div className="mb-4 flex space-x-4">
        <Select onValueChange={setYearFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Year" />
          </SelectTrigger>
          <SelectContent>
            {['2023', '2022', '2021', '2020', '2019'].map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by Author"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="w-[200px]"
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching results. Please try again.</p>}

      {filteredResults && (
        <div className="mb-4 space-x-2">
          <Button onClick={handleSaveSelection}>Save Selected Results</Button>
          <Button onClick={handleDownloadPDFs}>Download Selected PDFs</Button>
        </div>
      )}

      {filteredResults && (
        <div className="grid gap-4">
          {filteredResults.map((result) => (
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