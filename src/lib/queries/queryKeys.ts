/*
 * Query key catalog for @tanstack/react-query.
 * Use these helpers instead of raw string arrays for better autocomplete and type safety.
 * This is kinda like a factory pattern for query keys.
 */

import type { QueryKey } from "@tanstack/react-query";

/**
 * Functions return typed tuples that can be used as QueryKeys.
 */
export const queryKeys = {
  // Auth / user
  user: (): QueryKey => ["user"],
  profilePicture: (key: string | null): QueryKey => ["profilePictureUrl", key],

  // reCAPTCHA verification
  recaptcha: {
    verify: (): QueryKey => ["recaptcha", "verify"],
  },

  // Dashboard overview
  dashboard: (teamId: string, projectId: string): QueryKey => [
    "dashboard",
    teamId,
    projectId,
  ],

  // Teams domain
  teams: {
    // 'all' is used as a base for other keys, 'root' is used for direct team queries
    all: ["teams"] as const,
    root: (): QueryKey => ["teams"],
    lists: (): QueryKey => [...queryKeys.teams.all, "list"] as const,
    list: (filters: string): QueryKey =>
      [...queryKeys.teams.lists(), { filters }] as const,
    details: (): QueryKey => [...queryKeys.teams.all, "detail"] as const,
    detail: (teamId: string): QueryKey =>
      [...queryKeys.teams.details(), teamId] as const,
  },
  teamMembers: (teamId: string): QueryKey => ["teamMembers", teamId],
  subscription: (teamId: string): QueryKey => ["subscription", teamId],

  // Projects inside a team
  teamProjects: (teamId: string): QueryKey => ["teamProjects", teamId],
  project: {
    list: (teamId: string): QueryKey => ["projects", teamId],
    detail: (projectId: string): QueryKey => ["project", projectId],
  },

  // Files
  files: {
    list: (teamId: string, projectId: string): QueryKey => [
      "files",
      teamId,
      projectId,
    ],
    detail: (fileId: string): QueryKey => ["file", fileId],
    status: (fileId: string): QueryKey => ["fileStatus", fileId],
  },

  // Clips
  clips: {
    listByFile: (fileId: string): QueryKey => ["clips", fileId],
    byNote: (noteId: string): QueryKey => ["clip", noteId],
  },

  // Notes & tags
  notes: {
    byProject: (projectId: string): QueryKey => ["notes", projectId],
    byFile: (fileId: string): QueryKey => ["notes", fileId],
  },
  tags: (projectId: string): QueryKey => ["tags", projectId],

  // Tag suggestions
  tagSuggestions: (
    transcriptId: string,
    selectedText: string,
    start: number,
    end: number
  ): QueryKey => [
    "tagSuggestions",
    transcriptId,
    { text: selectedText, start, end },
  ],

  // Themes & unassigned notes
  themes: (projectId: string): QueryKey => ["themes", projectId],
  unassignedNotes: (projectId: string): QueryKey => [
    "unassigned-notes",
    projectId,
  ],

  // Transcript-related
  speakerNames: (transcriptId: string): QueryKey => [
    "speakerNames",
    transcriptId,
  ],
  summary: (transcriptId: string): QueryKey => ["summary", transcriptId],

  // Reports
  reports: {
    list: (projectId: string): QueryKey => ["reports", projectId],
    detail: (reportId: string): QueryKey => ["report", reportId],
  },
};

export type QueryKeys = typeof queryKeys;
