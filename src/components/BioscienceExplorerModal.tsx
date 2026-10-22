import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  BookOpen,
  Search,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  Loader2,
  Atom,
  FileText,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { AudioTranscriberButton } from './AudioTranscriberButton.tsx';

interface BioscienceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CompoundData {
  cid: number;
  name: string;
  imageUrl: string;
  properties: {
    MolecularFormula?: string;
    MolecularWeight?: string;
    CanonicalSMILES?: string;
    XLogP?: number;
    TPSA?: number;
    HBondDonorCount?: number;
    HBondAcceptorCount?: number;
    Complexity?: number;
  };
}

interface PubMedArticle {
  pmid: string;
  title: string;
  source: string;
  pubdate: string;
  authors: string;
  pubmedUrl: string;
  doi?: string;
}

export const BioscienceExplorerModal: React.FC<BioscienceExplorerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pubchem' | 'pubmed' | 'search_grounding' | 'maps_grounding'>('pubchem');

  // PubChem State
  const [compoundName, setCompoundName] = useState('Curcumin');
  const [compoundData, setCompoundData] = useState<CompoundData | null>(null);
  const [isLoadingCompound, setIsLoadingCompound] = useState(false);
  const [compoundError, setCompoundError] = useState<string | null>(null);

  // PubMed State
  const [pubmedQuery, setPubmedQuery] = useState('curcumin metabolic health');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [isLoadingPubMed, setIsLoadingPubMed] = useState(false);

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState('turmeric curcumin bioavailability with piperine black pepper');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Maps Grounding State
  const [mapsQuery, setMapsQuery] = useState('authentic South Asian spice grocery store');
  const [mapsResult, setMapsResult] = useState<string | null>(null);
  const [mapsChunks, setMapsChunks] = useState<any[]>([]);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);

  const curatedBioactives = [
    { name: 'Curcumin', herb: 'Turmeric (Haldi)', note: 'Potent polyphenol; downregulates NF-κB and inflammatory cytokines' },
    { name: 'Capsaicin', herb: 'Chili Peppers', note: 'TRPV1 receptor agonist; stimulates thermogenesis and fat oxidation' },
    { name: 'Piperine', herb: 'Black Pepper', note: 'Inhibits glucuronidation, boosting curcumin bioavailability by 2000%' },
    { name: 'Allicin', herb: 'Crushed Garlic', note: 'Organosulfur compound; reduces lipid peroxidation and blood pressure' },
    { name: 'Cinnamaldehyde', herb: 'Ceylon Cinnamon', note: 'Enhances GLUT4 glucose transporter translocation into muscle cells' },
    { name: 'Gingerol', herb: 'Fresh Ginger', note: 'Accelerates gastric emptying and eases digestive postprandial distress' },
    { name: 'Resveratrol', herb: 'Sumac & Red Grapes', note: 'SIRT1 sirtuin activator promoting mitochondrial biogenesis' },
    { name: 'Berberine', herb: 'Barberry & Spices', note: 'AMPK activator improving cellular insulin sensitivity' },
  ];

  // Fetch PubChem compound data
  const fetchCompound = async (nameToFetch: string) => {
    setIsLoadingCompound(true);
    setCompoundError(null);
    try {
      const resp = await fetch(`/api/science/compound/${encodeURIComponent(nameToFetch)}`);
      const data = await resp.json();
      if (data.success) {
        setCompoundData(data);
      } else {
        setCompoundError(data.error || 'Failed to fetch compound data from PubChem');
      }
    } catch (e: any) {
      setCompoundError(e.message || 'Error querying PubChem PUG REST API');
    } finally {
      setIsLoadingCompound(false);
    }
  };

  // Fetch PubMed articles
  const fetchLiterature = async (queryTerm: string) => {
    setIsLoadingPubMed(true);
    try {
      const resp = await fetch(`/api/science/literature?term=${encodeURIComponent(queryTerm)}`);
      const data = await resp.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error('PubMed fetch failed:', e);
    } finally {
      setIsLoadingPubMed(false);
    }
  };

  // Perform Google Search Grounding with gemini-3.8-flash
  const executeSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    setIsLoadingSearch(true);
    try {
      const resp = await fetch('/api/gemini/search-grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await resp.json();
      if (data.success) {
        setSearchResult(data.text);
        setGroundingChunks(data.groundingChunks || []);
      }
    } catch (e) {
      console.error('Search grounding error:', e);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Perform Google Maps Grounding with gemini-3.8-flash
  const executeMapsGrounding = async () => {
    if (!mapsQuery.trim()) return;
    setIsLoadingMaps(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      // Attempt to get user location
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          // Fall back gracefully without user coordinates
        }
      }

      const resp = await fetch('/api/gemini/maps-grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery,
          latitude: lat,
          longitude: lng,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setMapsResult(data.text);
        setMapsChunks(data.groundingChunks || []);
      }
    } catch (e) {
      console.error('Maps grounding error:', e);
    } finally {
      setIsLoadingMaps(false);
    }
  };

  // Auto-fetch initial compound and literature on mount
  useEffect(() => {
    if (isOpen) {
      if (!compoundData) fetchCompound('Curcumin');
      if (articles.length === 0) fetchLiterature('curcumin metabolic health');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col transition-colors">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  Bioscience, PubChem & Google Grounding
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold">
                  Science Skills
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Nutritional biochemistry, PubChem 2D structures, PubMed clinical papers & Google Search/Maps grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="px-6 py-2.5 bg-stone-100/70 dark:bg-stone-850/80 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('pubchem')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'pubchem'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>PubChem Chemistry</span>
          </button>

          <button
            onClick={() => setActiveTab('pubmed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'pubmed'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>PubMed Clinical Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('search_grounding')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'search_grounding'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Google Search Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('maps_grounding')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'maps_grounding'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Google Maps Grounding</span>
          </button>
        </div>

        {/* Tab Contents Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: PUBCHEM CHEMISTRY */}
          {activeTab === 'pubchem' && (
            <div className="space-y-6">
              {/* Search Bar with Microphone */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search chemical compound (e.g. Curcumin, Capsaicin, Resveratrol, Quercetin)..."
                    value={compoundName}
                    onChange={(e) => setCompoundName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCompound(compoundName)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <AudioTranscriberButton
                  onTranscribe={(txt) => {
                    setCompoundName(txt);
                    fetchCompound(txt);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchCompound(compoundName)}
                  disabled={isLoadingCompound}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {isLoadingCompound ? 'Fetching...' : 'Lookup PubChem'}
                </button>
              </div>

              {/* Quick Curated Phytochemical Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Regional Cuisine Phytochemicals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {curatedBioactives.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setCompoundName(item.name);
                        fetchCompound(item.name);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        compoundName.toLowerCase() === item.name.toLowerCase()
                          ? 'border-cyan-600 bg-cyan-50/70 dark:bg-cyan-950/40 text-stone-900 dark:text-stone-100'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.name}</span>
                      <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block font-medium">
                        {item.herb}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PubChem Output Card */}
              {isLoadingCompound && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  <span>Querying PubChem PUG REST API for 2D structure and molecular properties...</span>
                </div>
              )}

              {compoundError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
                  {compoundError}
                </div>
              )}

              {compoundData && !isLoadingCompound && (
                <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-3xl p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* 2D Molecular Structure Image */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-white p-3 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-xs">
                      <img
                        src={compoundData.imageUrl}
                        alt={compoundData.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata & Biological Context */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold block">
                            PUBCHEM CID: {compoundData.cid}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                            {compoundData.name}
                          </h3>
                        </div>
                        <a
                          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 rounded-xl border border-cyan-200 dark:border-cyan-800"
                        >
                          <span>PubChem Entry</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 block font-sans">Formula</span>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                            {compoundData.properties.MolecularFormula || 'N/A'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 block font-sans">Mol. Weight</span>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                            {compoundData.properties.MolecularWeight ? `${compoundData.properties.MolecularWeight} g/mol` : 'N/A'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 block font-sans">LogP (Lipophilicity)</span>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                            {compoundData.properties.XLogP ?? 'N/A'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 block font-sans">TPSA (Polar Surface)</span>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                            {compoundData.properties.TPSA ? `${compoundData.properties.TPSA} Å²` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Canonical SMILES code */}
                      {compoundData.properties.CanonicalSMILES && (
                        <div className="p-2.5 bg-stone-900 text-stone-200 rounded-xl font-mono text-[10px] break-all">
                          <span className="text-stone-400 block font-sans text-[9px] mb-0.5">Canonical SMILES:</span>
                          {compoundData.properties.CanonicalSMILES}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PUBMED BIOMEDICAL LITERATURE */}
          {activeTab === 'pubmed' && (
            <div className="space-y-5">
              {/* Search Bar */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <BookOpen className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search PubMed studies (e.g. curcumin diabetes, ghee lipid profile, capsaicin thermogenesis)..."
                    value={pubmedQuery}
                    onChange={(e) => setPubmedQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLiterature(pubmedQuery)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <AudioTranscriberButton
                  onTranscribe={(txt) => {
                    setPubmedQuery(txt);
                    fetchLiterature(txt);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchLiterature(pubmedQuery)}
                  disabled={isLoadingPubMed}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {isLoadingPubMed ? 'Searching...' : 'Search PubMed'}
                </button>
              </div>

              {isLoadingPubMed && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  <span>Searching NCBI Entrez PubMed database for peer-reviewed citations...</span>
                </div>
              )}

              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art.pmid}
                    className="p-4 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-750 rounded-2xl space-y-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {art.title}
                      </h4>
                      <a
                        href={art.pubmedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 p-1.5 rounded-lg text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800/80"
                        title="View on PubMed"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      <span>PMID: {art.pmid}</span>
                      <span>·</span>
                      <span className="font-sans font-semibold text-stone-700 dark:text-stone-300">{art.source}</span>
                      <span>·</span>
                      <span>{art.pubdate}</span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
                      {art.authors}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SEARCH GROUNDING (gemini-3.8-flash) */}
          {activeTab === 'search_grounding' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-950 dark:text-amber-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block">Google Search Grounding Engine</span>
                <p className="text-stone-600 dark:text-stone-400">
                  Powered by <strong>gemini-3.8-flash</strong> with the real-time <code>googleSearch</code> tool. Retrieves up-to-date web information with verifiable grounding links.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search regional cooking techniques, glycemic facts, or street food calories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearchGrounding()}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <AudioTranscriberButton
                  onTranscribe={(txt) => {
                    setSearchQuery(txt);
                    executeSearchGrounding();
                  }}
                />
                <button
                  type="button"
                  onClick={executeSearchGrounding}
                  disabled={isLoadingSearch}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {isLoadingSearch ? 'Searching...' : 'Run Grounded Search'}
                </button>
              </div>

              {isLoadingSearch && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span>Grounding response with Google Web Search data...</span>
                </div>
              )}

              {searchResult && !isLoadingSearch && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                    {searchResult}
                  </div>

                  {/* Grounding Citations */}
                  {groundingChunks && groundingChunks.length > 0 && (
                    <div className="p-4 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                        Google Search Verified Web Sources
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groundingChunks.map((chunk, idx) => {
                          const web = chunk.web;
                          if (!web) return null;
                          return (
                            <a
                              key={idx}
                              href={web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 flex items-center justify-between gap-2 text-xs text-stone-800 dark:text-stone-200 transition-colors"
                            >
                              <span className="truncate font-medium">{web.title || web.uri}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GOOGLE MAPS GROUNDING (gemini-3.8-flash) */}
          {activeTab === 'maps_grounding' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-950 dark:text-emerald-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block">Google Maps Place Grounding Engine</span>
                <p className="text-stone-600 dark:text-stone-400">
                  Powered by <strong>gemini-3.8-flash</strong> with the <code>googleMaps</code> tool. Finds regional grocery stores, international spice bazaars, and traditional ethnic markets.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search regional food spots (e.g. authentic Mexican carniceria, Indian grocery market)..."
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeMapsGrounding()}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <AudioTranscriberButton
                  onTranscribe={(txt) => {
                    setMapsQuery(txt);
                    executeMapsGrounding();
                  }}
                />
                <button
                  type="button"
                  onClick={executeMapsGrounding}
                  disabled={isLoadingMaps}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {isLoadingMaps ? 'Locating...' : 'Search Maps'}
                </button>
              </div>

              {isLoadingMaps && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Retrieving authentic spots via Google Maps Grounding...</span>
                </div>
              )}

              {mapsResult && !isLoadingMaps && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                    {mapsResult}
                  </div>

                  {/* Google Maps Links from Grounding Chunks */}
                  {mapsChunks && mapsChunks.length > 0 && (
                    <div className="p-4 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                        Google Maps Locations & Navigation
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mapsChunks.map((chunk, idx) => {
                          const maps = chunk.maps;
                          if (!maps) return null;
                          return (
                            <a
                              key={idx}
                              href={maps.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-emerald-400 flex items-center justify-between gap-2 text-xs text-stone-800 dark:text-stone-200 transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-bold block truncate">{maps.title || 'Location details'}</span>
                                <span className="text-[10px] text-stone-400 truncate block">Open in Google Maps</span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
