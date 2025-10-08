import { type User, type InsertUser, type Location, type InsertLocation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private locations: Map<string, Location>;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    
    // Initialize with the locations from the design
    this.initializeLocations();
  }

  private initializeLocations() {
    const initialLocations: InsertLocation[] = [
      {
        name: "Athens, Greece",
        country: "Greece",
        imageUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Walking the ancient paths where early apostles preached, sharing the timeless message of hope with modern seekers among historic ruins."
      },
      {
        name: "Nepal Highlands",
        country: "Nepal",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "High in the mountains, finding common ground between faiths and sharing Christ's message of universal love with humble mountain communities."
      },
      {
        name: "Tokyo, Japan",
        country: "Japan",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "In the heart of the bustling metropolis, connecting with seekers in coffee shops and parks, bridging ancient faith with modern life."
      },
      {
        name: "Marrakech, Morocco",
        country: "Morocco",
        imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Among the vibrant souks and diverse cultures, sharing stories of faith and finding beauty in our shared humanity and God's love."
      },
      {
        name: "Algarve, Portugal",
        country: "Portugal",
        imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Like the first disciples who were fishermen, meeting with coastal communities and sharing the gospel by the sea where Jesus once walked."
      },
      {
        name: "Sedona, Arizona",
        country: "United States",
        imageUrl: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "In the vast desert, finding quiet moments of prayer and reflection, and encountering souls seeking spiritual awakening in the wilderness."
      }
    ];

    initialLocations.forEach(location => {
      const id = randomUUID();
      const fullLocation: Location = { ...location, id };
      this.locations.set(id, fullLocation);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }
}

export const storage = new MemStorage();
