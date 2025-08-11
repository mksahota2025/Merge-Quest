import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Puzzle({ sessionId, assignedRoom, teamName }) {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const fetchVulnerabilities = async () => {
      try {
        const response = await fetch(`http://localhost:5001/vulnerabilities?room=${assignedRoom}`, {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vulnerabilities');
        }

        const data = await response.json();
        setVulnerabilities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVulnerabilities();
  }, [sessionId, assignedRoom, navigate]);

  const handleSubmitFix = async (vulnerabilityId, fix) => {
    try {
      const response = await fetch('http://localhost:5001/submit-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          vulnerabilityId,
          fix,
          room: assignedRoom
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit fix');
      }

      const data = await response.json();
      if (data.success) {
        setScore(prevScore => prevScore + data.points);
        setVulnerabilities(prev => 
          prev.map(v => v.id === vulnerabilityId ? { ...v, fixed: true } : v)
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading vulnerabilities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vulnerability Hunt</h1>
          <div className="text-xl">
            Score: <span className="font-bold">{score}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-lg">
            Team: <span className="font-semibold">{teamName}</span>
          </p>
          <p className="text-lg">
            Room: <span className="font-semibold">{assignedRoom}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {vulnerabilities.map((vulnerability) => (
            <div
              key={vulnerability.id}
              className={`bg-white p-6 rounded-lg shadow ${
                vulnerability.fixed ? 'border-2 border-green-500' : ''
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{vulnerability.title}</h2>
              <p className="text-gray-600 mb-4">{vulnerability.description}</p>
              <div className="mb-4">
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code>{vulnerability.code}</code>
                </pre>
              </div>
              {!vulnerability.fixed && (
                <div className="space-y-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    placeholder="Enter your fix here..."
                    onChange={(e) => {
                      setVulnerabilities(prev =>
                        prev.map(v =>
                          v.id === vulnerability.id
                            ? { ...v, proposedFix: e.target.value }
                            : v
                        )
                      );
                    }}
                  />
                  <button
                    onClick={() => handleSubmitFix(vulnerability.id, vulnerability.proposedFix)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Submit Fix
                  </button>
                </div>
              )}
              {vulnerability.fixed && (
                <div className="text-green-600 font-semibold">
                  ✓ Fixed! +{vulnerability.points} points
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Puzzle; 