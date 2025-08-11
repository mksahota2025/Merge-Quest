import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

function Success({ teamName, assignedRoom }) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shareText = `We escaped the ${assignedRoom} puzzle in Merge Quest! 🧩 #MergeQuest #EscapeRoom #CodingChallenge`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}`,
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
      />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 z-10"
      >
        <h1 className="text-6xl font-bold text-green-400 mb-4">
          🎉 You Escaped! 🎉
        </h1>
        
        <p className="text-2xl text-gray-300">
          Congratulations, {teamName}!
        </p>
        
        <p className="text-xl text-gray-400">
          You successfully solved the {assignedRoom} puzzle!
        </p>

        <div className="flex space-x-4 justify-center mt-8">
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition transform hover:scale-105 flex items-center space-x-2"
          >
            <span>🐦 Share on Twitter</span>
          </a>
          
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-lg transition transform hover:scale-105 flex items-center space-x-2"
          >
            <span>💼 Share on LinkedIn</span>
          </a>
        </div>

        <div className="mt-12 text-gray-400">
          <p>Want to try another puzzle?</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-lg transition transform hover:scale-105"
          >
            🎮 Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Success; 