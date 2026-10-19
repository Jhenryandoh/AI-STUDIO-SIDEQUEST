import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { HeaderHUD } from './components/HeaderHUD.tsx';
import { BottomNav, type TabType } from './components/BottomNav.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { LobbyView } from './components/LobbyView.tsx';
import { QuestsView } from './components/QuestsView.tsx';
import { MapView } from './components/MapView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { FeedAndRecapView } from './components/FeedAndRecapView.tsx';
import { PhotoVerificationModal } from './components/PhotoVerificationModal.tsx';
import { SystemArchitectureModal } from './components/SystemArchitectureModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';

import { INITIAL_QUEST_TEMPLATES } from './utils/questData.ts';
import {
  generateRoomCode,
  filterQuestsForSession,
  selectSecretQuest,
  checkSessionExpired,
  calculatePoints,
} from './utils/gameLogic.ts';
import {
  getStoredPlayer,
  saveStoredPlayer,
  createGuestPlayer,
  getInitialTeammateLocations,
  getSamplePublicRooms,
} from './utils/storage.ts';
import type {
  Player,
  Session,
  AssignedQuest,
  Submission,
  ChatMessage,
  PlayerLocation,
  LeaderboardEntry,
  GameMode,
  GameVibe,
  GameDifficulty,
} from './types/index.ts';

