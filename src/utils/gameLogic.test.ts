import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceMeters,
  isWithinProximity,
  calculatePoints,
  formatCountdown,
  checkSessionExpired,
  generateRoomCode,
  filterQuestsForSession,
  validatePhotoSubmission,
} from './gameLogic.ts';
import type { QuestTemplate } from '../types/index.ts';

test('calculateDistanceMeters returns approximately correct distance for known coordinates', () => {
  // New York Times Square (40.7580, -73.9855) to Empire State Building (40.7484, -73.9857) ~ 1060m
  const dist = calculateDistanceMeters(40.7580, -73.9855, 40.7484, -73.9857);
  assert.ok(dist >= 1000 && dist <= 1150, `Distance was ${dist}, expected ~1060m`);
});

test('isWithinProximity detects points within 50m and rejects points far away', () => {
  // Same coordinate is 0m away
  assert.equal(isWithinProximity(40.758, -73.985, 40.758, -73.985, 50), true);
  // Distant coordinate is not within 50m
  assert.equal(isWithinProximity(40.758, -73.985, 40.770, -73.985, 50), false);
});

test('calculatePoints applies difficulty multiplier and secret bonus', () => {
  assert.equal(calculatePoints(100, 'casual', false), 100);
  assert.equal(calculatePoints(100, 'spicy', false), 150);
  assert.equal(calculatePoints(100, 'savage', false), 200);
  assert.equal(calculatePoints(100, 'spicy', true), 225); // 100 * 1.5 * 1.5 = 225
});

test('formatCountdown formats remaining time properly', () => {
  assert.equal(formatCountdown(0), '00:00:00');
  assert.equal(formatCountdown(-5000), '00:00:00');
  // 65 seconds -> 01:05
  assert.equal(formatCountdown(65000), '01:05');
  // 3661 seconds (1h 1m 1s) -> 01:01:01
  assert.equal(formatCountdown(3661000), '01:01:01');
});

test('checkSessionExpired correctly flags expired timer', () => {
  const future = Date.now() + 10000;
  const past = Date.now() - 5000;
  assert.equal(checkSessionExpired(future), false);
  assert.equal(checkSessionExpired(past), true);
  assert.equal(checkSessionExpired(undefined), false);
});

test('generateRoomCode produces valid NQ- format', () => {
  const code = generateRoomCode();
  assert.match(code, /^NQ-[A-Z0-9]{5}$/);
});

test('filterQuestsForSession respects group size and vibe', () => {
  const dummyQuests: QuestTemplate[] = [
    {
      id: 'q1',
      title: 'Solo Bar Hunt',
      description: 'Find a neon sign',
      category: 'photo_op',
      difficulty: 'casual',
      points: 100,
      vibeTags: ['chill_lounge', 'bar_crawl'],
      requiresGroupSize: 1,
    },
    {
      id: 'q2',
      title: 'Squad Synchronized Toast',
      description: 'Toast with 4 people',
      category: 'icebreaker',
      difficulty: 'spicy',
      points: 200,
      vibeTags: ['club_energy'],
      requiresGroupSize: 3,
    },
  ];

  // In solo mode, group size 3 quest should be excluded
  const soloQuests = filterQuestsForSession(dummyQuests, 'solo', 'chill_lounge');
  assert.equal(soloQuests.length, 1);
  assert.equal(soloQuests[0].id, 'q1');

  // In group mode with club_energy vibe, q2 matches
  const groupQuests = filterQuestsForSession(dummyQuests, 'group', 'club_energy');
  assert.equal(groupQuests.length, 1);
  assert.equal(groupQuests[0].id, 'q2');
});

test('validatePhotoSubmission rejects empty photo and validates country & size', () => {
  const emptyRes = validatePhotoSubmission({
    hasPhoto: false,
    photoSizeBytes: 0,
    captionLength: 0,
  });
  assert.equal(emptyRes.valid, false);

  const validRes = validatePhotoSubmission({
    hasPhoto: true,
    photoSizeBytes: 500000,
    captionLength: 10,
    playerCountry: 'Canada',
    expectedCountry: 'Canada',
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.countryVerified, true);
  assert.ok(validRes.scoreConfidence > 80);
});
