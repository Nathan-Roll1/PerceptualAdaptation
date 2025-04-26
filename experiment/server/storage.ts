import { 
  users, 
  type User, 
  type InsertUser, 
  type Participant, 
  type InsertParticipant, 
  type Response, 
  type InsertResponse 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Participant methods
  getParticipant(participantId: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  completeExperiment(participantId: string): Promise<Participant | undefined>;
  
  // Response methods
  saveResponse(response: InsertResponse): Promise<Response>;
  getResponses(participantId: string): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private participants: Map<string, Participant>;
  private responses: Response[];
  private userIdCounter: number;
  private responseIdCounter: number;

  constructor() {
    this.users = new Map();
    this.participants = new Map();
    this.responses = [];
    this.userIdCounter = 1;
    this.responseIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Participant methods
  async getParticipant(participantId: string): Promise<Participant | undefined> {
    return this.participants.get(participantId);
  }
  
  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const participant: Participant = { 
      ...insertParticipant, 
      id: this.participants.size + 1,
      endTime: null,
      userAgent: insertParticipant.userAgent || null
    };
    this.participants.set(participant.participantId, participant);
    console.log(`Created participant: ${participant.participantId}, condition: ${participant.condition}`);
    return participant;
  }
  
  async completeExperiment(participantId: string): Promise<Participant | undefined> {
    const participant = this.participants.get(participantId);
    
    if (!participant) {
      return undefined;
    }
    
    // Update the participant's end time
    const updatedParticipant: Participant = {
      ...participant,
      endTime: new Date().toISOString()
    };
    
    this.participants.set(participantId, updatedParticipant);
    console.log(`Completed experiment for participant: ${participantId}`);
    
    return updatedParticipant;
  }
  
  // Response methods
  async saveResponse(insertResponse: InsertResponse): Promise<Response> {
    const response: Response = {
      ...insertResponse,
      id: this.responseIdCounter++
    };
    
    this.responses.push(response);
    console.log(`Saved response for participant: ${response.participantId}, trial: ${response.trialNum}`);
    
    return response;
  }
  
  async getResponses(participantId: string): Promise<Response[]> {
    return this.responses.filter(response => response.participantId === participantId);
  }
}

export const storage = new MemStorage();
