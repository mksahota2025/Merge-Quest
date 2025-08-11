import React from 'react';

function BadgeScreen({ sessionId }) {
  const badgeUrl = `http://localhost:5000/badge/${sessionId}`;

  const handleShare = () => {
    const text = encodeURIComponent(`We survived Merge Quest! 🧩 Check out our badge:\n${badgeUrl}`);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${badgeUrl}&summary=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white space-y-6">
      <h1 className="text-4xl font-bold text-yellow-400">🎉 You Escaped!</h1>
      <p className="text-xl text-gray-300">Here’s your survival badge:</p>
      <img src={badgeUrl} alt="Badge" className="border-4 border-yellow-500 rounded-lg shadow-lg" />
      <button
        onClick={handleShare}
        className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        🔗 Share on LinkedIn
      </button>
    </div>
  );
}

export default BadgeScreen;
