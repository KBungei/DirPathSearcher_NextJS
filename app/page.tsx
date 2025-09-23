"use client";

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SearchResult {
  path: string;
}

const App: React.FC = () => {
  const [rootPath, setRootPath] = useState('');
  const [searchPhrase, setSearchPhrase] = useState('');
  const [inclusionOrderEnforced, setInclusionOrderEnforced] = useState(true);
  const [exclusionOrderEnforced, setExclusionOrderEnforced] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const validateAndRefresh = async () => {
      setIsScanning(true);
      setMessage('Validating and refreshing database, please wait...');
      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
        });
        if (!res.ok) {
          setMessage('Validation failed.');
        }
      } catch (error) {
        setMessage('Validation error.');
      }
      setIsScanning(false);
    };

    validateAndRefresh();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleScan = async () => {
    if (!rootPath) return;
    setIsScanning(true);
    setMessage('Scanning directories, please wait...');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootPath }),
      });
      if (res.ok) {
        setMessage('Scan complete.');
      } else {
        setMessage('Scan failed.');
      }
    } catch (error) {
      setMessage('Scan error.');
    }
    setIsScanning(false);
  };

  const handleSearch = async () => {
    if (!searchPhrase) return;
    setIsScanning(true);
    setMessage('Searching directories, please wait...');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchPhrase, orderEnforced: inclusionOrderEnforced, exclusionOrderEnforced }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results);
        setMessage('Search complete.');
      } else {
        setMessage('Search failed.');
      }
    } catch (error) {
      setMessage('Search error.');
    }
    setIsScanning(false);
  };

  const copyAll = () => {
    const allPaths = searchResults.map((r) => r.path).join('\n');
    navigator.clipboard.writeText(allPaths);
  };

  const copyOne = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  return (
    <div className="container mt-4">
      <h1>Dir Path Searcher</h1>
      <div className="mb-3">
        <label htmlFor="rootPath" className="form-label">
          Directory Path
        </label>
        <input
          type="text"
          id="rootPath"
          className="form-control"
          value={rootPath}
          onChange={(e) => setRootPath(e.target.value)}
          placeholder="Enter directory path"
        />
        <button className="btn btn-primary mt-2" onClick={handleScan} disabled={isScanning}>
          Scan Directory
        </button>
      </div>

      <div className="mb-3">
        <label htmlFor="searchPhrase" className="form-label">
          Search Phrase
        </label>
        <input
          type="text"
          id="searchPhrase"
          className="form-control"
          value={searchPhrase}
          onChange={(e) => setSearchPhrase(e.target.value)}
          placeholder="albums > named > celebrity > rihanna ! low res pics"
        />
        <div className="form-check mt-2">
          <input
            type="checkbox"
            id="inclusionOrderEnforced"
            className="form-check-input"
            checked={inclusionOrderEnforced}
            onChange={() => setInclusionOrderEnforced(!inclusionOrderEnforced)}
          />
          <label htmlFor="inclusionOrderEnforced" className="form-check-label">
            Enforce order of inclusion phrases
          </label>
        </div>
        <div className="form-check mt-2">
          <input
            type="checkbox"
            id="exclusionOrderEnforced"
            className="form-check-input"
            checked={exclusionOrderEnforced}
            onChange={() => setExclusionOrderEnforced(!exclusionOrderEnforced)}
          />
          <label htmlFor="exclusionOrderEnforced" className="form-check-label">
            Enforce order of exclusion phrases (after '!')
          </label>
        </div>
        <button className="btn btn-primary mt-2" onClick={handleSearch} disabled={isScanning}>
          Search
        </button>
      </div>

      {isScanning && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <p>{message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <h2>Search Results</h2>
        <button className="btn btn-secondary mb-2" onClick={copyAll} disabled={searchResults.length === 0}>
          Copy All
        </button>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {searchResults.length === 0 && <p>No results</p>}
          {searchResults.map((result, idx) => (
            <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
              <span>{result.path}</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => copyOne(result.path)}>
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
