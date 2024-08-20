import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Save, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeshTerms, generateMeshCombinations } from '@/utils/meshConverter';

const API_KEY = '1d4ccfa738c68098e6d65207184849e55408';
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchTerm = new URLSearchParams(location.search).get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const projectInfo = location.state?.projectInfo || {};

  const [selectedResults, setSelectedResults] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    author: '',
    textAvailability: '',
    articleType: '',
    publicationDate: '',
  });
  const [savedResults, setSavedResults] = useState(() => {
    const saved = localStorage.getItem('savedResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [selectedMeshTerms, setSelectedMeshTerms] = useState([]);

  const { data: meshTerms, isLoading: isMeshLoading, error: meshError } = useMeshTerms(searchTerm);

  const meshCombinations = useMemo(() => {
    if (meshTerms && meshTerms.length > 0) {
      return generateMeshCombinations(meshTerms);
    }
    return [searchTerm];
  }, [meshTerms, searchTerm]);

  const meshSearchTerm = useMemo(() => {
    return selectedMeshTerms.length > 0
      ? selectedMeshTerms.join(' OR ')
      : meshCombinations[0] || searchTerm;
  }, [selectedMeshTerms, meshCombinations, searchTerm]);

  const resetFilters = useCallback(() => {
    setFilters({
      year: '',
      author: '',
      textAvailability: '',
      articleType: '',
      publicationDate: '',
    });
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchPubMedResults = async () => {
    const searchUrl = `${BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(meshSearchTerm)}&retmode=json&retmax=100&api_key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult.idlist;
    
    const summaryUrl = `${BASE_URL}esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&api_key=${API_KEY}`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    return Object.values(summaryData.result).filter(item => item.uid).map(item => ({
      id: item.uid,
      title: item.title,
      authors: item.authors.map(author => author.name),
      year: item.pubdate.split(' ')[0],
      uid: item.uid
    }));
  };

  const { data: searchResults, isLoading: isSearchLoading, error: searchError, refetch } = useQuery({
    queryKey: ['pubmedSearch', meshSearchTerm, filters],
    queryFn: fetchPubMedResults,
    enabled: !!meshSearchTerm,
  });

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    refetch();
  }, [refetch]);

  const handleSaveResults = useCallback(() => {
    const updatedResults = [...savedResults, ...selectedResults];
    setSavedResults(updatedResults);
    localStorage.setItem('savedResults', JSON.stringify(updatedResults));
  }, [savedResults, selectedResults]);

  const handleDownloadResults = useCallback(() => {
    const resultsText = selectedResults.map(result => 
      `Title: ${result.title}\nAuthors: ${result.authors.join(', ')}\nYear: ${result.year}\nPubMed ID: ${result.uid}\nPubMed Link: https://pubmed.ncbi.nlm.nih.gov/${result.uid}/\n\n`
    ).join('');
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pubmed_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedResults]);

  const handleNextStep = useCallback(() => {
    navigate('/theme-analysis', { state: { themes: savedResults.map(result => result.title).join('\n') } });
  }, [navigate, savedResults]);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.filter(result => {
      return (
        (!filters.year || result.year === filters.year) &&
        (!filters.author || result.authors.some(author => author.toLowerCase().includes(filters.author.toLowerCase())))
      );
    });
  }, [searchResults, filters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMeshTermSelection = useCallback((term) => {
    setSelectedMeshTerms(prev => {
      if (prev.includes(term)) {
        return prev.filter(t => t !== term);
      } else {
        return [...prev, term];
      }
    });
  }, []);

  const MeshTermsSection = ({ 
    isMeshLoading, 
    meshError, 
    meshCombinations, 
    selectedMeshTerms,
    handleMeshTermSelection,
    originalSearchTerm 
  }) => {
    if (isMeshLoading) {
      return (
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (meshError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to convert to MeSH terms: {meshError.message}. Using original search term.
          </AlertDescription>
        </Alert>
      );
    }

    if (meshCombinations.length === 0) {
      return (
        <Alert className="mb-4">
          <AlertTitle>No MeSH Terms Found</AlertTitle>
          <AlertDescription>
            No MeSH terms were found for "{originalSearchTerm}". Your search will use the original term.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">MeSH Term Combinations:</h3>
        <div className="space-y-2">
          {meshCombinations.map((combo, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`mesh-${index}`}
                checked={selectedMeshTerms.includes(combo)}
                onCheckedChange={() => handleMeshTermSelection(combo)}
              />
              <label htmlFor={`mesh-${index}`} className="text-sm">
                {combo || `No combination available`}
              </label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="original-term"
              checked={selectedMeshTerms.includes(originalSearchTerm)}
              onCheckedChange={() => handleMeshTermSelection(originalSearchTerm)}
            />
            <label htmlFor="original-term" className="text-sm">
              Original: {originalSearchTerm || 'No original term'}
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Search Results</h1>
        </div>
        <Button onClick={handleNextStep}>Next Step</Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Refine your search query"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      <MeshTermsSection
        isMeshLoading={isMeshLoading}
        meshError={meshError}
        meshCombinations={meshCombinations}
        selectedMeshTerms={selectedMeshTerms}
        handleMeshTermSelection={handleMeshTermSelection}
        originalSearchTerm={searchTerm}
      />

      <div className="flex gap-4">
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                {['2024', '2023', '2022', '2021', '2020'].map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by Author"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            />

            <Button onClick={resetFilters} className="w-full">Reset Filters</Button>
          </div>
        </div>

        <div className="w-2/4">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="flex justify-between mb-4">
            <Button onClick={handleSaveResults}>
              <Save className="mr-2 h-4 w-4" /> Save Results
            </Button>
            <Button onClick={handleDownloadResults}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
          {searchError ? (
            <p>Error fetching search results: {searchError.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedResults.some(r => r.id === result.id)}
                        onCheckedChange={(checked) => {
                          setSelectedResults(prev =>
                            checked
                              ? [...prev, result]
                              : prev.filter(r => r.id !== result.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{result.title}</TableCell>
                    <TableCell>{result.authors.join(', ')}</TableCell>
                    <TableCell>{result.year}</TableCell>
                    <TableCell>
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${result.uid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                        PubMed <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Saved Results</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                >
                  {isTimelineExpanded ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CardTitle>
            </CardHeader>
            {isTimelineExpanded && (
              <CardContent>
                {savedResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between mb-2">
                    <span>{result.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSavedResults(prev => prev.filter(r => r.id !== result.id));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;