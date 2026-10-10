import type { LevelName } from "../types";
import { totalWeeklyMinutes } from "./demo";

/**
 * LOCAL DEMO DATA — Stage 1 only. All participants are fictional nicknames.
 * Leagues are a weekly competition and are separate from training levels
 * and achievement badges (see demo.ts).
 */

export type LeagueName = LevelName;

export interface Participant {
  id: string;
  name: string;
  /** Weekly XP earned. */
  xp: number;
  isCurrentUser?: boolean;
}

export interface RankedParticipant extends Participant {
  /** Competition ranking: ties share a rank (1, 2, 2, 4). */
  rank: number;
}

export const LEAGUES: LeagueName[] = ["Bronze", "Silver", "Gold", "Platinum"];

/** Top N ranks in a league are "in the promotion zone" for the next league. */
export const PROMOTION_SLOTS = 5;

/** Demo conversion so the user's XP matches the weekly activity chart. */
export const XP_PER_MINUTE = 2;

export const CURRENT_USER_ID = "you";
/** Demo constant: the user competes in Bronze regardless of which tab is open. */
export const CURRENT_USER_LEAGUE: LeagueName = "Bronze";

const P = (id: string, name: string, xp: number): Participant => ({ id, name, xp });

const you: Participant = {
  id: CURRENT_USER_ID,
  name: "You",
  xp: totalWeeklyMinutes() * XP_PER_MINUTE,
  isCurrentUser: true,
};

export const participantsByLeague: Record<LeagueName, Participant[]> = {
  Bronze: [
    P("b1", "Swift Sparrow", 410),
    P("b2", "Calm Cedar", 385),
    P("b3", "Bright Lantern", 340),
    P("b4", "Quiet Falcon", 322),
    P("b5", "Steady Willow", 300),
    P("b6", "Bold Meadow", 285),
    you,
    P("b8", "Gentle Ember", 255),
    P("b9", "Keen Juniper", 230),
    P("b10", "Brave Harbor", 200),
    P("b11", "Warm Pebble", 150),
    P("b12", "Clever Fern", 120),
  ],
  Silver: [
    P("s1", "Rising Comet", 620),
    P("s2", "Open Horizon", 590),
    P("s3", "Calm Tide", 575),
    P("s4", "Sunny Reed", 540),
    P("s5", "Proud Maple", 540),
    P("s6", "Nimble Fox", 505),
    P("s7", "Wise Lotus", 470),
    P("s8", "Brisk Aspen", 430),
    P("s9", "Kind Thistle", 390),
    P("s10", "Soft Breeze", 350),
  ],
  Gold: [
    P("g1", "Golden Dawn", 880),
    P("g2", "Fierce Orchid", 840),
    P("g3", "Steady Granite", 790),
    P("g4", "Radiant Sage", 760),
    P("g5", "Lively Ember", 700),
    P("g6", "Patient Oak", 655),
    P("g7", "Daring Wren", 610),
    P("g8", "Gentle Storm", 560),
  ],
  Platinum: [
    P("p1", "Silver Phoenix", 1210),
    P("p2", "Unbroken Aster", 1150),
    P("p3", "Luminous Crane", 1090),
    P("p4", "Resolute Ivy", 1090),
    P("p5", "Tranquil Hawk", 1020),
    P("p6", "Serene Summit", 960),
  ],
};

/**
 * Sort by XP (high to low), then name for a stable display order.
 * Rank = 1 + number of participants with strictly more XP, so ties share a rank.
 */
export function rankParticipants(list: Participant[]): RankedParticipant[] {
  const sorted = [...list].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  return sorted.map((p) => ({
    ...p,
    rank: 1 + sorted.filter((o) => o.xp > p.xp).length,
  }));
}

export const rankedLeague = (league: LeagueName) =>
  rankParticipants(participantsByLeague[league]);

/** The demo user's standing, always computed from their own league. */
export function getUserStanding() {
  const ranked = rankedLeague(CURRENT_USER_LEAGUE);
  const me = ranked.find((p) => p.id === CURRENT_USER_ID);
  const leagueIdx = LEAGUES.indexOf(CURRENT_USER_LEAGUE);
  const nextLeague = LEAGUES[leagueIdx + 1] as LeagueName | undefined;

  if (!me) return undefined;

  // XP of whoever currently holds the last promotion slot (matching it also qualifies).
  const lastSlot = ranked.filter((p) => p.rank <= PROMOTION_SLOTS).pop();
  const cutoffXp = lastSlot?.xp ?? me.xp;

  const inPromotionZone = !!nextLeague && me.rank <= PROMOTION_SLOTS;
  const percentToPromotion = !nextLeague
    ? 100
    : inPromotionZone
      ? 100
      : Math.min(99, Math.round((me.xp / cutoffXp) * 100));

  return {
    league: CURRENT_USER_LEAGUE,
    nextLeague,
    rank: me.rank,
    total: ranked.length,
    xp: me.xp,
    inPromotionZone,
    xpToPromotion: inPromotionZone || !nextLeague ? 0 : Math.max(cutoffXp - me.xp, 0),
    percentToPromotion,
  };
}
