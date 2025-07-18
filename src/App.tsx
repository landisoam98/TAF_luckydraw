import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, X, Upload, Trash2, Sparkles, ChevronLeft, ChevronRight, Download, Zap } from 'lucide-react';

interface SlotMachineProps {
  numbers: number[];
  onNumberSelected: (number: number) => void;
  isRolling: boolean;
  justSelected: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ numbers, onNumberSelected, isRolling, justSelected }) => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [rollingNumber, setRollingNumber] = useState<number | null>(null);
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    if (isRolling && numbers.length > 0) {
      // Rolling animation
      const rollingInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        setRollingNumber(numbers[randomIndex]);
      }, 100);

      // Stop rolling after 2 seconds and select final number
      setTimeout(() => {
        clearInterval(rollingInterval);
        const finalIndex = Math.floor(Math.random() * numbers.length);
        const selectedNumber = numbers[finalIndex];
        setCurrentNumber(selectedNumber);
        setRollingNumber(null);
        setShowSparks(true);
        onNumberSelected(selectedNumber);
        
        // Hide sparks after animation
        setTimeout(() => setShowSparks(false), 2000);
      }, 2000);

      return () => clearInterval(rollingInterval);
    }
  }, [isRolling, numbers, onNumberSelected]);

  useEffect(() => {
    if (justSelected) {
      setShowSparks(true);
      setTimeout(() => setShowSparks(false), 2000);
    }
  }, [justSelected]);

  const displayNumber = isRolling ? rollingNumber : currentNumber;

  return (
    <div className="relative">
      <div className={`w-64 h-64 bg-gradient-to-br from-[#113768] to-[#1e5a96] rounded-full flex items-center justify-center shadow-2xl border-8 border-white transition-all duration-500 ${!isRolling ? 'animate-pulse' : ''}`}>
        <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-inner">
          <div className={`text-6xl font-bold text-gray-800 transition-all duration-300 ${isRolling ? 'scale-110 text-[#113768]' : 'scale-100'}`}>
            {displayNumber !== null ? displayNumber : '?'}
          </div>
        </div>
      </div>
      
      {/* Spinning animation overlay */}
      {isRolling && (
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin"></div>
      )}
      
      {/* Glow effect */}
      {isRolling && (
        <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-pulse"></div>
      )}
      
      {/* Sparkling effect */}
      {showSparks && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            />
          ))}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-30 animate-pulse"></div>
          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-400 animate-bounce" />
          <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Sparkles className="absolute top-8 left-8 w-4 h-4 text-red-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </>
      )}
    </div>
  );
};

