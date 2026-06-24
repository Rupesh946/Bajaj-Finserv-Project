import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Hash, 
  GitCommit, 
  AlertOctagon, 
  Loader2, 
  Check, 
  ChevronDown, 
  X, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import './App.css';

// API Endpoint configurations
let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/bfhl';
if (rawApiUrl && !rawApiUrl.endsWith('/bfhl')) {
  rawApiUrl = rawApiUrl.replace(/\/$/, '') + '/bfhl';
}
const API_URL = rawApiUrl;

// Identity settings
const STUDENT_USER_ID = "rupesh_231099";
const STUDENT_EMAIL = "rupesh2276.be23@chitkara.edu.in";
const STUDENT_ROLL = "2310992276";

// Preset configurations
const PRESETS = {
  workedExample: {
    name: "Worked Example",
    description: "Runs the complete Part 9 specification test case",
    data: [
      "A->B", "A->C", "B->D", "C->E", "E->F",
      "X->Y", "Y->Z", "Z->X",
      "P->Q", "Q->R",
      "G->H", "G->H", "G->I",
      "hello", "1->2", "A->"
    ]
  },
  simpleTrees: {
    name: "Acyclic Trees",
    description: "Evaluates standard trees and depth calculation",
    data: [
      "M->N", "N->O", "O->P", "Q->R", "R->S"
    ]
  },
  cycles: {
    name: "Cyclic Graph",
    description: "Checks cycle detection and cycle resolution rules",
    data: [
      "A->B", "B->C", "C->A", "D->E", "E->D"
    ]
  },
  diamond: {
    name: "Diamond Resolution",
    description: "Asserts that only the first encountered parent wins",
    data: [
      "A->C", "B->C", "X->C"
    ]
  }
};

