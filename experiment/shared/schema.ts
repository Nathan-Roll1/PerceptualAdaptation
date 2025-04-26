import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication if needed
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Experiment participant model
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull().unique(),
  condition: text("condition").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  userAgent: text("user_agent"),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  participantId: true,
  condition: true,
  startTime: true,
  userAgent: true,
});

// Response model for storing participant responses
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull(),
  trialNum: integer("trial_num").notNull(),
  audioFile: text("audio_file").notNull(),
  response: text("response").notNull(),
  responseTime: integer("response_time").notNull(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  participantId: true,
  trialNum: true,
  audioFile: true,
  response: true,
  responseTime: true,
});

// Audio files model
export const audioFiles = pgTable("audio_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  talker: text("talker").notNull(),
  condition: text("condition").notNull(),
});

export const insertAudioFileSchema = createInsertSchema(audioFiles).pick({
  filename: true,
  talker: true,
  condition: true,
});

// Experiment config model
export const experimentConfig = pgTable("experiment_config", {
  id: serial("id").primaryKey(),
  totalTrials: integer("total_trials").notNull(),
  singleTalkerFiles: jsonb("single_talker_files").notNull(),
  multipleTalkerFiles: jsonb("multiple_talker_files").notNull(),
});

export const insertExperimentConfigSchema = createInsertSchema(experimentConfig).pick({
  totalTrials: true,
  singleTalkerFiles: true,
  multipleTalkerFiles: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;

export type InsertAudioFile = z.infer<typeof insertAudioFileSchema>;
export type AudioFile = typeof audioFiles.$inferSelect;

export type InsertExperimentConfig = z.infer<typeof insertExperimentConfigSchema>;
export type ExperimentConfig = typeof experimentConfig.$inferSelect;
