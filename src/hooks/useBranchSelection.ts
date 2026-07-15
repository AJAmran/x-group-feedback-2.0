"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BRANCH_MAP, BRANCHES } from "../lib/constants";
import { APP_CONFIG } from "../lib/config";
import { fetchActiveBranches } from "../lib/api";

const STORAGE_KEY = "selectedBranchCode";

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestBranch(
  userLat: number,
  userLng: number,
  branches: { code: string; lat: number; lng: number }[]
): string | null {
  if (branches.length === 0) return null;
  let nearest = branches[0];
  let minDist = haversineDistance(userLat, userLng, nearest.lat, nearest.lng);
  for (let i = 1; i < branches.length; i++) {
    const dist = haversineDistance(userLat, userLng, branches[i].lat, branches[i].lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = branches[i];
    }
  }
  return nearest.code;
}

async function getCurrentCoords(): Promise<GeolocationCoordinates | null> {
  if (!("geolocation" in navigator)) return null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      });
    });
    return pos.coords;
  } catch {
    return null;
  }
}

export type BranchSelectionStatus = "loading" | "resolved" | "selecting";

export function useBranchSelection() {
  const searchParams = useSearchParams();

  const urlCode = searchParams.get("branch")?.toUpperCase() || "";
  const urlBranchValid = urlCode ? Boolean(BRANCH_MAP[urlCode]) : false;

  const [status, setStatus] = useState<BranchSelectionStatus>(() =>
    urlBranchValid ? "resolved" : "loading"
  );
  const [branchCode, setBranchCode] = useState<string>(() =>
    urlBranchValid ? urlCode : ""
  );
  const [branchName, setBranchName] = useState<string>(() =>
    urlBranchValid ? (BRANCH_MAP[urlCode] || APP_CONFIG.DEFAULT_BRANCH_NAME) : ""
  );

  const resolveBranch = useCallback((code: string) => {
    const name = BRANCH_MAP[code] || APP_CONFIG.DEFAULT_BRANCH_NAME;
    setBranchCode(code);
    setBranchName(name);
    setStatus("resolved");
  }, []);

  useEffect(() => {
    if (urlBranchValid) return;

    let cancelled = false;

    async function resolve() {
      const [branchesFromApi, coords] = await Promise.all([
        fetchActiveBranches(),
        getCurrentCoords(),
      ]);

      if (cancelled) return;

      const branches = branchesFromApi.length > 0
        ? branchesFromApi.map((b) => ({ code: b.code, lat: Number(b.latitude), lng: Number(b.longitude) }))
        : BRANCHES;

      if (coords) {
        const nearest = findNearestBranch(coords.latitude, coords.longitude, branches);
        if (nearest && BRANCH_MAP[nearest]) {
          resolveBranch(nearest);
          return;
        }
      }

      let saved: string | null = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* localStorage unavailable */ }
      if (saved && BRANCH_MAP[saved]) {
        resolveBranch(saved);
        return;
      }

      if (branches.length > 0) {
        setStatus("selecting");
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [urlBranchValid, resolveBranch]);

  const selectBranch = useCallback(
    (code: string) => {
      if (!BRANCH_MAP[code]) return;
      try { localStorage.setItem(STORAGE_KEY, code); } catch { /* localStorage unavailable */ }
      resolveBranch(code);
    },
    [resolveBranch]
  );

  const branchList = Object.entries(BRANCH_MAP).map(([code, name]) => ({
    code,
    name,
  }));

  return { status, branchCode, branchName, selectBranch, branchList };
}
