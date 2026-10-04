import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  ArrowRight,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Package,
  Utensils,
  Clock,
  Thermometer,
} from 'lucide-react';
import { parseSpokenFoodSurplus, ParsedFoodDonation } from '../services/voiceParser';

interface VoiceToTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedResult: (parsed: ParsedFoodDonation) => void;
}

export const VoiceToTextModal: React.FC<VoiceToTextModalProps> = ({
  isOpen,
  onClose,
  onParsedResult,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedFoodDonation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. You can click a sample voice prompt below to test.');
        } else if (event.error === 'no-speech') {
          // No speech detected yet
        } else {
          setErrorMsg(`Voice recognition: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition setup error:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Automatically trigger parsing when transcript has content
  useEffect(() => {
    if (!transcript.trim()) {
      setParsedPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsParsing(true);
      const parsed = await parseSpokenFoodSurplus(transcript);
      setParsedPreview(parsed);
      setIsParsing(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [transcript]);

  if (!isOpen) return null;

  const startListening = () => {
    setErrorMsg(null);
    setTranscript('');
    setParsedPreview(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Recognition might already be running
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 150);
      }
    } else {
      setErrorMsg('Web Speech API is not supported in this browser. Please use the sample presets below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleApplyPreset = (presetText: string) => {
    if (isListening) stopListening();
    setTranscript(presetText);
  };

  const handleApplyParsedData = () => {
    if (!parsedPreview) return;
    onParsedResult(parsedPreview);
    onClose();
  };

  const samplePresets = [
    'We have 45 portions of vegetable biryani prepared at 5:20 PM, refrigerated in sealed containers, about 18 kg.',
    'Surplus 50 chapatis and mixed dal curry, 15 kg, hot holding at 65°C.',
    '30 portions of chicken fried rice and 10 kg of bakery bread rolls packed in boxes.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                <span>Voice-to-Text Surplus Intake</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Web Speech API
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Describe your excess food naturally — AI parses items, portions, and storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Microphone Interactive Record Button */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping scale-150" />
                  <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/40 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
                title={isListening ? 'Click to stop recording' : 'Click to start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <span className="font-heading font-bold text-sm text-slate-800 mt-3">
              {isListening ? (
                <span className="text-emerald-700 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Listening... speak food description
                </span>
              ) : (
                'Click microphone to speak'
              )}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              Say e.g. "We have 35 portions of vegetable pulao, 12 kg, kept in refrigerator"
            </span>
          </div>

          {/* Error notice if microphone not granted */}
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Transcript Display Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Live Speech Transcript:</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="min-h-[70px] p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium leading-relaxed">
              {transcript ? (
                <span>"{transcript}"</span>
              ) : (
                <span className="text-slate-400 italic">
                  Spoken voice words will appear here in real time...
                </span>
              )}
            </div>
          </div>

          {/* Sample Presets to test speech instantly */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Test Prompts (Click to simulate):
            </span>
            <div className="space-y-1.5">
              {samplePresets.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(sample)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs text-slate-700 font-medium transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">"{sample}"</span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Structured Parsed Output Preview */}
          {parsedPreview && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Automatically Parsed Food Inventory:</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-bold">
                  Ready to Import
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Food Name
                  </span>
                  <span className="font-bold text-slate-900 truncate block">
                    {parsedPreview.foodName}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Portions
                  </span>
                  <span className="font-bold text-emerald-800 block">
                    {parsedPreview.portions} portions
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Quantity
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {parsedPreview.quantity}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Storage
                  </span>
                  <span className="font-bold text-slate-900 block truncate">
                    {parsedPreview.storageCondition}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyParsedData}
              disabled={!parsedPreview}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Auto-Fill & Create Donation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
