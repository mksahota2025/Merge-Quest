import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Puzzle from './pages/Puzzle';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');
  const [teamName, setTeamName] = useState('');

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Lobby 
              setSessionId={setSessionId}
              setAssignedRoom={setAssignedRoom}
              setTeamName={setTeamName}
            />
          } 
        />
        <Route 
          path="/puzzle" 
          element={
            sessionId ? (
              <Puzzle 
                sessionId={sessionId}
                assignedRoom={assignedRoom}
                teamName={teamName}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

