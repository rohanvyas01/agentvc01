import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  Clock, 
  BarChart3, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { apiService } from '../services/api';

interface PitchDeckViewerProps {
  deckId: string;
  onClose: () => void;
}

const PitchDeckViewer: React.FC<PitchDeckViewerProps> = ({ deckId, onClose }) => {
  const [deck, setDeck] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeckContent();
  }, [deckId]);

  const loadDeckContent = async () => {
    try {
      setLoading(true);
      const { deck: deckData, extractedData: extractedContent } = await apiService.getPitchDeckContent(deckId);
      setDeck(deckData);
      setExtractedData(extractedContent);
    } catch (error: any) {
      console.error('Error loading deck content:', error);
      setError(error.message || 'Failed to load deck content');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!deck) return;
    
    try {
      const downloadUrl = await apiService.getDownloadUrl(deck.storage_path);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = deck.deck_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Failed to download: ${error.message}`);
    }
  };

  const filteredPages = extractedData?.pages?.filter((page: any) => 
    searchTerm ? page.text.toLowerCase().includes(searchTerm.toLowerCase()) : true
  ) || [];

  const currentPageData = extractedData?.pages?.[currentPage - 1];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="card-elevated max-w-md w-full mx-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h3 className="text-xl font-bold text-white mb-2">Loading Pitch Deck</h3>
          <p className="text-slate-400">Analyzing extracted content...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="card-elevated max-w-md w-full mx-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-red-400 mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Deck</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{deck?.deck_name}</h2>
              <p className="text-slate-400 text-sm">
                Uploaded {new Date(deck?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleDownload}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar with stats and navigation */}
          <div className="w-80 border-r border-slate-700 p-6 overflow-y-auto">
            {/* Extraction Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Extraction Stats
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    label: "Total Pages", 
                    value: extractedData?.extractionStats?.totalCharacters ? extractedData.pageCount : 'N/A',
                    icon: <FileText className="w-4 h-4" />
                  },
                  { 
                    label: "Total Words", 
                    value: extractedData?.extractionStats?.totalWords || 'N/A',
                    icon: <Target className="w-4 h-4" />
                  },
                  { 
                    label: "Characters", 
                    value: extractedData?.extractionStats?.totalCharacters || 'N/A',
                    icon: <Eye className="w-4 h-4" />
                  },
                  { 
                    label: "Text Pages", 
                    value: extractedData?.extractionStats?.pagesWithText || 'N/A',
                    icon: <Zap className="w-4 h-4" />
                  },
                  { 
                    label: "OCR Pages", 
                    value: extractedData?.extractionStats?.pagesWithOCR || 'N/A',
                    icon: <Brain className="w-4 h-4" />
                  },
                  { 
                    label: "Processing Time", 
                    value: extractedData?.extractionStats?.processingTimeMs 
                      ? `${extractedData.extractionStats.processingTimeMs}ms` 
                      : 'N/A',
                    icon: <Clock className="w-4 h-4" />
                  }
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="flex items-center justify-between p-3 glass rounded-lg border border-slate-700/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400">{stat.icon}</div>
                      <span className="text-slate-300 text-sm">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-white">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                Search Content
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search in deck..."
                  className="input-field pl-10 text-sm"
                />
              </div>
              {searchTerm && (
                <p className="text-slate-400 text-xs mt-2">
                  Found in {filteredPages.length} page(s)
                </p>
              )}
            </div>

            {/* Page Navigation */}
            {extractedData?.pages && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Pages</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {extractedData.pages.map((page: any, index: number) => (
                    <motion.button
                      key={page.pageNumber}
                      onClick={() => setCurrentPage(page.pageNumber)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentPage === page.pageNumber
                          ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                          : 'glass border border-slate-700/30 text-slate-300 hover:bg-slate-800/30'
                      }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Page {page.pageNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          page.extractionMethod === 'ocr' 
                            ? 'bg-orange-500/20 text-orange-300' 
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {page.extractionMethod.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {page.wordCount} words
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {extractedData?.pages && currentPageData ? (
              <div>
                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">
                      Page {currentPageData.pageNumber}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      currentPageData.extractionMethod === 'ocr' 
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {currentPageData.extractionMethod === 'ocr' ? 'OCR Extracted' : 'Text Extracted'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <span className="text-slate-400 text-sm">
                      {currentPage} of {extractedData.pageCount}
                    </span>
                    <motion.button
                      onClick={() => setCurrentPage(Math.min(extractedData.pageCount, currentPage + 1))}
                      disabled={currentPage === extractedData.pageCount}
                      className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Page content */}
                <motion.div 
                  className="glass rounded-xl p-6 border border-slate-700/30"
                  key={currentPageData.pageNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 flex items-center gap-4 text-sm text-slate-400">
                    <span>{currentPageData.wordCount} words</span>
                    <span>•</span>
                    <span>{currentPageData.text.length} characters</span>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                      {searchTerm ? (
                        currentPageData.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part: string, index: number) => 
                          part.toLowerCase() === searchTerm.toLowerCase() ? (
                            <mark key={index} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
                              {part}
                            </mark>
                          ) : part
                        )
                      ) : (
                        currentPageData.text
                      )}
                    </pre>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No Content Available
                </h3>
                <p className="text-slate-500">
                  {extractedData ? 'No text could be extracted from this PDF' : 'No extracted data found'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PitchDeckViewer;