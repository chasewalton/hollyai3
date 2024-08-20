import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [projectTitle, setProjectTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [projectType, setProjectType] = useState('');
  const [numParagraphs, setNumParagraphs] = useState('');
  const [numReferences, setNumReferences] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const title = params.get('projectTitle');
    if (title) {
      setProjectTitle(title);
    }
  }, [location]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (parseInt(numReferences) >= 30) {
      alert("Number of references must be less than 30");
      return;
    }
    const projectInfo = {
      projectTitle,
      firstName,
      lastName,
      email,
      phoneNumber,
      projectType,
      numParagraphs,
      numReferences,
      searchTerm
    };
    navigate('/search-results', { 
      state: { projectInfo },
      search: `?query=${encodeURIComponent(searchTerm)}`
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">Project Information</h1>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="projectTitle">Project Title</Label>
          <Input
            id="projectTitle"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger id="projectType">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="research">Research Paper</SelectItem>
              <SelectItem value="review">Literature Review</SelectItem>
              <SelectItem value="thesis">Thesis</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numParagraphs">Number of Paragraphs</Label>
            <Select value={numParagraphs} onValueChange={setNumParagraphs}>
              <SelectTrigger id="numParagraphs">
                <SelectValue placeholder="Select number of paragraphs" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="numReferences">Number of References</Label>
            <Input
              id="numReferences"
              type="number"
              value={numReferences}
              onChange={(e) => setNumReferences(e.target.value)}
              min="1"
              max="29"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">PubMed Search</h2>
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
    </div>
  );
};

export default Search;