function App() {
  const [inputValue, setInputValue] = useState('');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [justSelected, setJustSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [autoRollCount, setAutoRollCount] = useState('');
  const [isAutoRolling, setIsAutoRolling] = useState(false);
  const [autoRollRemaining, setAutoRollRemaining] = useState(0);
  const numbersPerPage = 100; // 10x10 grid

  const addNumber = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num) && !numbers.includes(num) && !selectedNumbers.includes(num)) {
      setNumbers([...numbers, num]);
      setInputValue('');
    }
  };

  const removeNumber = (numToRemove: number) => {
    setNumbers(numbers.filter(num => num !== numToRemove));
  };

  const clearAllNumbers = () => {
    setNumbers([]);
  };

  const startRolling = () => {
    if (numbers.length > 0 && !isRolling) {
      setIsRolling(true);
      setJustSelected(false);
    }
  };

  const handleNumberSelected = (selectedNumber: number) => {
    setSelectedNumbers([...selectedNumbers, selectedNumber]);
    setNumbers(numbers.filter(num => num !== selectedNumber));
    setIsRolling(false);
    setJustSelected(true);
    
    // Handle auto-rolling
    if (isAutoRolling && autoRollRemaining > 1) {
      setAutoRollRemaining(autoRollRemaining - 1);
      // Start next roll after a short delay
      setTimeout(() => {
        if (numbers.filter(num => num !== selectedNumber).length > 0) {
          setIsRolling(true);
          setJustSelected(false);
        } else {
          setIsAutoRolling(false);
          setAutoRollRemaining(0);
        }
      }, 1500);
    } else if (isAutoRolling) {
      setIsAutoRolling(false);
      setAutoRollRemaining(0);
    }
  };

  const reset = () => {
    setNumbers([]);
    setSelectedNumbers([]);
    setIsRolling(false);
    setInputValue('');
    setJustSelected(false);
    setCurrentPage(1);
    setShowResetDialog(false);
    setAutoRollCount('');
    setIsAutoRolling(false);
    setAutoRollRemaining(0);
  };

  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const startAutoRoll = () => {
    const count = parseInt(autoRollCount);
    if (!isNaN(count) && count > 0 && count <= numbers.length && !isRolling && !isAutoRolling) {
      setAutoRollRemaining(count);
      setIsAutoRolling(true);
      setIsRolling(true);
      setJustSelected(false);
    }
  };

  const addMultipleNumbers = () => {
    const nums = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const uniqueNums = nums.filter(n => !numbers.includes(n) && !selectedNumbers.includes(n));
    setNumbers([...numbers, ...uniqueNums]);
    setInputValue('');
  };

  const addRange1to1000 = () => {
    const range = Array.from({ length: 1000 }, (_, i) => i + 1);
    const uniqueNums = range.filter(n => !numbers.includes(n) && !selectedNumbers.includes(n));
    setNumbers([...numbers, ...uniqueNums]);
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Parse CSV/Excel data - split by newlines and commas
        const lines = text.split('\n');
        const allNumbers: number[] = [];
        
        lines.forEach(line => {
          const values = line.split(/[,\t]/).map(v => v.trim());
          values.forEach(value => {
            const num = parseInt(value);
            if (!isNaN(num)) {
              allNumbers.push(num);
            }
          });
        });
        
        // Remove duplicates and filter out existing numbers
        const uniqueNumbers = [...new Set(allNumbers)];
        const newNumbers = uniqueNumbers.filter(n => !numbers.includes(n) && !selectedNumbers.includes(n));
        setNumbers([...numbers, ...newNumbers]);
      };
      reader.readAsText(file);
    }
    // Reset the input
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const templateData = `1,2,3,4,5
6,7,8,9,10
11,12,13,14,15
16,17,18,19,20`;
    
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'number_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination logic
  const totalPages = Math.ceil(selectedNumbers.length / numbersPerPage);
  const startIndex = (currentPage - 1) * numbersPerPage;
  const endIndex = startIndex + numbersPerPage;
  const currentPageNumbers = selectedNumbers.slice(startIndex, endIndex);

  // Auto-adjust page when numbers are added
  useEffect(() => {
    if (selectedNumbers.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [selectedNumbers.length, totalPages, currentPage]);

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Lucky Number Slot Machine
          </h1>
          <p className="text-xl text-gray-600">
            Add your numbers, spin the wheel, and let luck decide!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 h-96">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Add Numbers
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number(s) separated by commas"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-lg"
                onKeyPress={(e) => e.key === 'Enter' && addMultipleNumbers()}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={addNumber}
                  className="flex-1 bg-[#113768] text-white py-3 px-4 rounded-xl hover:bg-[#1e5a96] transition-colors font-semibold"
                >
                  Add Single
                </button>
                <button
                  onClick={addMultipleNumbers}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add Multiple
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addRange1to1000}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors font-semibold"
                >
                  Add 1-1000
                </button>
                <button
                  onClick={clearAllNumbers}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              </div>
              
              {/* Excel Import */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
                      onChange={handleExcelImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="excel-import"
                    />
                    <label
                      htmlFor="excel-import"
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      Import Excel/CSV
                    </label>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    title="Download import template"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Available Numbers */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Available Numbers ({numbers.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {numbers.map((num) => (
                  <span
                    key={num}
                    className="bg-gradient-to-r from-[#113768] to-[#1e5a96] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer hover:from-[#1e5a96] hover:to-[#2d6bb0] transition-all"
                    onClick={() => removeNumber(num)}
                  >
                    {num}
                    <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Slot Machine */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
            <SlotMachine
              numbers={numbers}
              onNumberSelected={handleNumberSelected}
              isRolling={isRolling}
              justSelected={justSelected}
            />
          </div>

          {/* Control Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Controls
            </h2>
            
            <div className="space-y-4">
              {/* Single Roll */}
              <button
                onClick={startRolling}
                disabled={numbers.length === 0 || isRolling || isAutoRolling}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  numbers.length === 0 || isRolling || isAutoRolling
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <Play className="w-6 h-6" />
                {isRolling ? 'Rolling...' : 'Start Rolling'}
              </button>
              
              {/* Auto Roll Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Auto Roll</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={autoRollCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= numbers.length)) {
                        setAutoRollCount(value);
                      }
                    }}
                    placeholder="Times"
                    min="1"
                    max={numbers.length}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isRolling || isAutoRolling || numbers.length === 0}
                  />
                  <button
                    onClick={startAutoRoll}
                    disabled={numbers.length === 0 || isRolling || isAutoRolling || !autoRollCount || parseInt(autoRollCount) > numbers.length}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                      numbers.length === 0 || isRolling || isAutoRolling || !autoRollCount || parseInt(autoRollCount) > numbers.length
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    Auto Roll
                  </button>
                </div>
                {isAutoRolling && (
                  <div className="text-sm text-blue-600 font-medium">
                    Auto rolling... {autoRollRemaining} remaining
                  </div>
                )}
              </div>
              
              {/* Reset Button - Smaller */}
              <button
                onClick={handleResetClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                <RotateCcw className="w-5 h-5" />
                Reset All
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Statistics</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Available: {numbers.length}</p>
                <p>Selected: {selectedNumbers.length}</p>
                <p>Total: {numbers.length + selectedNumbers.length}</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Lucky Winners
            </h2>
            
            {selectedNumbers.length > 0 ? (
              <>
                {/* Fixed 10x10 Grid - Extended height to fit all numbers */}
                <div className="grid grid-cols-10 gap-1 h-96 mb-4">
                  {Array.from({ length: 100 }, (_, index) => {
                    const num = currentPageNumbers[index];
                    return (
                      <div
                        key={index}
                        className={`p-1 rounded-lg border-2 text-center flex items-center justify-center min-h-[2.5rem] ${
                          num !== undefined
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {num !== undefined && (
                          <div className="text-sm font-bold text-green-700">
                            {num}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Controls - Always visible */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({selectedNumbers.length} total numbers)
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages || totalPages <= 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage >= totalPages || totalPages <= 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center h-96 mb-4 flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">🎰</div>
                  <p className="text-gray-500 text-lg">
                    No numbers selected yet
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add numbers and start rolling!
                  </p>
                </div>
                
                {/* Pagination Controls - Always visible even when empty */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    disabled={true}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page 1 of 1
                    </span>
                    <span className="text-xs text-gray-500">
                      (0 total numbers)
                    </span>
                  </div>
                  
                  <button
                    disabled={true}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
            
            {numbers.length === 0 && selectedNumbers.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                <p className="text-yellow-800 font-semibold">
                  🎉 All numbers have been selected!
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Click "Reset" to start over with new numbers.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Reset Confirmation Dialog */}
        {showResetDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Confirm Reset</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reset everything? This will clear all numbers and selected results.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetDialog(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={reset}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;