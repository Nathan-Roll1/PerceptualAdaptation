import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { insertResponseSchema, insertParticipantSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/audio-files", async (req, res) => {
    try {
      const audioDir = path.join(process.cwd(), "audio");
      // Check if directory exists
      if (!fs.existsSync(audioDir)) {
        return res.status(404).json({ 
          message: "Audio directory not found. Please create an 'audio' directory at the project root."
        });
      }

      // Get all audio files in the directory
      const files = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.wav') || file.endsWith('.mp3'))
        .map(file => `/audio/${file}`);

      res.json({ audioFiles: files });
    } catch (error) {
      console.error("Error fetching audio files:", error);
      res.status(500).json({ message: "Failed to fetch audio files" });
    }
  });

  // Get experiment configuration
  app.get("/api/experiment-config", async (req, res) => {
    try {
      // In real-world scenario, this would come from a database
      // For now, we'll use a hardcoded configuration
      const audioDir = path.join(process.cwd(), "audio");
      
      // Check if directory exists
      if (!fs.existsSync(audioDir)) {
        return res.status(404).json({ 
          message: "Audio directory not found. Please create an 'audio' directory at the project root."
        });
      }

      // Get all audio files in the directory
      const audioFiles = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));

      console.log("Found audio files:", audioFiles);
      
      if (audioFiles.length === 0) {
        console.log("No audio files found in directory:", audioDir);
        // For testing purposes, we'll create a simple configuration with empty audio arrays
        // In production, we'd want to return an error or generate sample files
        const config = {
          totalTrials: 10, // Reduced for testing
          talkerIds: ["001", "002", "003", "004"],
          singleTalkerFiles: [
            Array(10).fill("/audio/ALL_001_M_CMN_25.0_1.wav"),
            Array(10).fill("/audio/ALL_002_F_CMN_25.0_1.wav"),
            Array(10).fill("/audio/ALL_003_M_CMN_25.0_1.wav"),
            Array(10).fill("/audio/ALL_004_F_CMN_25.0_1.wav")
          ],
          multipleTalkerFiles: [
            ...Array(4).fill("/audio/ALL_001_M_CMN_25.0_1.wav"),
            ...Array(3).fill("/audio/ALL_002_F_CMN_25.0_1.wav"),
            ...Array(3).fill("/audio/ALL_003_M_CMN_25.0_1.wav")
          ]
        };
        return res.json(config);
      }

      // Group files by talker
      const talkerFiles: Record<string, string[]> = {};
      
      audioFiles.forEach(file => {
        // Parse filename to extract talker info
        // Assuming filename format: ALL_XXX_X_XXX_XX.X_X.wav
        // Where XXX in position 2 is the talker ID
        const parts = file.split('_');
        if (parts.length >= 2) {
          const talkerId = parts[1];
          if (!talkerFiles[talkerId]) {
            talkerFiles[talkerId] = [];
          }
          talkerFiles[talkerId].push(file);
        }
      });

      console.log("Grouped files by talker:", Object.keys(talkerFiles));

      // Get unique talker IDs
      const talkerIds = Object.keys(talkerFiles);
      
      // Ensure we have at least 4 talkers for the experiment
      if (talkerIds.length < 4) {
        const missingTalkers = 4 - talkerIds.length;
        console.log(`Only ${talkerIds.length} talkers found, adding ${missingTalkers} dummy talkers`);
        
        // Generate dummy talker IDs if we don't have enough real ones
        for (let i = 0; i < missingTalkers; i++) {
          const dummyId = `dummy${i+1}`;
          talkerIds.push(dummyId);
          talkerFiles[dummyId] = audioFiles.slice(0, Math.min(3, audioFiles.length)); // Use existing files for dummies
        }
      }

      // For testing purposes, reduce the number of trials
      const totalTrials = 10; // In production this would be 60
      
      // Create configuration for single and multiple talker conditions
      const config = {
        totalTrials,
        talkerIds,
        // For single talker, we use all files from one talker
        singleTalkerFiles: talkerIds.map(talkerId => {
          const files = talkerFiles[talkerId] || [];
          console.log(`Talker ${talkerId} has ${files.length} files`);
          
          // If we don't have enough files, repeat them to reach the total
          const totalFiles = [...files];
          while (totalFiles.length < totalTrials) {
            totalFiles.push(...files.slice(0, Math.min(files.length, totalTrials - totalFiles.length)));
          }
          return totalFiles.slice(0, totalTrials).map(file => `/audio/${file}`);
        }),
        // For multiple talker, we use files from each of 3 talkers
        multipleTalkerFiles: talkerIds.slice(0, 3).flatMap(talkerId => {
          const files = talkerFiles[talkerId] || [];
          const filesPerTalker = Math.ceil(totalTrials / 3);
          
          // If we don't have enough files, repeat them
          const totalFiles = [...files];
          while (totalFiles.length < filesPerTalker) {
            totalFiles.push(...files.slice(0, Math.min(files.length, filesPerTalker - totalFiles.length)));
          }
          return totalFiles.slice(0, filesPerTalker).map(file => `/audio/${file}`);
        })
      };

      console.log("Generated config:", {
        totalTrials: config.totalTrials,
        talkerIds: config.talkerIds,
        singleTalkerFilesCount: config.singleTalkerFiles.map(files => files.length),
        multipleTalkerFilesCount: config.multipleTalkerFiles.length
      });

      res.json(config);
    } catch (error) {
      console.error("Error getting experiment config:", error);
      res.status(500).json({ message: "Failed to get experiment configuration" });
    }
  });

  // Create new participant
  app.post("/api/participants", async (req, res) => {
    try {
      const participantData = insertParticipantSchema.parse({
        participantId: nanoid(),
        condition: req.body.condition,
        startTime: new Date().toISOString(),
        userAgent: req.headers["user-agent"]
      });

      const participant = await storage.createParticipant(participantData);
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error creating participant:", error);
      res.status(500).json({ message: "Failed to create participant" });
    }
  });

  // Save response
  app.post("/api/responses", async (req, res) => {
    try {
      const responseData = insertResponseSchema.parse(req.body);
      const response = await storage.saveResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error saving response:", error);
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  // Complete experiment
  app.patch("/api/participants/:participantId/complete", async (req, res) => {
    try {
      const { participantId } = req.params;
      const participant = await storage.completeExperiment(participantId);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      res.json(participant);
    } catch (error) {
      console.error("Error completing experiment:", error);
      res.status(500).json({ message: "Failed to complete experiment" });
    }
  });

  // Serve audio files
  app.use("/audio", (req, res, next) => {
    try {
      // Get the file path from the URL, but remove any leading slash
      const audioFile = req.url.replace(/^\/+/, '');
      
      // Try to serve from web-audio directory first (optimized files)
      const webAudioPath = path.join(process.cwd(), 'web-audio', audioFile);
      const originalAudioPath = path.join(process.cwd(), 'audio', audioFile);
      
      // Choose the appropriate path, preferring web-audio if it exists
      const audioPath = fs.existsSync(webAudioPath) ? webAudioPath : originalAudioPath;
      
      console.log("Requested audio path:", audioPath);
      
      if (fs.existsSync(audioPath)) {
        // Send file directly - Express handles setting the correct content type
        res.sendFile(audioPath, {
          headers: {
            'Content-Type': 'audio/wav',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000' // Cache for a year
          }
        });
      } else {
        console.log("Audio file not found:", audioPath);
        res.status(404).send({ error: `Audio file not found: ${audioFile}` });
      }
    } catch (error) {
      console.error("Error serving audio file:", error);
      res.status(500).send({ error: "Failed to serve audio file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
