import React, { useState } from 'react';

function App() {
  const [teamName, setTeamName] = useState('');
  const [emails, setEmails] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');
  const [fetchSessionId, setFetchSessionId] = useState('');
  const [fetchedRoom, setFetchedRoom] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const startSession = async () => {
    try {
      const res = await fetch('http://localhost:3000/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          emails: emails.split(',').map(e => e.trim())
        })
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setAssignedRoom(data.assignedRoom);
    } catch (error) {
      alert('Error starting session. Please try again.');
    }
  };

  const getAssignedRoom = async () => {
    try {
      const res = await fetch(`http://localhost:3000/get-room?sessionId=${fetchSessionId}`);
      const data = await res.json();
      if (data.assignedRoom) {
        setFetchedRoom(data.assignedRoom);
      } else {
        alert('Session not found.');
      }
    } catch (error) {
      alert('Error fetching room. Please try again.');
    }
  };

  const submitSolution = async () => {
    try {
      const res = await fetch('http://localhost:3000/submit-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, repoUrl })
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert('Error submitting solution. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Merge Quest Lobby</h1>

        {!sessionId ? (
          <>
            <input
              type="text"
              placeholder="Team Name"
              className="border p-2 w-full mb-4 rounded"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />
            <textarea
              placeholder="Emails (comma-separated)"
              className="border p-2 w-full mb-4 rounded"
              value={emails}
              onChange={e => setEmails(e.target.value)}
            />
            <button
              onClick={startSession}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Start Session
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl">Session Started!</p>
            <p className="mt-2">Session ID: <strong>{sessionId}</strong></p>
            <p>Assigned Room: <strong>{assignedRoom}</strong></p>
          </div>
        )}

        {sessionId && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Submit your PR URL</h2>
            <input
              type="text"
              placeholder="Paste PR URL here"
              className="border p-2 w-full mb-4 rounded"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
            />
            <button
              onClick={submitSolution}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Submit Solution
            </button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">Already have a Session ID?</h2>
          <input
            type="text"
            placeholder="Enter Session ID"
            className="border p-2 w-full mb-4 rounded"
            value={fetchSessionId}
            onChange={e => setFetchSessionId(e.target.value)}
          />
          <button
            onClick={getAssignedRoom}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Fetch Assigned Room
          </button>

          {fetchedRoom && (
            <div className="mt-4 text-center">
              <p>Assigned Room: <strong>{fetchedRoom}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

