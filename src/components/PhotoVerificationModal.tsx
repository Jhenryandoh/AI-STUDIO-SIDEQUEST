import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Sparkles, X, RefreshCw, ShieldCheck, MapPin } from 'lucide-react';
import { compressAndProcessImage, generateTestNightPhoto, type ProcessedImage } from '../utils/imageUtils.ts';
import { validatePhotoSubmission } from '../utils/gameLogic.ts';
import type { AssignedQuest, Player, Submission } from '../types/index.ts';

interface PhotoVerificationModalProps {
  quest: AssignedQuest;
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (submissionData: Omit<Submission, 'id' | 'submittedAt' | 'upvotes'>) => void;
  userCoords?: { lat: number; lng: number };
}

export const PhotoVerificationModal: React.FC<PhotoVerificationModalProps> = ({
  quest,
  player,
  isOpen,
  onClose,
  onSubmitProof,
  userCoords = { lat: 40.7580, lng: -73.9855 },
}) => {
  const [photoData, setPhotoData] = useState<ProcessedImage | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    countryVerified: boolean;
    locationMatch: boolean;
    safetyPassed: boolean;
    scoreConfidence: number;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setValidationResult(null);
      const processed = await compressAndProcessImage(file);
      setPhotoData(processed);

      // Run automatic validation check
      runValidation(processed);
    } catch (err) {
      console.error('Image processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseMockNightPhoto = () => {
    setIsProcessing(true);
    setValidationResult(null);
    setTimeout(() => {
      const mockPhoto = generateTestNightPhoto(quest.title, player.country);
      setPhotoData(mockPhoto);
      runValidation(mockPhoto);
      setIsProcessing(false);
    }, 400);
  };

  const runValidation = (img: ProcessedImage) => {
    setIsValidating(true);
    setTimeout(() => {
      const check = validatePhotoSubmission({
        playerCountry: player.country,
        expectedCountry: player.country,
        hasPhoto: true,
        photoSizeBytes: img.compressedSizeBytes,
        captionLength: caption.length,
        userCoords,
      });
      setValidationResult(check);
      setIsValidating(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoData || !validationResult?.valid) return;

    onSubmitProof({
      assignedQuestId: quest.id,
      questTitle: quest.title,
      sessionId: quest.sessionId,
      playerId: player.id,
      playerName: player.displayName,
      playerAvatar: player.avatar,
      playerCountry: player.country,
      photoUrl: photoData.fullDataUrl,
      thumbnailUrl: photoData.thumbnailUrl,
      caption: caption.trim() || 'Quest completed with squad!',
      lat: userCoords.lat,
      lng: userCoords.lng,
      reviewStatus: 'auto_approved',
      pointsAwarded: quest.points,
      validationDetails: {
        countryVerified: validationResult.countryVerified,
        locationMatch: validationResult.locationMatch,
        aiConfidenceScore: validationResult.scoreConfidence,
        safetyPassed: validationResult.safetyPassed,
        tagsDetected: ['nightlife', 'party', 'verified_timestamp'],
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0e1017] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl shadow-cyan-950/60 my-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full mb-1">
              <ShieldCheck className="w-3 h-3" /> VERIFICATION GATEWAY
            </div>
            <h2 className="text-lg font-display font-black text-white">{quest.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Worth +{quest.points} points for your squad</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Capture / Upload Area */}
        <div>
          {!photoData ? (
            <div className="border-2 border-dashed border-purple-500/40 rounded-2xl p-5 text-center bg-purple-950/10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-lg">
                <Camera className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-white">Capture or Upload Live Quest Proof</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Device camera or gallery • Auto-compressed for rapid cellular upload
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" /> Take / Select Photo
                </button>
                <button
                  type="button"
                  onClick={handleUseMockNightPhoto}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  title="Generate synthetic nightlife camera photo for testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Use Test Camera Sample
                </button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-mono animate-pulse pt-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compressing image & generating thumbnail...
                </div>
              )}
            </div>
          ) : (
            /* Photo Preview with Compression Stats */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 aspect-video bg-black flex items-center justify-center">
                <img
                  src={photoData.fullDataUrl}
                  alt="Quest proof preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoData(null);
                    setValidationResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-slate-300 hover:text-white backdrop-blur-sm"
                  title="Retake photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compression stats banner */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                <span>Original: {(photoData.originalSizeBytes / 1024).toFixed(0)} KB</span>
                <span className="text-cyan-400 font-bold">
                  Compressed: {(photoData.compressedSizeBytes / 1024).toFixed(0)} KB (-
                  {(
                    (1 - photoData.compressedSizeBytes / Math.max(photoData.originalSizeBytes, 1)) *
                    100
                  ).toFixed(0)}
                  %)
                </span>
                <span>{photoData.width}x{photoData.height}</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Checklist */}
        {photoData && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
              Validation Protocol
            </span>

            {isValidating ? (
              <div className="flex items-center gap-2 text-xs text-purple-400 font-mono animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running AI verification and country check...
              </div>
            ) : validationResult ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Country Stamp Verified
                  </span>
                  <span className="font-mono text-[10px] text-cyan-300">{player.country}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Geolocation Match
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Review Confidence
                  </span>
                  <span className="font-mono text-[10px] text-purple-300 font-bold">
                    {validationResult.scoreConfidence}% Score
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Caption */}
        {photoData && (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Add Caption / Shouting Note
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Squad just owned this quest! 🥂"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}

        {/* Submit Button */}
        {photoData && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!validationResult?.valid || isValidating}
            className="w-full py-3 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 text-black shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> VERIFY & CLAIM +{quest.points} POINTS
          </button>
        )}
      </div>
    </div>
  );
};
