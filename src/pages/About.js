import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">About Holly</h1>
      <p className="mb-4">
        Welcome to Holly, your intelligent PubMed research assistant! This tool allows you to search for medical and scientific literature using casual language, and organize your research into projects.
      </p>
      <p className="mb-4">
        Holly uses the PubMed API to fetch the most relevant articles based on your search queries. You can easily access the latest research and publications in various fields of medicine and science, all within the context of your specific projects.
      </p>
      <p className="mb-4">
        To get started, create a new project or select an existing one from the home page. Then, enter your query in everyday language on the Search page. Our system will interpret your request and return the most relevant results from PubMed's extensive database.
      </p>
      <p>
        With Holly, you can keep your research organized, collaborate with team members, and stay up-to-date with the latest developments in your field of interest.
      </p>
    </div>
  );
};

export default About;