// Recursive Tree Node Renderer Component
function TreeNode({ nodeName, childrenObj, depth = 0 }) {
  const children = Object.keys(childrenObj || {});
  
  return (
    <div 
      className="tree-node" 
      style={{ 
        marginLeft: depth > 0 ? '1.5rem' : '0px',
        borderLeft: depth > 0 ? '1px dashed rgba(139, 92, 246, 0.2)' : 'none',
        paddingLeft: depth > 0 ? '1rem' : '0px',
        marginTop: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="tree-node-dot" style={{ backgroundColor: depth === 0 ? 'var(--accent-purple)' : 'var(--accent-blue)' }}></span>
        <span className="tree-node-label" style={{ fontWeight: depth === 0 ? '700' : '500' }}>{nodeName}</span>
      </div>
      
      {children.length > 0 && (
        <div className="tree-node-children">
          {children.map(child => (
            <TreeNode key={child} nodeName={child} childrenObj={childrenObj[child]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Tree view wrapper component
function TreeView({ rootName, treeObj }) {
  const childrenObj = treeObj[rootName] || {};
  return (
    <div className="tree-view-wrapper">
      <TreeNode nodeName={rootName} childrenObj={childrenObj} depth={0} />
    </div>
  );
}

function App() {
  const [jsonInput, setJsonInput] = useState('{\n  "data": [\n    "A->B", "A->C", "B->D", "C->E", "E->F",\n    "X->Y", "Y->Z", "Z->X",\n    "P->Q", "Q->R",\n    "G->H", "G->H", "G->I",\n    "hello", "1->2", "A->"\n  ]\n}');
  
  // App states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  
  // Filter settings
  const [selectedFilters, setSelectedFilters] = useState(['Hierarchies', 'Duplicate Edges', 'Invalid Entries']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close filter dropdown if click registers outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-fill input payload
  const loadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    setJsonInput(JSON.stringify({ data: preset.data }, null, 2));
    setError('');
  };

  // Live JSON validation
  const validateJSON = (str) => {
    try {
      const parsed = JSON.parse(str);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'JSON payload must be a root object.' };
      }
      if (!parsed.data || !Array.isArray(parsed.data)) {
        return { valid: false, error: 'Payload must contain a "data" array of edge strings.' };
      }
      return { valid: true, data: parsed };
    } catch (err) {
      return { valid: false, error: `JSON format syntax error: ${err.message}` };
    }
  };

  // Submit edges to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    const validation = validateJSON(jsonInput);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validation.data)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || `API server returned HTTP status code ${res.status}`);
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(`API Connection Error: ${err.message || 'Request failed or backend offline.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter option toggle
  const filterOptions = ['Hierarchies', 'Duplicate Edges', 'Invalid Entries'];
  
  const toggleFilter = (option) => {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter(item => item !== option));
    } else {
      setSelectedFilters([...selectedFilters, option]);
    }
  };

  return (
    <div className="app-container">
      {/* Visual Header */}
      <header className="app-header">
        <h1 className="app-logo-text">Graph Validator</h1>
        <p className="app-subtitle">
          Chitkara Full Stack Submission. Parse node relations, identify cycles, resolve diamond loops, and compile tree graphs in real-time.
        </p>
      </header>

      {/* Preset selections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeInDown var(--transition-normal)' }}>
        <span className="input-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Quick Presets Loaders</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {Object.keys(PRESETS).map(key => (
            <button
              key={key}
              type="button"
              className="glass-card"
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
              onClick={() => loadPreset(key)}
              title={PRESETS[key].description}
            >
              <strong>{PRESETS[key].name}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Input payload form */}
      <main className="input-section glass-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <div className="label-container">
              <label htmlFor="json-input" className="input-label">JSON Data Payload</label>
              <span className="label-hint">Paste edges list below</span>
            </div>
            <textarea
              id="json-input"
              className="json-textarea"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{ "data": ["A->B"] }'
              rows={8}
            />
          </div>

          <div className="actions-row">
            {error && (
              <div className="error-message">
                <AlertOctagon size={16} />
                <span>{error}</span>
              </div>
            )}
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
              id="submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  Analyzing Graph...
                </>
              ) : (
                'Submit Payload'
              )}
            </button>
          </div>
        </form>
      </main>

      {/* API response summary & filtering cards */}
      {response && (
        <section className="filter-section glass-card" id="results-section">
          {/* Summary statistics badge card */}
          {response.summary && (
            <div 
              className="result-card" 
              style={{ 
                gridColumn: '1 / -1', 
                background: 'rgba(59, 130, 246, 0.03)',
                borderColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft: '4px solid var(--accent-blue)'
              }}
            >
              <div className="result-card-header">
                <div className="result-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Layers size={18} />
                </div>
                <h3 className="result-card-title">Graph Structural Summary</h3>
              </div>
              <div className="file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="meta-field">
                  <span className="meta-label">Total Non-Cyclic Trees</span>
                  <span className="meta-value" style={{ color: '#60a5fa', fontSize: '1.35rem', fontWeight: '800' }}>{response.summary.total_trees}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-label">Total Cyclic Groups</span>
                  <span className="meta-value" style={{ color: 'var(--accent-rose)', fontSize: '1.35rem', fontWeight: '800' }}>{response.summary.total_cycles}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-label">Largest Tree Root</span>
                  <span className="meta-value" style={{ color: '#34d399', fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {response.summary.largest_tree_root ? (
                      <>
                        <Sparkles size={16} />
                        {response.summary.largest_tree_root}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pill filters dropdown */}
          <div className="filter-controls">
            <label className="input-label">Filter Visual Output Fields</label>
            
            <div className="multi-select-container" ref={dropdownRef}>
              <div 
                className="multi-select-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                id="filter-dropdown"
              >
                {selectedFilters.length === 0 ? (
                  <span className="trigger-placeholder">Select fields to show...</span>
                ) : (
                  selectedFilters.map(filter => (
                    <span key={filter} className="selected-pill">
                      {filter}
                      <button 
                        type="button" 
                        className="pill-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFilter(filter);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
                <span className="select-dropdown-indicator">
                  <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </span>
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {filterOptions.map(option => {
                    const isSelected = selectedFilters.includes(option);
                    return (
                      <div 
                        key={option}
                        className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleFilter(option)}
                      >
                        <div className="checkbox-custom">
                          {isSelected && <Check size={12} className="checkbox-check" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Result outputs list */}
          <div className="results-grid">
            
            {/* Hierarchies listing */}
            {selectedFilters.includes('Hierarchies') && (
              <div className="result-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--accent-purple)' }}>
                <div className="result-card-header">
                  <div className="result-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}><Network size={18} /></div>
                  <h3 className="result-card-title">Processed Hierarchies</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.75rem' }}>
                  {response.hierarchies && response.hierarchies.length > 0 ? (
                    response.hierarchies.map((h, index) => (
                      <div 
                        key={index}
                        style={{ 
                          padding: '1rem', 
                          borderRadius: '10px', 
                          background: 'rgba(15, 23, 42, 0.3)',
                          border: '1px solid var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Root Node: <strong style={{ color: 'white', fontSize: '1rem' }}>{h.root}</strong>
                          </span>
                          {h.has_cycle ? (
                            <span 
                              style={{ 
                                padding: '2px 8px', 
                                background: 'rgba(244, 63, 94, 0.15)', 
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#fda4af',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <AlertOctagon size={12} />
                              Cycle Detected
                            </span>
                          ) : (
                            <span 
                              style={{ 
                                padding: '2px 8px', 
                                background: 'rgba(16, 185, 129, 0.15)', 
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#a7f3d0',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              Acyclic Tree (Depth: {h.depth})
                            </span>
                          )}
                        </div>

                        {h.has_cycle ? (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Info size={14} /> Tree rendering skipped for cyclic component. Lexicographically smallest node is labeled root.
                          </div>
                        ) : (
                          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                            <TreeView rootName={h.root} treeObj={h.tree} />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="result-empty">No hierarchies generated. Ensure data contains valid edges.</span>
                  )}
                </div>
              </div>
            )}

            {/* Duplicate Edges Card */}
            {selectedFilters.includes('Duplicate Edges') && (
              <div className="result-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                <div className="result-card-header">
                  <div className="result-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}><GitCommit size={18} /></div>
                  <h3 className="result-card-title">Duplicate Edges</h3>
                </div>
                <div className="result-items-container" style={{ marginTop: '0.75rem' }}>
                  {response.duplicate_edges && response.duplicate_edges.length > 0 ? (
                    response.duplicate_edges.map((edge, i) => (
                      <span key={i} className="result-pill" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#93c5fd' }}>{edge}</span>
                    ))
                  ) : (
                    <span className="result-empty">No duplicate edge connections</span>
                  )}
                </div>
              </div>
            )}

            {/* Invalid Entries Card */}
            {selectedFilters.includes('Invalid Entries') && (
              <div className="result-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
                <div className="result-card-header">
                  <div className="result-card-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' }}><AlertOctagon size={18} /></div>
                  <h3 className="result-card-title">Invalid Entries</h3>
                </div>
                <div className="result-items-container" style={{ marginTop: '0.75rem' }}>
                  {response.invalid_entries && response.invalid_entries.length > 0 ? (
                    response.invalid_entries.map((item, i) => (
                      <span key={i} className="result-pill" style={{ borderColor: 'rgba(244,63,94,0.3)', color: '#fecdd3' }}>{item === "" ? "(empty string)" : item}</span>
                    ))
                  ) : (
                    <span className="result-empty">No invalid entries detected</span>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* Identity bottom Banner */}
      <footer className="identity-banner">
        <div className="identity-left">
          <span>Student Portal</span>
          <span className="user-badge">{STUDENT_USER_ID}</span>
        </div>
        <div className="identity-right">
          <span>Roll No: <strong>{STUDENT_ROLL}</strong></span>
          <span>Email: <a href={`mailto:${STUDENT_EMAIL}`} className="identity-link">{STUDENT_EMAIL}</a></span>
        </div>
      </footer>
    </div>
  );
}

export default App;
