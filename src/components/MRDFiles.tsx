import React from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Eye, 
  MoreVertical, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileDown, 
  Calendar, 
  ChevronDown,
  Lock,
  Edit2,
  Share2,
  X,
  FileSearch,
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { MRDFile } from '../types';

interface MRDFilesProps {
  files: MRDFile[];
  onUpdateFileNotes: (id: string, notes: string) => void;
  onRefresh: () => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function MRDFiles({ files, onUpdateFileNotes, onRefresh, onShowToast }: MRDFilesProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [docTypeFilter, setDocTypeFilter] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<MRDFile | null>(null);
  const [noteText, setNoteText] = React.useState('');
  const [isEditingNote, setIsEditingNote] = React.useState(false);

  // Auto select first file for clean initial look on wide screens
  React.useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
      setNoteText(files[0].notes);
    }
  }, [files]);

  const handleSelectFile = (file: MRDFile) => {
    setSelectedFile(file);
    setNoteText(file.notes);
    setIsEditingNote(false);
  };

  const handleSaveNote = () => {
    if (selectedFile) {
      onUpdateFileNotes(selectedFile.id, noteText);
      setSelectedFile({
        ...selectedFile,
        notes: noteText
      });
      setIsEditingNote(false);
    }
  };

  // Filter logic
  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uhid.includes(searchTerm) ||
      file.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDocType = docTypeFilter === '' || 
      (docTypeFilter === 'Clinical' && file.category === 'Clinical') ||
      (docTypeFilter === 'Imaging' && file.category === 'Imaging') ||
      (docTypeFilter === 'Administrative' && file.category === 'Administrative');

    // Simulate department filtering based on doctypes/names
    const matchesDept = deptFilter === '' || 
      (deptFilter === 'Cardiology' && (file.patientName === 'Robert Miller' || file.patientName === 'Evelyn Thorne')) ||
      (deptFilter === 'Neurology' && file.patientName === 'Sarah Jenkins') ||
      (deptFilter === 'General' && (file.patientName === 'Elena Rodriguez' || file.patientName === 'Marcus Chen'));

    return matchesSearch && matchesDocType && matchesDept;
  });

  const getIconFile = (category: string) => {
    switch (category) {
      case 'Clinical':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'Imaging':
        return <Image className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-64px)] overflow-hidden lg:pl-64 bg-transparent select-none">
      {/* Content Header */}
      <div className="px-6 md:px-8 py-5 border-b border-white/45 bg-white/45 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Medical Record Files</h1>
          <p className="text-[11px] text-slate-550 mt-0.5 font-bold">Manage, audit, and append verified biometric logs and patient charts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const msg = `Batch export compiled successfully: Created download package containing ${filteredFiles.length} file records.`;
              if (onShowToast) {
                onShowToast(msg, 'success');
              } else {
                alert(msg);
              }
            }}
            className="h-9 px-4 bg-white/70 border border-white rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:bg-white transition-all cursor-pointer select-none"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Batch</span>
          </button>
          <button 
            onClick={onRefresh}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-[0_8px_16px_rgba(0,102,255,0.2)] hover:shadow-inner transition-all cursor-pointer select-none uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon Control */}
      <div className="px-6 md:px-8 py-3 bg-white/35 backdrop-blur-sm border-b border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none animate-fadeIn">
        {/* Input Bar */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, UHID, or Document ID..."
            className="w-full h-9 pl-10 pr-4 bg-white/70 border border-white rounded-xl text-xs text-slate-800 placeholder-slate-400/80 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Option Selects */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select 
              value={docTypeFilter} 
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white/70 border border-white rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-white transition-all appearance-none shadow-sm"
            >
              <option value="">Document Type</option>
              <option value="Clinical">Clinical Reports</option>
              <option value="Imaging">Imaging scans</option>
              <option value="Administrative">Administrative Records</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white/70 border border-white rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-white transition-all appearance-none shadow-sm"
            >
              <option value="">Department</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="General">General Medicine</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button 
            type="button" 
            onClick={() => {
              const msg = 'Filter applied: Records constrained to local timestamp parameters.';
              if (onShowToast) {
                onShowToast(msg, 'info');
              } else {
                alert(msg);
              }
            }}
            className="h-9 px-3.5 bg-white/70 hover:bg-white text-slate-700 border border-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      {/* Main Core split pane */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Table list view */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 pb-20">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-500">
              <FileSearch className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-sm font-bold">No Records Match This Search Query</p>
              <p className="text-xs text-slate-400 mt-1">Adjust spelling, try another search string, or clear selection qualifiers.</p>
              <button 
                onClick={() => { setSearchTerm(''); setDocTypeFilter(''); setDeptFilter(''); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/55 border-b border-white/45 backdrop-blur-md z-10 select-none">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Document Name</th>
                  <th className="py-3 px-6">Patient & UHID</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6 hidden md:table-cell">Upload Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredFiles.map((file) => {
                  const isCurrentSelection = selectedFile?.id === file.id;
                  return (
                    <tr 
                      key={file.id}
                      tabIndex={0}
                      onClick={() => handleSelectFile(file)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectFile(file);
                        }
                      }}
                      className={`group hover:bg-white/35 focus:bg-white/45 focus:outline-none cursor-pointer transition-all ${
                        isCurrentSelection ? 'bg-white/55 border-l-4 border-l-blue-600' : 'bg-transparent'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/60 shadow-nm-button ${
                            file.category === 'Clinical' ? 'bg-blue-50/70' : file.category === 'Imaging' ? 'bg-indigo-50/70' : 'bg-emerald-50/70'
                          }`}>
                            {getIconFile(file.category)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                              {file.fileName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">ID: {file.id.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-700">
                        <p className="font-bold">{file.patientName}</p>
                        <p className="text-[10px] text-slate-400">UHID: {file.uhid}</p>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                          {file.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 hidden md:table-cell select-none">
                        {file.uploadDate}
                      </td>

                      <td className="py-4 px-6 text-xs select-none">
                        {file.status === 'Verified' && (
                          <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Verified</span>
                          </span>
                        )}
                        {file.status === 'Pending Review' && (
                          <span className="flex items-center gap-1.5 font-bold text-amber-600 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Pending</span>
                          </span>
                        )}
                        {file.status === 'Flagged' && (
                          <span className="flex items-center gap-1.5 font-bold text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Flagged</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 px-1">
                          <button 
                            onClick={() => handleSelectFile(file)}
                            className="p-1 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all text-xs font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Inspect</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right-side preview details panel */}
        <div className="hidden xl:flex flex-col w-[380px] border-l border-white/45 bg-white/45 backdrop-blur-md p-6 justify-between select-none overflow-y-auto custom-scrollbar shadow-[-4px_0_24px_rgba(31,38,135,0.03)]">
          {selectedFile ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Document Inspect Pane</h3>
                <span className="text-[10px] bg-white/80 px-2.5 py-1 rounded-lg font-bold border border-white/90 text-slate-500 shadow-sm">
                  {selectedFile.id.toUpperCase()}
                </span>
              </div>

              {/* Document Vector Blueprint visual frame with dynamic referrPolicy */}
              <div className="aspect-[3/4] w-full bg-white/70 border border-white/80 rounded-2xl overflow-hidden relative group p-2 shadow-sm">
                <img 
                  src={selectedFile.previewUrl} 
                  alt={selectedFile.fileName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-102"
                />
                
                {/* Security classification pill */}
                <div className="absolute top-4 left-4 bg-[#0f172a]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-black flex items-center gap-1.5 uppercase tracking-wide">
                  <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span>{selectedFile.securityLevel} ACCESS BLOCK</span>
                </div>
              </div>

              {/* Specs Lists */}
              <div className="space-y-2 text-xs bg-white/60 p-3 border border-white/85 rounded-xl shadow-sm">
                <div className="flex justify-between py-1 border-b border-white/50">
                  <span className="text-slate-400 font-bold font-mono text-[10px]">File Name:</span>
                  <span className="font-extrabold text-slate-800 text-right truncate max-w-[150px]">{selectedFile.fileName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/50">
                  <span className="text-slate-400 font-bold font-mono text-[10px]">Patient Authorizer:</span>
                  <span className="font-extrabold text-slate-800">{selectedFile.patientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/50">
                  <span className="text-slate-400 font-bold font-mono text-[10px]">File Volume Size:</span>
                  <span className="font-extrabold text-slate-800">{selectedFile.fileSize}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-bold font-mono text-[10px]">Assigned Clinician:</span>
                  <span className="font-extrabold text-slate-800">{selectedFile.authoredBy}</span>
                </div>
              </div>

              {/* Clinical Advice Note Block */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Footnotes Advisory</p>
                
                {isEditingNote ? (
                  <div className="space-y-2">
                    <textarea 
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-2.5 bg-white/70 border border-white rounded-xl text-xs font-sans text-slate-850 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveNote}
                        className="py-1.5 px-3 bg-blue-600 border border-blue-500/20 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-blue-700 hover:scale-98 transition-all"
                      >
                        Save Notes
                      </button>
                      <button 
                        onClick={() => { setNoteText(selectedFile.notes); setIsEditingNote(false); }}
                        className="py-1.5 px-3 bg-white/80 border border-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/55 p-3.5 rounded-xl border border-white/80 text-xs text-slate-700 leading-relaxed italic relative shadow-sm">
                    "{selectedFile.notes}"
                    <button 
                      onClick={() => setIsEditingNote(true)}
                      className="absolute bottom-2 right-2 w-6 h-6 bg-white border border-white/90 rounded-lg shadow-sm hover:shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                      title="Edit Clinical Notes"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom CTAs */}
              <div className="pt-1 flex flex-col gap-2">
                <button 
                  onClick={() => setIsEditingNote(true)}
                  className="w-full h-9 bg-white/75 hover:bg-white border border-white/80 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Notes</span>
                </button>
                <button 
                  onClick={() => {
                    const msg = `Record successfully dispatched via encrypted clinical network to ${selectedFile.authoredBy}.`;
                    if (onShowToast) {
                      onShowToast(msg, 'success');
                    } else {
                      alert(msg);
                    }
                  }}
                  className="w-full h-9 bg-white/75 hover:bg-white border border-white/80 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Encrypted File</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center opacity-70 p-8">
              <FileSearch className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-xs font-bold text-slate-800">Select a Medical Record File</p>
              <p className="text-[11px] text-slate-400 mt-1">Specify which document record requires verification or audits.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
