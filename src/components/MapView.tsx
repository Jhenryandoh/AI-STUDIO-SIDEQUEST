import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Users, Sparkles, Radio, Shield, Compass, CheckCircle2 } from 'lucide-react';
import { calculateDistanceMeters } from '../utils/gameLogic.ts';
import type { Player, PlayerLocation, Session, Submission } from '../types/index.ts';

interface MapViewProps {
  player: Player;
  session: Session | null;
  teammates: PlayerLocation[];
  submissions: Submission[];
  userCoords: { lat: number; lng: number };
  onUpdateSpot: (spotName: string) => void;
  onJoinPublicRoom?: (roomCode: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  player,
  session,
  teammates,
  submissions,
  userCoords,
  onUpdateSpot,
  onJoinPublicRoom,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [currentSpotInput, setCurrentSpotInput] = useState<string>('');
  const [showSpotInput, setShowSpotInput] = useState<boolean>(false);
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);

  // Check proximity to teammates (< 50 meters)
  useEffect(() => {
    let closestTeammate: { name: string; dist: number } | null = null;
    teammates.forEach((t) => {
      const dist = calculateDistanceMeters(userCoords.lat, userCoords.lng, t.lat, t.lng);
      if (dist <= 60 && (!closestTeammate || dist < closestTeammate.dist)) {
        closestTeammate = { name: t.playerName, dist };
      }
    });

    if (closestTeammate) {
      setProximityAlert(`⚡ PROXIMITY RADAR: ${closestTeammate.name} is only ${closestTeammate.dist}m away! High-five time!`);
    } else {
      setProximityAlert(null);
    }
  }, [teammates, userCoords]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 16,
        zoomControl: false,
      });

      // Standard OpenStreetMap tiles with dark nightlife filter (no API key required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersRef.current;
    if (!map || !markersGroup) return;

    // Clear existing markers
    markersGroup.clearLayers();

    // 1. User's Marker (Pulsing Neon Pin)
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(6, 182, 212, 0.4); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background: #06b6d4; border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 15px #06b6d4;">
            ${player.avatar.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(markersGroup);
    userMarker.bindPopup(`
      <div style="color: #090a10; font-family: sans-serif; padding: 4px;">
        <strong style="font-size: 13px;">${player.displayName} (YOU)</strong><br/>
        <span style="font-size: 11px; color: #475569;">GPS Active • ${player.country}</span>
      </div>
    `);

    // 2. Teammates Markers
    teammates.forEach((t) => {
      const dist = calculateDistanceMeters(userCoords.lat, userCoords.lng, t.lat, t.lng);
      const teamIcon = L.divIcon({
        className: 'custom-teammate-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 26px; height: 26px; background: #a855f7; border: 2px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 12px #a855f7;">
              ${t.playerAvatar.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const tMarker = L.marker([t.lat, t.lng], { icon: teamIcon }).addTo(markersGroup);
      tMarker.bindPopup(`
        <div style="color: #090a10; font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 13px;">${t.playerName}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">Spot: ${t.currentSpot || 'In Squad Area'}</span><br/>
          <span style="font-size: 11px; color: #0284c7; font-weight: bold;">${dist}m away</span>
        </div>
      `);
    });

    // 3. Completed Quest Photo Markers
    submissions.forEach((s) => {
      if (s.lat && s.lng) {
        const photoIcon = L.divIcon({
          className: 'custom-photo-pin',
          html: `
            <div style="width: 28px; height: 28px; background: #ec4899; border: 2px solid #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 10px #ec4899; transform: rotate(5deg);">
              📸
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const pMarker = L.marker([s.lat, s.lng], { icon: photoIcon }).addTo(markersGroup);
        pMarker.bindPopup(`
          <div style="color: #090a10; font-family: sans-serif; max-width: 160px; padding: 4px;">
            <strong style="font-size: 12px; display: block; line-height: 1.2;">${s.questTitle}</strong>
            <span style="font-size: 10px; color: #475569;">By ${s.playerName} (+${s.pointsAwarded} pts)</span>
            <img src="${s.thumbnailUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-top: 4px;" alt="Quest proof" />
          </div>
        `);
      }
    });
  }, [userCoords, teammates, submissions, player]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 16, { animate: true, duration: 1 });
    }
  };

  const handleSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpotInput.trim()) return;
    onUpdateSpot(currentSpotInput.trim());
    setCurrentSpotInput('');
    setShowSpotInput(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3 pb-24">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
            LIVE RADAR & GEOFENCING
          </span>
          <h2 className="text-xl font-display font-black text-white">Night Map</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSpotInput(!showSpotInput)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Ping Spot
          </button>
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Recenter Map"
            aria-label="Recenter map"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Spot Ping Input Dropdown */}
      {showSpotInput && (
        <form onSubmit={handleSpotSubmit} className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl flex gap-2">
          <input
            type="text"
            value={currentSpotInput}
            onChange={(e) => setCurrentSpotInput(e.target.value)}
            placeholder="e.g. 2nd floor VIP lounge or Tacos patio"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs"
          >
            Broadcast
          </button>
        </form>
      )}

      {/* Proximity Alert Banner */}
      {proximityAlert && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border border-cyan-400 text-cyan-200 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Radio className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span>{proximityAlert}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl h-[380px] w-full bg-[#0a0c14]">
        <div ref={mapContainerRef} className="dark-map w-full h-full z-10" />

        {/* Floating Legend / Stats */}
        <div className="absolute top-2 left-2 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 font-mono space-y-0.5 shadow-lg pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> You ({player.displayName})
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Teammates ({teammates.length})
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500" /> Verified Quests ({submissions.length})
          </div>
        </div>

        {/* Radar scan ring aesthetic */}
        <div className="absolute bottom-2 right-2 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> GPS Locked
        </div>
      </div>

      {/* Teammates List & Distance Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-purple-400" /> Squad Proximity Radar
        </span>
        <div className="grid grid-cols-1 gap-2">
          {teammates.map((t) => {
            const dist = calculateDistanceMeters(userCoords.lat, userCoords.lng, t.lat, t.lng);
            return (
              <div
                key={t.playerId}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{t.playerAvatar.split(' ')[0]}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.playerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.currentSpot || 'Roamin around'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono text-xs font-bold block ${
                      dist <= 50 ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    {dist}m
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {dist <= 50 ? '⚡ IN RANGE' : 'away'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
