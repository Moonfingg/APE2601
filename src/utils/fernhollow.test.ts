import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toggleAudioState,
  filterProjectsByCategory,
  validateContactSubmission,
  getAstanaDayInfo,
  getAstanaDayKey,
  WEEKLY_SCHEDULE,
  PROJECTS,
} from './fernhollow';

test('toggleAudioState flips muted boolean accurately', () => {
  assert.equal(toggleAudioState(true), false);
  assert.equal(toggleAudioState(false), true);
});

test('filterProjectsByCategory returns all projects when category is All or empty', () => {
  assert.equal(filterProjectsByCategory(PROJECTS, 'All').length, PROJECTS.length);
  assert.equal(filterProjectsByCategory(PROJECTS, '').length, PROJECTS.length);
});

test('filterProjectsByCategory filters by exact category', () => {
  const bio = filterProjectsByCategory(PROJECTS, 'Bio-Materials');
  assert.equal(bio.length, 1);
  assert.equal(bio[0].title, 'The Mycelium Pavilion');
});

test('validateContactSubmission detects invalid inputs and passes valid inputs', () => {
  const invalid = validateContactSubmission({
    name: '',
    email: 'bad-email',
    projectType: 'Living Architecture',
    message: 'short',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateContactSubmission({
    name: 'Aria Thorne',
    email: 'aria@biocanopy.org',
    projectType: 'Living Architecture',
    message: 'We are seeking a bio-regenerative facade for our botanical institute in Wellington.',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('getAstanaDayInfo accurately shifts day at Astana midnight (UTC+5)', () => {
  // 18:59:59 UTC on 2026-11-06 is 23:59:59 in Astana -> Friday (пятница)
  const beforeMidnight = new Date('2026-11-06T18:59:59Z');
  const infoBefore = getAstanaDayInfo(beforeMidnight, 'ru-RU');
  assert.equal(infoBefore.weekday, 'Пятница');

  // 19:00:00 UTC on 2026-11-06 is 00:00:00 in Astana on 2026-11-07 -> Saturday (суббота)
  const atMidnight = new Date('2026-11-06T19:00:00Z');
  const infoAt = getAstanaDayInfo(atMidnight, 'ru-RU');
  assert.equal(infoAt.weekday, 'Суббота');
  assert.equal(infoAt.time, '00:00:00');
});

test('WEEKLY_SCHEDULE contains all 7 week days with valid lesson items', () => {
  assert.equal(WEEKLY_SCHEDULE.length, 7);
  const mon = WEEKLY_SCHEDULE.find((d) => d.dayKey === 'monday');
  assert.ok(mon);
  assert.equal(mon.items.length, 4);
  assert.equal(mon.items[0].subject, 'Возрастная анатомия и физиология');
  assert.equal(mon.items[0].room, 'Аудитория 231');

  const tue = WEEKLY_SCHEDULE.find((d) => d.dayKey === 'tuesday');
  assert.ok(tue);
  assert.equal(tue.items.length, 3);
  assert.equal(tue.items[2].isOnline, true);

  const sat = WEEKLY_SCHEDULE.find((d) => d.dayKey === 'saturday');
  assert.ok(sat);
  assert.equal(sat.isWeekend, true);
});

test('getAstanaDayKey maps weekdays accurately in Astana timezone', () => {
  // Monday in Astana (UTC 2026-11-02T06:00:00Z)
  assert.equal(getAstanaDayKey(new Date('2026-11-02T06:00:00Z')), 'monday');
  // Saturday in Astana (UTC 2026-11-07T06:00:00Z)
  assert.equal(getAstanaDayKey(new Date('2026-11-07T06:00:00Z')), 'saturday');
});



