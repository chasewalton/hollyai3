import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">About PubMed Search</h1>
      <p className="mb-4">
        Welcome to our PubMed Search application! This tool allows you to search for medical and scientific literature using casual language.
      </p>
      <p className="mb-4">
        Our application uses the PubMed API to fetch the most relevant articles based on your search query. You can easily access the latest research and publications in various fields of medicine and science.
      </p>
      <p>
        To get started, simply go to the Search page and enter your query in everyday language. Our system will interpret your request and return the most relevant results from PubMed's extensive database.
      </p>
    </div>
  );
};

export default About;