import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to PubMed Search</h1>
      <p className="mb-6 text-lg">
        Discover the latest medical research using simple, everyday language.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link to="/search">Start Searching</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/about">Learn More</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;