import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Sparkles,
  Upload,
  FileText,
  Check,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileSearch,
  Cpu,
  Loader2,
  ChevronRight,
  Bookmark,
  Share2,
  Flame,
  CornerDownRight,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Patient, MRDFile } from '../types';

interface ScribeWorkbenchProps {
  patients: Patient[];
  onAddFile: (newFile: MRDFile) => void;
  setActiveTab: (tab: string) => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

// Preset Clinical Dialogues for the High Fidelity Simulation
const SCRIPTS_PRESETS: Record<string, {
  patientName: string;
  uhid: string;
  templateType: string;
  dialogue: { speaker: string; text: string; role: 'doctor' | 'patient' }[];
  draftedSoap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  }
}> = {
  'pat-1': {
    patientName: 'Robert Miller',
    uhid: '1029384',
    templateType: 'Standard SOAP – Cardiology Visit',
    dialogue: [
      { speaker: 'Dr. Sarah Chen', text: 'Hello Robert, good to see you again. How has your chest discomfort been since we adjusted your therapies?', role: 'doctor' },
      { speaker: 'Robert Miller', text: 'It is a bit lighter, Dr. Chen, but when I climb those steep three flights of stairs to my flat, I still get that dull pressure right behind my sternum and feel quite winded.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'Does that pressure radiate anywhere, say down your left arm or up to your jaw?', role: 'doctor' },
      { speaker: 'Robert Miller', text: 'No, it stays right in the center of my chest. It goes away completely after I sit down and rest for about two or three minutes.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'Any lightheadedness, palpitations, or swelling in your lower legs?', role: 'doctor' },
      { speaker: 'Robert Miller', text: 'No swelling or fluttering that I can tell. Just that dull ache when walking uphill or climbing.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'Alright, lungs sound dry and clear bilaterally. Heart rate is steady at 74 but BP is still high at 144/82. I will escalate lisinopril and schedule a coronary stress test.', role: 'doctor' }
    ],
    draftedSoap: {
      subjective: '72yo male presenting with exertional dyspnea and retrosternal chest pressure on heavy physical exertion (specifically climbing 3 flights of stairs). Pressure is described as "dull tightness", resolves fully with 2-3 minutes of rest. No radiation to jaw or left arm. Denies orthopnea, palpitations, syncope or lower extremity edema.',
      objective: 'Temp 36.6°C, BP 144/82 mmHg (Mild elevation), HR 74 bpm (Regular), SpO2 97% on room air.\n- Resp: Lungs clear to percussion and auscultation bilaterally. No rales or wheezes.\n- Cardiovascular: S1, S2 regular. No S3 or S4. No murmurs or friction rubs. Intact peripheral pulses. Mild right-sided carotid bruit.',
      assessment: '1. Angina Pectoris (Suspected stable CAD, Class II NYHA dyspnea)\n2. Hypertension (Inadequately controlled, SBP 144 on present lisinopril dosing)\n3. Right carotid bruit - asymptomatic.',
      plan: '1. Schedule Exercise Myocardial Perfusion SPECT Stress Test (Stress Test) to evaluate ischemic thresholds.\n2. Increase Lisinopril from 10mg daily to 20mg daily. Recheck serum potassium and creatinine in 10 days.\n3. Instructed patient on strict chest pain protocol: proceed to ER immediately if pressure is prolonged (>10 mins), radiates, or is associated with diaphoresis.'
    }
  },
  'pat-2': {
    patientName: 'Sarah Jenkins',
    uhid: '1029412',
    templateType: 'Neurology Consultation Report',
    dialogue: [
      { speaker: 'Dr. Sarah Chen', text: 'Hello Sarah. Thank you for coming in today. How have your headaches been looking since the MRI scan last Wednesday?', role: 'doctor' },
      { speaker: 'Sarah Jenkins', text: 'Honestly, I am sleeping much better knowing the results. But I still get those band-like headaches in the evening, especially after long computer sessions.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'That is completely understandable. The brain MRI was completely clean and pristine—no signs of vascular aneurysm, mass, or demyelination.', role: 'doctor' },
      { speaker: 'Sarah Jenkins', text: 'That is such a relief. Is there any medicine to keep them from coming back in the afternoons?', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'We will avoid daily pain relief pill cycles to prevent rebound headaches. Let us try high-potency oral magnesium and neck posture exercises.', role: 'doctor' }
    ],
    draftedSoap: {
      subjective: '68yo female presenting with recurrent tension-type headaches occurring in the late afternoon/evening. Patient describes the headache as a "tight band-like pressure" radiating bilaterally around the temples. Headaches are aggravated by extensive screen utilization and improve with rest. Expressed high anxiety regarding vascular pathology, now resolved upon receipt of clean brain imaging.',
      objective: 'Temp 36.7°C, BP 122/74 mmHg, HR 68 bpm. Neurological exam reveals cranial nerves II-XII fully intact. Clear visual horizons. Full range of cervical motion. Mild hypertonicity of the bilateral trapezius and suboccipital muscles with active trigger points.',
      assessment: '1. Episodic Tension Headache (likely posture-related and linked to monitor alignment)\n2. High somatic anxiety (largely abated following brain MRI review).',
      plan: '1. Reviewed pristine Brain MRI (completed 2026-06-10)—no cerebral anomalies, mass, infarct, or vascular malformation.\n2. Initiate Magnesium Glycinate 400mg PO daily at bedtime to ease muscular tension and improve deep sleep patterns.\n3. Refer to cervical physical therapy for postural alignment guidance. Recommended ergonomic adjustments (adjust monitor elevation, taking screen pacing intervals).'
    }
  },
  'pat-3': {
    patientName: 'Arthur Lewis',
    uhid: '1029455',
    templateType: 'ICU Trans-Ward Discharge Notes',
    dialogue: [
      { speaker: 'Dr. Sarah Chen', text: 'Arthur is awake and breathing comfortably on room air. Let us assess the sternotomy and graft sites today.', role: 'doctor' },
      { speaker: 'Arthur Lewis', text: 'I feel a lot stronger, Dr. Sarah. I was actually able to walk all the way down the ICU corridor with the therapist this morning.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'That is exceptional, Arthur! Lungs are dry, heart rate is regular. The chest surgery incision is pristine, clean, and dry with zero redness.', role: 'doctor' },
      { speaker: 'Arthur Lewis', text: 'The chest stays a bit sore, but that is expected. I am ready to get out of the intensive care unit.', role: 'patient' },
      { speaker: 'Dr. Sarah Chen', text: 'Yes, you meet all safety criteria. We are transferring you out of ICU into Ward 4B step-down today.', role: 'doctor' }
    ],
    draftedSoap: {
      subjective: '75yo male post-CABG x3 on post-operative day 5. Alert, fully oriented, highly collaborative. Denies severe active chest pressure or ischemic discomfort. Reports sternal discomfort as 3/10, well-controlled with mild analgesics. Successfully ambulated 120ft in ICU hallway without desaturating.',
      objective: 'BP 118/68 mmHg, HR 72 bpm (NSR), Temp 36.8°C, SpO2 96% on room air.\n- Incisions: Sternal midline closure is clean, intact, and well-approximated with no swelling, drainage, or surrounding erythema. Left femoral donor site is dry, without hematoma.\n- Cardiorespiratory: Lungs clear, vesicular breaths. Heart regular tone, faint systolic murmur.',
      assessment: 'Stable post-operative status following triple coronary bypass (CABG x3). Hemodynamically stable, recovering ahead of parameters, clear respiratory indices.',
      plan: '1. Approved transfer from ICU unit to Ward 4B cardiology telemetry ward today.\n2. Maintain current cardioprotective medications (Baby Aspirin 81mg, Metoprolol succinate 25mg daily, Atorvastatin 40mg daily).\n3. Retrospective review scheduled with surgical team in 48 hours. Continue progressive cardiac rehabilitation physical therapy schedule.'
    }
  }
};

export default function ScribeWorkbench({ patients, onAddFile, setActiveTab, onShowToast }: ScribeWorkbenchProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'ambient' | 'ingest'>('ambient');
  
  // Ambient Scribe State
  const [selectedPatientId, setSelectedPatientId] = React.useState('pat-1');
  const [templateType, setTemplateType] = React.useState('Standard SOAP Note');
  const [recordingState, setRecordingState] = React.useState<'idle' | 'recording' | 'drafting' | 'drafted'>('idle');
  const [scribingTimer, setScribingTimer] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [dialogueHistory, setDialogueHistory] = React.useState<{ speaker: string; text: string; role: 'doctor' | 'patient' }[]>([]);
  const [dialogueIndex, setDialogueIndex] = React.useState(0);
  const dialogueTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Editable Draft SOAP notes
  const [soapSubjective, setSoapSubjective] = React.useState('');
  const [soapObjective, setSoapObjective] = React.useState('');
  const [soapAssessment, setSoapAssessment] = React.useState('');
  const [soapPlan, setSoapPlan] = React.useState('');

  // Direct Ingest Form State
  const [ingestName, setIngestName] = React.useState('');
  const [ingestPatientId, setIngestPatientId] = React.useState('');
  const [ingestCategory, setIngestCategory] = React.useState<'Clinical' | 'Imaging' | 'Administrative'>('Clinical');
  const [ingestNotes, setIngestNotes] = React.useState('');

  // Reset Scribe Session
  const handleResetScribe = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dialogueTimerRef.current) clearInterval(dialogueTimerRef.current);
    setRecordingState('idle');
    setScribingTimer(0);
    setDialogueHistory([]);
    setDialogueIndex(0);
  };

  // Start Scribe Session
  const handleStartScribe = () => {
    const preset = SCRIPTS_PRESETS[selectedPatientId];
    if (!preset) {
      onShowToast('Please select a validated patient record from the roster.', 'warning');
      return;
    }
    
    setRecordingState('recording');
    setScribingTimer(0);
    setDialogueHistory([]);
    setDialogueIndex(0);

    // Audio timer ticker
    timerRef.current = setInterval(() => {
      setScribingTimer(prev => prev + 1);
    }, 1000);

    // Dialogue typing increments
    setTimeout(() => {
      triggerNextDialogueLine(preset.dialogue, 0);
    }, 1000);
  };

  const triggerNextDialogueLine = (dialogueList: typeof SCRIPTS_PRESETS['pat-1']['dialogue'], index: number) => {
    if (index >= dialogueList.length) {
      // Completed conversation text
      return;
    }
    
    setDialogueHistory(prev => [...prev, dialogueList[index]]);
    setDialogueIndex(index + 1);

    if (index + 1 < dialogueList.length) {
      dialogueTimerRef.current = setTimeout(() => {
        triggerNextDialogueLine(dialogueList, index + 1);
      }, 4000); // add a beautiful delayed message bubble entry
    }
  };

  // Complete and Draft Note using DScribe AI Model
  const handleGenerateDraft = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dialogueTimerRef.current) clearInterval(dialogueTimerRef.current);
    
    setRecordingState('drafting');

    // Simulate Deep AI processing times
    setTimeout(() => {
      const preset = SCRIPTS_PRESETS[selectedPatientId];
      if (preset) {
        setSoapSubjective(preset.draftedSoap.subjective);
        setSoapObjective(preset.draftedSoap.objective);
        setSoapAssessment(preset.draftedSoap.assessment);
        setSoapPlan(preset.draftedSoap.plan);
      }
      setRecordingState('drafted');
      onShowToast('DScribe Clinical AI structured consultation notes drafted successfully!', 'success');
    }, 1800);
  };

  // Approve clinical chart and upload directly to files list
  const handleApproveAndSync = () => {
    const preset = SCRIPTS_PRESETS[selectedPatientId];
    const patientName = preset ? preset.patientName : "Review Patient";
    const uhid = preset ? preset.uhid : "1000000";
    
    const finalNotes = `--- SUBJECTIVE ---\n${soapSubjective}\n\n--- OBJECTIVE ---\n${soapObjective}\n\n--- ASSESSMENT ---\n${soapAssessment}\n\n--- PLAN ---\n${soapPlan}`;
    const cleanFileName = `AI_Scribe_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    const newScribeFile: MRDFile = {
      id: `mrd-${Math.floor(1000 + Math.random() * 9200)}-x`,
      fileName: cleanFileName,
      patientName: patientName,
      uhid: uhid,
      category: 'Clinical',
      uploadDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Verified',
      securityLevel: 'High',
      fileSize: '1.4 MB',
      authoredBy: 'Dr. Sarah Chen (DScribe Ambient Scribe)',
      notes: finalNotes,
      previewUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'
    };

    onAddFile(newScribeFile);
    onShowToast(`Clinical notes securely synchronised and indexed in patient's MRD file directory.`, 'success');
    handleResetScribe();
    setActiveTab('mrd-files');
  };

  // Convert timer to clean MM:SS layout
  const formatTime = (sec: number) => {
    const mm = Math.floor(sec / 60).toString().padStart(2, '0');
    const ss = (sec % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn bg-[#f8fafc]">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0066FF]/5 text-[#0066FF] text-[10px] font-black uppercase tracking-wider rounded-md border border-[#0066FF]/10 mb-2">
            Ambient Medical Engine v4.1
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            DScribe Clinical Workspace
          </h1>
          <p className="text-xs text-slate-550 mt-0.5 font-medium">
            Deploy advanced clinical AI models to draft professional charts and records automatically.
          </p>
        </div>

        {/* Dynamic selector pill */}
        <div className="bg-slate-100 p-1 rounded-xl flex shrink-0 border border-slate-200">
          <button
            onClick={() => { setActiveSubTab('ambient'); handleResetScribe(); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ambient'
                ? 'bg-white text-[#0066FF] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Ambient AI Scribe</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ingest')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ingest'
                ? 'bg-white text-[#0066FF] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Document Ingestion</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'ambient' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* Left Area (Core setup, control parameters, drafted note review - 3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {recordingState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#0066FF]" />
                    Scribe Session Initialization
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Select a patient and note configuration to launch</p>
                </div>

                <div className="space-y-4">
                  {/* Select corresponding Patient */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Patient Encounter</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none transition-all text-slate-800 cursor-pointer"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (UHID: {p.uhid} • Room: {p.bed})</option>
                      ))}
                    </select>
                  </div>

                  {/* Note Templates dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Note Format Template</label>
                    <select
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none transition-all text-slate-800 cursor-pointer"
                    >
                      <option value="Standard SOAP Note">Standard SOAP Consultation Note</option>
                      <option value="Full History & Physical">Comprehensive H&P Report</option>
                      <option value="Discharge Summary">Discharge Brief Summary</option>
                      <option value="ICU Clinical Progress Note">ICU Intensive Progress Note</option>
                    </select>
                  </div>

                  {/* Diagnostic Target Details Widget info */}
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-4.5 h-4.5 text-[#0066FF] mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-relaxed text-slate-650 font-medium">
                      <strong>AI Ambient Listening Mode:</strong> Placing your device microphone close to the speakers/consultation ensures precise transcription and high fidelity chart drafting.
                    </div>
                  </div>

                  {/* Large Launch Button */}
                  <button
                    onClick={handleStartScribe}
                    className="w-full h-12 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100 active:scale-98 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 animate-bounce" />
                    <span>Start Scribing Consultation</span>
                  </button>
                </div>
              </motion.div>
            )}

            {recordingState === 'recording' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-[#0066FF]/35 rounded-3xl p-6 shadow-[0_12px_24px_rgba(0,102,255,0.06)] space-y-6 text-center"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Ambient Scribe Active</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                    {formatTime(scribingTimer)}
                  </span>
                </div>

                {/* Pulsing Visual Waveform */}
                <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {/* Digital Voice Waveform */}
                  <div className="flex items-end justify-center gap-1.5 h-16 w-48 relative">
                    <span className="w-1.5 bg-[#0066FF] h-4 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-8 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-12 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-6 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-14 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-9 rounded-full animate-bounce" style={{ animationDelay: '0.25s' }} />
                    <span className="w-1.5 bg-[#0066FF] h-5 rounded-full animate-bounce" style={{ animationDelay: '0.05s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">ambient listening in progress</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Link: {SCRIPTS_PRESETS[selectedPatientId]?.patientName} • {templateType}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleResetScribe}
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    Cancel Session
                  </button>
                  <button
                    onClick={handleGenerateDraft}
                    className="flex-2 h-11 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Generate SOAP Note</span>
                  </button>
                </div>
              </motion.div>
            )}

            {recordingState === 'drafting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-sm"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 bg-[#0066FF]/10 rounded-full flex items-center justify-center text-[#0066FF] animate-spin">
                    <Loader2 className="w-7 h-7" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-widest">DScribe Medical Scribe Reasoning</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
                    Analyzing vocal acoustics, clustering clinical nomenclature, and generating formatted EMR structured notes...
                  </p>
                </div>
              </motion.div>
            )}

            {recordingState === 'drafted' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full uppercase tracking-widest">Draft Verification</span>
                    <h3 className="text-sm font-black text-slate-850 uppercase tracking-widest mt-1">Review AI Generated SOAP Draft</h3>
                  </div>
                  <button
                    onClick={handleResetScribe}
                    className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* EDITABLE BLOCKS */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-blue-600 rounded-sm" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjective (S) – Patient Symptoms & History</label>
                    </div>
                    <textarea
                      rows={3}
                      value={soapSubjective}
                      onChange={(e) => setSoapSubjective(e.target.value)}
                      className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-teal-500 rounded-sm" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objective (O) – Physical Exam & Vitals</label>
                    </div>
                    <textarea
                      rows={3}
                      value={soapObjective}
                      onChange={(e) => setSoapObjective(e.target.value)}
                      className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-violet-600 rounded-sm" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment (A) – Diagnostics & Diagnosis</label>
                    </div>
                    <textarea
                      rows={3}
                      value={soapAssessment}
                      onChange={(e) => setSoapAssessment(e.target.value)}
                      className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-amber-500 rounded-sm" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan (P) – Clinical Orders & Care Actions</label>
                    </div>
                    <textarea
                      rows={3}
                      value={soapPlan}
                      onChange={(e) => setSoapPlan(e.target.value)}
                      className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-[#0066FF] outline-none text-slate-800"
                    />
                  </div>

                  {/* Sync EHR Action */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleApproveAndSync}
                      className="flex-grow h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100 hover:shadow-inner cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Sync to EMR Docs</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ingress Statistics guide */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Security Guard</span>
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Physician Signature Autographed
                </p>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                HIPAA COMPLIANT • SSL SECURED
              </div>
            </div>

          </div>

          {/* Right Area: Interactive Voice Transcript Monitor & Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="p-5 bg-slate-900 border border-slate-800 text-white rounded-3xl h-[470px] flex flex-col justify-between shadow-lg">
              <div className="border-b border-slate-800 pb-3 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${recordingState === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Transcription Monitor</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[#0066FF]">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Dialogue Transcript Frame */}
              <div className="flex-grow overflow-y-auto py-4 space-y-4 custom-scrollbar px-1 text-slate-200">
                {recordingState === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest">Receiver Inactive</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1.5 max-w-[200px] leading-relaxed mx-auto">
                        Once encounter starts listening, the live vocal dialogue transcripts will stream here.
                      </p>
                    </div>
                  </div>
                )}

                {recordingState === 'drafting' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3">
                    <Loader2 className="w-5 h-5 text-[#0066FF] animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-3">Condensing encounter audio...</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {dialogueHistory.map((dialogue, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: dialogue.role === 'doctor' ? -10 : 10, y: 5 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className={`flex flex-col max-w-[85%] ${dialogue.role === 'doctor' ? 'mr-auto items-start' : 'ml-auto items-end text-right'}`}
                    >
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 px-1">
                        {dialogue.speaker}
                      </span>
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold ${
                        dialogue.role === 'doctor' 
                          ? 'bg-slate-800 text-slate-100 rounded-tl-sm' 
                          : 'bg-[#0066FF] text-white rounded-tr-sm'
                      }`}>
                        {dialogue.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {recordingState === 'recording' && dialogueIndex < (SCRIPTS_PRESETS[selectedPatientId]?.dialogue.length || 0) && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-850 w-24 rounded-full mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Listening</span>
                  </div>
                )}
              </div>

              {/* Bottom active feedback panel */}
              <div className="border-t border-slate-800 pt-3 shrink-0 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-widest select-none">
                <span>Active Link: {SCRIPTS_PRESETS[selectedPatientId]?.uhid}</span>
                <span>MODEL: DSCRIPTOR-V4</span>
              </div>
            </div>

            {/* Preset Showcase Button Cards (to click other patients easily) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Validated Presets Simulator
                </h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Click to preview other voice-dictation scenario presets</p>
              </div>

              <div className="space-y-3">
                {Object.entries(SCRIPTS_PRESETS).map(([id, item]) => {
                  const isActive = selectedPatientId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (recordingState === 'recording') {
                          onShowToast('Session Active! Cancel or finish before changing patient record.', 'warning');
                          return;
                        }
                        setSelectedPatientId(id);
                        onShowToast(`Encounter preset loaded: "${item.patientName}". Ready to scribe!`, 'info');
                      }}
                      className={`w-full p-3 font-bold border rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/50 border-[#0066FF] text-[#0066FF]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold truncate">{item.patientName}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider truncate">{item.templateType}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Original Document Ingestion Tab Redesigned cleanly */
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          
          {/* Left Area Form */}
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Direct Document Ingestion Docket</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Specify document parameters to catalog on central database server</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!ingestName.trim()) {
                onShowToast('Please enter a secure filename.', 'warning');
                return;
              }
              if (!ingestPatientId) {
                onShowToast('Please select a patient file from the active registry.', 'warning');
                return;
              }
              const targetPatient = patients.find(p => p.id === ingestPatientId);
              if (!targetPatient) return;

              const cleanFname = ingestName.endsWith('.pdf') || ingestName.endsWith('.jpg') || ingestName.endsWith('.doc') 
                ? ingestName 
                : ingestName + '.pdf';

              const newFile: MRDFile = {
                id: `mrd-${Math.floor(1000 + Math.random() * 9200)}-x`,
                fileName: cleanFname,
                patientName: targetPatient.name,
                uhid: targetPatient.uhid,
                category: ingestCategory,
                uploadDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                status: 'Pending Review',
                securityLevel: 'High',
                fileSize: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
                authoredBy: 'Dr. Sarah Chen',
                notes: ingestNotes.trim() || 'Uploaded via central ingest desk. Awaiting biometric review.',
                previewUrl: ingestCategory === 'Imaging' 
                  ? 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600'
                  : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'
              };

              onAddFile(newFile);
              onShowToast(`Successfully ingested and encrypted document "${cleanFname}" linked to patient ${targetPatient.name}!`, 'success');
              
              setIngestName('');
              setIngestPatientId('');
              setIngestCategory('Clinical');
              setIngestNotes('');
              setActiveTab('mrd-files');
            }} className="space-y-4">
              
              {/* Document Filename */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Document Filename / Index Name</label>
                <input 
                  type="text" 
                  required
                  value={ingestName}
                  onChange={(e) => setIngestName(e.target.value)}
                  placeholder="e.g. Lab_Cardiology_Hemoglobin_Summary"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-800 transition-all text-slate-800"
                />
              </div>

              {/* Patient Link */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Link Registered Patient Dossier</label>
                <select
                  required
                  value={ingestPatientId}
                  onChange={(e) => setIngestPatientId(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-800 cursor-pointer"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (UHID: {p.uhid} • Bed: {p.bed})</option>
                  ))}
                </select>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Document Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Clinical', 'Imaging', 'Administrative'] as const).map(cat => {
                    const isActive = ingestCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setIngestCategory(cat)}
                        className={`h-11 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#0066FF]/10 border-[#0066FF] text-[#0066FF] shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingestion comments */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Clinical Diagnostic Highlights / Comments</label>
                <textarea 
                  rows={3}
                  value={ingestNotes}
                  onChange={(e) => setIngestNotes(e.target.value)}
                  placeholder="Enter relevant diagnostic highlights, clinical summaries, or triage findings..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-800 resize-none transition-all"
                />
              </div>

              {/* Submit btn */}
              <button
                type="submit"
                className="w-full h-12 bg-[#0066FF] hover:bg-blue-700 text-white border border-[#0066FF]/20 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Secure Ingest Document</span>
              </button>

            </form>
          </div>

          {/* Right area drag-and-drop info */}
          <div className="xl:col-span-2 space-y-6">
            
            <div 
              onClick={() => {
                const presets = [
                  { f: 'Brain_Tumor_PACS_MRI.jpg', c: 'Imaging' as const, n: 'Visualised moderate lesions suspect. Book specialist follow-up.' },
                  { f: 'Unaltered_Labs_Hemogram.pdf', c: 'Clinical' as const, n: 'Blood biomarkers clear within standard regulatory norms.' },
                  { f: 'HIPAA_Confidentiality_Form.pdf', c: 'Administrative' as const, n: 'Patient signs standard medical information consent waiver.' }
                ];
                const item = presets[Math.floor(Math.random() * presets.length)];
                setIngestName(item.f.replace('.pdf', '').replace('.jpg', ''));
                setIngestCategory(item.c);
                setIngestNotes(item.n);
                onShowToast(`Auto-loaded parameters for "${item.f}". Verify and submit to save!`, 'info');
              }}
              className="border border-dashed border-slate-300 hover:border-[#0066FF] bg-white rounded-3xl p-8 py-12 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 shadow-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-[#0066FF]" />
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Drag & Drop Documents Here</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide max-w-xs mx-auto leading-relaxed">
                Supports DICOM, high density scans, or standard PDFs. Click to auto-load a sample record!
              </p>
              <span className="inline-block mt-4 px-3 py-1.5 bg-slate-100 hover:bg-[#0066FF] hover:text-white text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-slate-200">
                Quick Sample Loader
              </span>
            </div>

            {/* Ingestion Rules guidelines box */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Ingestion Standards</h4>
              </div>
              <div className="text-[10px] text-slate-500 space-y-2.5 leading-relaxed font-black uppercase tracking-wide">
                <p className="flex items-start gap-1.5">
                  <span className="text-[#0066FF] shrink-0">•</span>
                  <span>Transmitted clinical files are automatically encrypted locally via client keys.</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-[#0066FF] shrink-0">•</span>
                  <span>All documents ingested are reviewed by corresponding clinical directors.</span>
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