export default function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('quests');

  // Quests & Submissions state
  const [assignedQuests, setAssignedQuests] = useState<AssignedQuest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [verificationQuest, setVerificationQuest] = useState<AssignedQuest | null>(null);

  // Map & Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 40.7580, lng: -73.9855 });
  const [teammates, setTeammates] = useState<PlayerLocation[]>([]);

  // Chat & Realtime state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  // Timer state
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [isNightEnded, setIsNightEnded] = useState<boolean>(false);

  // Modals
  const [isDbSpecsOpen, setIsDbSpecsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Web Audio Chime player
  const playChime = (type: 'success' | 'alert' | 'secret') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'secret') {
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // 1. Initial Load: Check stored player or auto-start for automated testing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autostart = urlParams.get('autostart') === '1';

    let activePlayer = getStoredPlayer();
    if (!activePlayer) {
      if (autostart) {
        activePlayer = createGuestPlayer('Nova Stryker', 'United States');
        setPlayer(activePlayer);
      } else {
        setIsOnboardingOpen(true);
        return;
      }
    } else {
      setPlayer(activePlayer);
    }

    // Auto-setup an active session if autostart=1 or first run
    if (autostart || !session) {
      const initialCoords = { lat: 40.7580, lng: -73.9855 };
      setUserCoords(initialCoords);
      setTeammates(getInitialTeammateLocations(initialCoords.lat, initialCoords.lng));

      // Setup default active demo session
      const sampleSession: Session = {
        id: 'session_demo_1',
        roomCode: 'NQ-SOHO',
        hostPlayerId: activePlayer.id,
        hostName: activePlayer.displayName,
        mode: 'group',
        vibe: 'bar_crawl',
        difficulty: 'spicy',
        durationMinutes: 180,
        status: 'active',
        startedAt: Date.now() - 15 * 60 * 1000,
        endsAt: Date.now() + 165 * 60 * 1000,
        maxPlayers: 8,
        isPublic: true,
        locationCenter: {
          lat: initialCoords.lat,
          lng: initialCoords.lng,
          areaName: 'Downtown Neon Strip',
        },
        teams: [],
        playerIds: [activePlayer.id, 'p2', 'p3', 'p4'],
      };
      setSession(sampleSession);

      // Seed 3 active quests + 1 secret quest for group
      const matchingTemplates = filterQuestsForSession(
        INITIAL_QUEST_TEMPLATES,
        sampleSession.mode,
        sampleSession.vibe,
        sampleSession.difficulty
      );
      const chosen = matchingTemplates.slice(0, 3);
      const initialAssigned: AssignedQuest[] = chosen.map((tmpl, idx) => ({
        id: 'aq_' + idx + '_' + Date.now(),
        sessionId: sampleSession.id,
        playerId: activePlayer!.id,
        templateId: tmpl.id,
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category,
        difficulty: tmpl.difficulty,
        points: tmpl.points,
        isSecret: false,
        status: 'assigned',
        assignedAt: Date.now(),
      }));

      // Add a secret group quest
      const secretTmpl = selectSecretQuest(INITIAL_QUEST_TEMPLATES);
      if (secretTmpl) {
        initialAssigned.push({
          id: 'secret_' + Date.now(),
          sessionId: sampleSession.id,
          templateId: secretTmpl.id,
          title: secretTmpl.title,
          description: secretTmpl.description,
          category: secretTmpl.category,
          difficulty: secretTmpl.difficulty,
          points: secretTmpl.points,
          isSecret: true,
          status: 'assigned',
          assignedAt: Date.now(),
        });
      }
      setAssignedQuests(initialAssigned);

      // Seed initial chat messages
      setChatMessages([
        {
          id: 'm1',
          sessionId: sampleSession.id,
          senderId: 'system',
          senderName: 'System',
          senderAvatar: '⚡',
          text: 'Room NQ-SOHO launched! Night timer set for 3 hours. Good luck squad!',
          type: 'system',
          timestamp: Date.now() - 14 * 60 * 1000,
        },
        {
          id: 'm2',
          sessionId: sampleSession.id,
          senderId: 'p2',
          senderName: 'Marcus Reed',
          senderAvatar: '🕶️ Neon Viper',
          text: 'Just ordered the first round at the counter! Who is taking the neon selfie?',
          type: 'chat',
          timestamp: Date.now() - 10 * 60 * 1000,
        },
        {
          id: 'm3',
          sessionId: sampleSession.id,
          senderId: 'p3',
          senderName: 'Chloe Chen',
          senderAvatar: '🍸 Velvet Ghost',
          text: 'On my way to the roof patio now! Check the map for my pin 📍',
          type: 'location_ping',
          timestamp: Date.now() - 5 * 60 * 1000,
        },
      ]);
    }
  }, []);

  // 2. Real-time GPS watch
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 3. Night countdown timer loop
  useEffect(() => {
    if (!session || session.status !== 'active' || !session.endsAt) return;

    const interval = setInterval(() => {
      const remaining = session.endsAt! - Date.now();
      setTimeRemainingMs(Math.max(0, remaining));

      if (remaining <= 0 && !isNightEnded) {
        setIsNightEnded(true);
        setCurrentTab('feed'); // Automatically jump to Recap!
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isNightEnded]);

  // Handler: Create Session
  const handleCreateSession = (settings: {
    mode: GameMode;
    vibe: GameVibe;
    difficulty: GameDifficulty;
    durationMinutes: number;
    isPublic: boolean;
  }) => {
    if (!player) return;
    const newRoomCode = generateRoomCode();
    const newSession: Session = {
      id: 'session_' + Date.now().toString(36),
      roomCode: newRoomCode,
      hostPlayerId: player.id,
      hostName: player.displayName,
      mode: settings.mode,
      vibe: settings.vibe,
      difficulty: settings.difficulty,
      durationMinutes: settings.durationMinutes,
      status: 'lobby',
      maxPlayers: settings.mode === 'solo' ? 1 : settings.mode === 'duo' ? 2 : 12,
      isPublic: settings.isPublic,
      locationCenter: {
        lat: userCoords.lat,
        lng: userCoords.lng,
        areaName: 'Downtown Soho & Neon Corridor',
      },
      teams: [],
      playerIds: [player.id],
    };

    setSession(newSession);
    setTeammates(getInitialTeammateLocations(userCoords.lat, userCoords.lng));
    playChime('alert');
  };

  // Handler: Join Session
  const handleJoinSession = (roomCode: string) => {
    if (!player) return;
    const normalized = roomCode.trim().toUpperCase();
    const joinedSession: Session = {
      id: 'session_' + normalized,
      roomCode: normalized,
      hostPlayerId: 'p_host_remote',
      hostName: 'Alex Mercer',
      mode: 'group',
      vibe: 'bar_crawl',
      difficulty: 'spicy',
      durationMinutes: 180,
      status: 'active',
      startedAt: Date.now() - 20 * 60 * 1000,
      endsAt: Date.now() + 160 * 60 * 1000,
      maxPlayers: 12,
      isPublic: true,
      teams: [],
      playerIds: ['p_host_remote', player.id],
    };
    setSession(joinedSession);
    setTeammates(getInitialTeammateLocations(userCoords.lat, userCoords.lng));

    // Populate initial quests
    const templates = filterQuestsForSession(INITIAL_QUEST_TEMPLATES, 'group', 'bar_crawl');
    const assigned = templates.slice(0, 3).map((t, idx) => ({
      id: 'aq_join_' + idx,
      sessionId: joinedSession.id,
      playerId: player.id,
      templateId: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      points: t.points,
      isSecret: false,
      status: 'assigned' as const,
      assignedAt: Date.now(),
    }));
    setAssignedQuests(assigned);
    playChime('success');
  };

  // Handler: Start Night Out (Host begins the clock)
  const handleStartNight = () => {
    if (!session) return;
    const startedAt = Date.now();
    const endsAt = startedAt + session.durationMinutes * 60 * 1000;
    setSession({
      ...session,
      status: 'active',
      startedAt,
      endsAt,
    });

    // Populate quests if not already
    const matching = filterQuestsForSession(INITIAL_QUEST_TEMPLATES, session.mode, session.vibe, session.difficulty);
    const assigned = matching.slice(0, 3).map((tmpl, idx) => ({
      id: 'aq_start_' + idx,
      sessionId: session.id,
      playerId: player?.id,
      templateId: tmpl.id,
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      difficulty: tmpl.difficulty,
      points: tmpl.points,
      isSecret: false,
      status: 'assigned' as const,
      assignedAt: Date.now(),
    }));
    setAssignedQuests(assigned);
    playChime('success');
    confetti({ particleCount: 60, spread: 60 });
  };

  // Handler: Submit Photo Proof
  const handleSubmitProof = (subData: Omit<Submission, 'id' | 'submittedAt' | 'upvotes'>) => {
    const newSubmission: Submission = {
      ...subData,
      id: 'sub_' + Date.now().toString(36),
      submittedAt: Date.now(),
      upvotes: [],
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Mark quest completed
    setAssignedQuests((prev) =>
      prev.map((q) =>
        q.id === subData.assignedQuestId
          ? { ...q, status: 'completed' as const, completedAt: Date.now() }
          : q
      )
    );

    // Update player all-time points
    if (player) {
      const updatedPlayer: Player = {
        ...player,
        allTimePoints: (player.allTimePoints || 0) + subData.pointsAwarded,
      };
      setPlayer(updatedPlayer);
      saveStoredPlayer(updatedPlayer);
    }

    // Broadcast system message to squad chat
    const alertMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sessionId: session?.id || 'demo',
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '⚡',
      text: `🎉 ${subData.playerName} verified "${subData.questTitle}" (+${subData.pointsAwarded} pts)!`,
      type: 'quest_complete',
      timestamp: Date.now(),
      mediaUrl: subData.thumbnailUrl,
    };
    setChatMessages((prev) => [...prev, alertMsg]);

    playChime('success');
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 } });
  };

  // Handler: Skip Quest
  const handleSkipQuest = (questId: string) => {
    const uncompletedTemplates = INITIAL_QUEST_TEMPLATES.filter(
      (t) => !assignedQuests.some((q) => q.templateId === t.id)
    );
    const replacement = uncompletedTemplates[Math.floor(Math.random() * uncompletedTemplates.length)];

    setAssignedQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && replacement) {
          return {
            ...q,
            templateId: replacement.id,
            title: replacement.title,
            description: replacement.description,
            category: replacement.category,
            difficulty: replacement.difficulty,
            points: replacement.points,
            isSecret: false,
          };
        }
        return q;
      })
    );
  };

  // Handler: Generate Custom AI Quest
  const handleGenerateAIQuest = async (venueHint: string) => {
    // Generate contextual dynamic quest
    const customId = 'ai_quest_' + Date.now().toString(36);
    const hints = [
      {
        title: `The ${venueHint.split(' ')[0] || 'Midnight'} Secret Whisper`,
        desc: `Ask the staff at ${venueHint} what the hidden off-menu special or house secret is.`,
        cat: 'icebreaker' as const,
        pts: 160,
      },
      {
        title: `Neon Glow at ${venueHint.split(' ')[0] || 'The Bar'}`,
        desc: `Capture the squad posing in the most colorful light reflection inside ${venueHint}.`,
        cat: 'photo_op' as const,
        pts: 140,
      },
      {
        title: `Table Topology: ${venueHint}`,
        desc: `Build a 3-tier tower using coasters or napkins at your table and take a photo before it topples!`,
        cat: 'dare' as const,
        pts: 180,
      },
    ];
    const picked = hints[Math.floor(Math.random() * hints.length)];

    const newAIQuest: AssignedQuest = {
      id: customId,
      sessionId: session?.id || 'demo',
      playerId: player?.id,
      templateId: 'ai_gen',
      title: `🤖 ${picked.title}`,
      description: picked.desc,
      category: picked.cat,
      difficulty: 'spicy',
      points: picked.pts,
      isSecret: false,
      status: 'assigned',
      assignedAt: Date.now(),
    };

    setAssignedQuests((prev) => [newAIQuest, ...prev]);
    playChime('alert');
  };

  // Handler: Trigger Secret Quest
  const handleTriggerSecretQuest = () => {
    const secretTmpl = selectSecretQuest(INITIAL_QUEST_TEMPLATES, assignedQuests.map((q) => q.templateId));
    if (!secretTmpl) return;

    const secretQuest: AssignedQuest = {
      id: 'secret_' + Date.now(),
      sessionId: session?.id || 'demo',
      templateId: secretTmpl.id,
      title: secretTmpl.title,
      description: secretTmpl.description,
      category: secretTmpl.category,
      difficulty: secretTmpl.difficulty,
      points: secretTmpl.points,
      isSecret: true,
      status: 'assigned',
      assignedAt: Date.now(),
    };

    setAssignedQuests((prev) => [secretQuest, ...prev]);
    playChime('secret');
  };

  // Handler: Upvote Photo Submission
  const handleUpvoteSubmission = (subId: string) => {
    if (!player) return;
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const hasUpvoted = s.upvotes.includes(player.id);
          const upvotes = hasUpvoted
            ? s.upvotes.filter((id) => id !== player.id)
            : [...s.upvotes, player.id];
          return { ...s, upvotes };
        }
        return s;
      })
    );
  };

  // Handler: Send Squad Chat Message
  const handleSendMessage = (text: string, type: ChatMessage['type'] = 'chat') => {
    if (!player) return;
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sessionId: session?.id || 'demo',
      senderId: player.id,
      senderName: player.displayName,
      senderAvatar: player.avatar,
      text,
      type,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Handler: Update Current Spot Ping
  const handleUpdateSpot = (spotName: string) => {
    if (!player) return;
    handleSendMessage(`📍 Pinged spot: "${spotName}" on the map!`, 'location_ping');
  };

  // Handler: Force End Night (Host override)
  const handleForceEndNight = () => {
    setIsNightEnded(true);
    if (session) {
      setSession({ ...session, status: 'ended', endsAt: Date.now() });
    }
    setCurrentTab('feed');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  // Compute live session leaderboard
  const sessionPointsMap: Record<string, { points: number; count: number }> = {};
  submissions.forEach((s) => {
    if (!sessionPointsMap[s.playerId]) {
      sessionPointsMap[s.playerId] = { points: 0, count: 0 };
    }
    sessionPointsMap[s.playerId].points += s.pointsAwarded;
    sessionPointsMap[s.playerId].count += 1;
  });

  const sessionLeaderboard: LeaderboardEntry[] = [
    {
      playerId: player?.id || 'user',
      playerName: player?.displayName || 'You',
      playerAvatar: player?.avatar || '⚡ Cyber Fox',
      country: player?.country || 'United States',
      points: sessionPointsMap[player?.id || '']?.points || 220,
      questsCompleted: sessionPointsMap[player?.id || '']?.count || 1,
      rank: 1,
      badges: ['Night Explorer'],
      isCurrentPlayer: true,
    },
    {
      playerId: 'p2',
      playerName: 'Marcus Reed',
      playerAvatar: '🕶️ Neon Viper',
      country: 'United States',
      points: 180,
      questsCompleted: 1,
      rank: 2,
      badges: ['Speed Demon'],
    },
    {
      playerId: 'p3',
      playerName: 'Chloe Chen',
      playerAvatar: '🍸 Velvet Ghost',
      country: 'Canada',
      points: 150,
      questsCompleted: 1,
      rank: 3,
      badges: ['Shutter King'],
    },
    {
      playerId: 'p4',
      playerName: 'Kai Jensen',
      playerAvatar: '🎧 Bass Phantom',
      country: 'Germany',
      points: 100,
      questsCompleted: 1,
      rank: 4,
      badges: ['Bass Master'],
    },
  ].sort((a, b) => b.points - a.points).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans selection:bg-purple-500">
      {/* Top Header HUD */}
      <HeaderHUD
        session={session}
        player={player}
        timeRemainingMs={timeRemainingMs}
        isExpired={isNightEnded}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDbSpecs={() => setIsDbSpecsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {!session || session.status === 'lobby' ? (
          <LobbyView
            player={
              player || {
                id: 'guest_pending',
                displayName: 'Adventurer',
                country: 'United States',
                avatar: '⚡ Cyber Fox',
                deviceToken: 'pending',
                createdAt: Date.now(),
                totalNightsPlayed: 0,
                allTimePoints: 0,
                trophies: [],
              }
            }
            currentSession={session}
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
            onStartNight={handleStartNight}
            userCoords={userCoords}
          />
        ) : (
          <>
            {currentTab === 'quests' && (
              <QuestsView
                session={session}
                player={player!}
                assignedQuests={assignedQuests}
                onOpenCompleteModal={(q) => setVerificationQuest(q)}
                onSkipQuest={handleSkipQuest}
                onGenerateAIQuest={handleGenerateAIQuest}
                onTriggerSecretQuest={handleTriggerSecretQuest}
              />
            )}

            {currentTab === 'map' && (
              <MapView
                player={player!}
                session={session}
                teammates={teammates}
                submissions={submissions}
                userCoords={userCoords}
                onUpdateSpot={handleUpdateSpot}
                onJoinPublicRoom={handleJoinSession}
              />
            )}

            {currentTab === 'chat' && (
              <ChatView
                player={player!}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView
                player={player!}
                session={session}
                sessionLeaderboard={sessionLeaderboard}
              />
            )}

            {currentTab === 'feed' && (
              <FeedAndRecapView
                player={player!}
                session={session}
                submissions={submissions}
                isNightEnded={isNightEnded}
                onUpvoteSubmission={handleUpvoteSubmission}
                onForceEndNight={handleForceEndNight}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      {session && session.status === 'active' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'chat') setUnreadChatCount(0);
          }}
          activeQuestsCount={assignedQuests.filter((q) => q.status === 'assigned').length}
          unreadChatCount={unreadChatCount}
        />
      )}

      {/* MODALS */}
      {/* 1. Onboarding & Passport Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newPlayer) => {
          setPlayer(newPlayer);
          setIsOnboardingOpen(false);
        }}
        existingPlayer={player}
      />

      {/* 2. Photo Verification Modal */}
      {verificationQuest && player && (
        <PhotoVerificationModal
          quest={verificationQuest}
          player={player}
          isOpen={!!verificationQuest}
          onClose={() => setVerificationQuest(null)}
          onSubmitProof={handleSubmitProof}
          userCoords={userCoords}
        />
      )}

      {/* 3. System Architecture & PostgreSQL Spec Modal */}
      <SystemArchitectureModal
        isOpen={isDbSpecsOpen}
        onClose={() => setIsDbSpecsOpen(false)}
      />

      {/* 4. Profile Modal */}
      <ProfileModal
        player={player}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdatePlayer={(p) => setPlayer(p)}
        onSwitchUser={() => {
          setIsProfileOpen(false);
          setIsOnboardingOpen(true);
        }}
      />
    </div>
  );
}
