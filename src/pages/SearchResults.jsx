import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Save, Download, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingOverlay from '@/components/LoadingOverlay';
import { useMeshTerms, generateMeshCombinations } from '@/utils/meshConverter';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchTerm = new URLSearchParams(location.search).get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const projectInfo = location.state?.projectInfo || {};

  const [selectedResults, setSelectedResults] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [savedResults, setSavedResults] = useState([]);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [textAvailability, setTextAvailability] = useState('');
  const [articleType, setArticleType] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meshSearchTerm, setMeshSearchTerm] = useState('');

  const { data: meshTerms, isLoading: isMeshLoading, error: meshError } = useMeshTerms(searchTerm);
  const [meshCombinations, setMeshCombinations] = useState([]);

  useEffect(() => {
    if (meshTerms && meshTerms.length > 0) {
      const combinations = generateMeshCombinations(meshTerms);
      setMeshCombinations(combinations);
      setMeshSearchTerm(combinations[0] || searchTerm);
    } else {
      setMeshCombinations([searchTerm]);
      setMeshSearchTerm(searchTerm);
    }
  }, [meshTerms, searchTerm]);

  const resetFilters = () => {
    setYearFilter('');
    setAuthorFilter('');
    setTextAvailability('');
    setArticleType('');
    setPublicationDate('');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
  };

  const handleSaveResults = () => {
    setSavedResults(selectedResults);
    localStorage.setItem('savedResults', JSON.stringify(selectedResults));
  };

  const handleDownloadResults = () => {
    // Implement download functionality here
  };

  const handleNextStep = () => {
    navigate('/theme-analysis', { state: { themes: savedResults.map(result => result.title).join('\n') } });
  };

  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ['pubmedSearch', meshSearchTerm],
    queryFn: async () => {
      // Implement the actual PubMed API call here
      // This is a placeholder implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: 1, title: 'Sample Article 1', authors: ['Author A', 'Author B'], year: '2023' },
        { id: 2, title: 'Sample Article 2', authors: ['Author C', 'Author D'], year: '2022' },
      ];
    },
    enabled: !!meshSearchTerm,
  });

  return (
    <div className="container mx-auto p-4">
      <LoadingOverlay isLoading={isLoading || isSearchLoading} message="Searching PubMed..." />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Search Results</h1>
        </div>
        <div className="space-x-2">
          <Button onClick={handleSaveResults}>
            <Save className="mr-2 h-4 w-4" /> Save Results
          </Button>
          <Button onClick={handleDownloadResults}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button onClick={handleNextStep}>Next Step</Button>
        </div>
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

      {isMeshLoading ? (
        <p>Converting to MeSH terms...</p>
      ) : meshError ? (
        <p>Error converting to MeSH terms: {meshError.message}</p>
      ) : meshCombinations.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">MeSH Term Combinations:</h3>
          <Select value={meshSearchTerm} onValueChange={setMeshSearchTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Select MeSH combination" />
            </SelectTrigger>
            <SelectContent>
              {meshCombinations.map((combo, index) => (
                <SelectItem key={index} value={combo || `combo_${index}`}>{combo || "No combination available"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p>No MeSH terms found. Using original search term.</p>
      )}

      <div className="flex gap-4">
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
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
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            />

            <Select value={textAvailability} onValueChange={setTextAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Text Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="free_full_text">Free Full Text</SelectItem>
                <SelectItem value="full_text">Full Text</SelectItem>
              </SelectContent>
            </Select>

            <Select value={articleType} onValueChange={setArticleType}>
              <SelectTrigger>
                <SelectValue placeholder="Article Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Books and Documents">Books and Documents</SelectItem>
                <SelectItem value="Clinical Trial">Clinical Trial</SelectItem>
                <SelectItem value="Meta-Analysis">Meta-Analysis</SelectItem>
                <SelectItem value="Randomized Controlled Trial">Randomized Controlled Trial</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Systematic Review">Systematic Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publicationDate} onValueChange={setPublicationDate}>
              <SelectTrigger>
                <SelectValue placeholder="Publication Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_year">1 year</SelectItem>
                <SelectItem value="5_years">5 years</SelectItem>
                <SelectItem value="10_years">10 years</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={resetFilters} className="w-full">Reset Filters</Button>
          </div>
        </div>

        <div className="w-3/4">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults?.map((result) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {savedResults.length > 0 && (
        <Card className="mt-6">
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
              {savedResults.map((result, index) => (
                <div key={result.id} className="flex items-center justify-between mb-2">
                  <span>{result.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSavedResults(savedResults.filter(r => r.id !== result.id));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchResults;