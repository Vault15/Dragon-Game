
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats } from './types';
import GameComponent from './components/GameComponent';
import { getDragonCommentary } from './geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [stats, setStats] = useState<GameStats>({ score: 0, missed: 0, bestScore: 0 });
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string>("");
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  const startGame = () => {
    setStats(prev => ({ ...prev, score: 0, missed: 0 }));
    setGameState(GameState.PLAYING);
    setCommentary("");
  };

  const handleGameOver = useCallback(async (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    setStats(prev => ({
      ...prev,
      score: finalScore,
      bestScore: Math.max(prev.bestScore, finalScore),
      missed: 3
    }));
    
    setIsLoadingCommentary(true);
    const text = await getDragonCommentary(finalScore, 3);
    setCommentary(text);
    setIsLoadingCommentary(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {gameState === GameState.HOME && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-amber-400">
          <h1 className="text-4xl font-black text-amber-900 mb-4">FEED THE DRAGON</h1>
          <div className="mb-6">
             <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full border-4 border-amber-200 flex items-center justify-center overflow-hidden mb-4">
               {customImage ? (
                 <img src={customImage} alt="Custom Dragon" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-5xl">🦎</span>
               )}
             </div>
             <p className="text-amber-800 font-medium mb-4">Upload your own bearded dragon photo!</p>
             <input 
               type="file" 
               accept="image/*" 
               onChange={handleImageUpload}
               className="block w-full text-sm text-amber-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
             />
          </div>
          <button 
            onClick={startGame}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl rounded-2xl shadow-lg transition transform hover:scale-105"
          >
            START GAME
          </button>
          <div className="mt-4 text-amber-700 text-sm italic">
            Catch the crickets! Miss 3 and it's game over.
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="relative w-full max-w-2xl h-[80vh] bg-amber-200 rounded-3xl shadow-inner border-8 border-amber-300 overflow-hidden">
          <GameComponent 
            onGameOver={handleGameOver} 
            customImage={customImage} 
          />
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-400">
          <h1 className="text-4xl font-black text-red-600 mb-2">GAME OVER!</h1>
          <p className="text-2xl font-bold text-amber-900 mb-4">Score: {stats.score}</p>
          <p className="text-lg text-amber-700 mb-6 font-semibold">Best Score: {stats.bestScore}</p>
          
          <div className="bg-amber-50 rounded-xl p-4 mb-6 border-2 border-amber-100 min-h-[80px] flex flex-col items-center justify-center">
            {isLoadingCommentary ? (
              <div className="animate-pulse flex space-x-2">
                 <div className="h-3 w-3 bg-amber-400 rounded-full"></div>
                 <div className="h-3 w-3 bg-amber-400 rounded-full"></div>
                 <div className="h-3 w-3 bg-amber-400 rounded-full"></div>
              </div>
            ) : (
              <p className="text-amber-900 italic font-medium">"{commentary}"</p>
            )}
            <span className="text-xs text-amber-500 mt-2">— The Bearded Dragon</span>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl rounded-2xl shadow-lg transition transform hover:scale-105 mb-3"
          >
            TRY AGAIN
          </button>
          <button 
            onClick={() => setGameState(GameState.HOME)}
            className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg rounded-2xl transition"
          >
            BACK TO MENU
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
