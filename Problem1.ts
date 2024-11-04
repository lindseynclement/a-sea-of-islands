// Represents each neighbor island's paths or experiences
type Neighbor = {
  node: string;
  travelTime: number;
  resourceOrExperienceTime: number; // Used for either resource planting or experience gathering
};

// Manages the graph of islands for either experiences or distribution
class IslandNetwork {
  private graph: Map<string, Neighbor[]>; // Each island points to an array of Neighbor objects
  private populations: Map<string, number>; // Tracks population for each island
  private lastVisit: Map<string, number>; // Tracks last visit time for each island
  private canoesAvailable: number; // Number of canoes available
  private resourcesDistributed: Set<string>; // Track where resources have been planted

  constructor(canoes: number = 0) {
    this.graph = new Map();
    this.populations = new Map();
    this.lastVisit = new Map();
    this.canoesAvailable = canoes;
    this.resourcesDistributed = new Set();
  }

  // Adds an experience or an island and its neighbors to the graph
  addIslandOrExperience(island: string, neighbors: Neighbor[], population?: number): void {
    this.graph.set(island, neighbors);
    if (population !== undefined) {
      this.populations.set(island, population);
      this.lastVisit.set(island, -Infinity); // Initially, no visits
    }
  }

  // Depth-First Search algorithm for gathering experiences
  private dfs(
    current: string,
    visited: Set<string>,
    totalTime: number,
    maxExperiencesCount: number,
    experienceCount: number,
  ): number {
    let currentMaxExperiences = Math.max(maxExperiencesCount, experienceCount);
    const neighbors = this.graph.get(current) || [];

    for (const neighbor of neighbors) {
      const { node: nextNode, travelTime, resourceOrExperienceTime } = neighbor;

      if (!visited.has(nextNode)) {
        visited.add(nextNode);

        const newTime = totalTime + travelTime + resourceOrExperienceTime;
        const newExperienceCount = experienceCount + 1;

        if (newTime < 100) {
          currentMaxExperiences = this.dfs(
            nextNode,
            visited,
            newTime,
            currentMaxExperiences,
            newExperienceCount,
          );
        }

        visited.delete(nextNode);
      }
    }

    return currentMaxExperiences;
  }

  // Finds the maximum unique experiences a leader can gather
  findMaxExperiences(start: string): number {
    const visited = new Set<string>([start]);
    return this.dfs(start, visited, 0, 0, 1);
  }

  // Calculates priority based on population and recency of visits
  calculatePriority(island: string): number {
    const population = this.populations.get(island) || 0;
    const recencyFactor = Date.now() - (this.lastVisit.get(island) || 0);
    return population * recencyFactor;
  }

  // Method to track the leader's journey for knowledge sharing
  shareKnowledge(start: string, visitInterval: number): void {
    const visited = new Set<string>();
    visited.add(start);
    
    let queue: string[] = [start];
    console.log(`Starting knowledge sharing journey from ${start}`);
    
    while (queue.length > 0) {
      const currentIsland = queue.shift();
      if (!currentIsland) continue;

      this.lastVisit.set(currentIsland, Date.now());
      console.log(`Visited ${currentIsland} with population ${this.populations.get(currentIsland)} at time ${this.lastVisit.get(currentIsland)}`);

      const neighbors = this.graph.get(currentIsland) || [];
      for (const neighbor of neighbors) {
        const { node: nextNode, travelTime } = neighbor;

        if (!visited.has(nextNode) || (Date.now() - (this.lastVisit.get(nextNode) || 0)) > visitInterval) {
          visited.add(nextNode);
          queue.push(nextNode);
          console.log(`Queueing ${nextNode} for visit with travel time ${travelTime}`);
        }
      }
    }
  }

  // Recursive function for distribution
  private distributeResource(current: string, totalTime: number, resourceCount: number): number {
    if (this.resourcesDistributed.has(current)) {
      return resourceCount;
    }

    this.resourcesDistributed.add(current);
    resourceCount++;

    const neighbors = this.graph.get(current) || [];

    for (const neighbor of neighbors) {
      const { node: nextIsland, travelTime, resourceOrExperienceTime } = neighbor;

      if (this.canoesAvailable > 0 && totalTime + travelTime + resourceOrExperienceTime < 100) {
        const newTotalTime = totalTime + travelTime + resourceOrExperienceTime;
        this.canoesAvailable--;
        resourceCount = this.distributeResource(nextIsland, newTotalTime, resourceCount);
        this.canoesAvailable++;
      }
    }

    return resourceCount;
  }

  // Initiates distribution from the source island
  distributeFrom(start: string): number {
    this.resourcesDistributed.clear();
    return this.distributeResource(start, 0, 0);
  }
}

// Test cases
const islandNetwork = new IslandNetwork(3);
islandNetwork.addIslandOrExperience('experience1', [
  { node: 'experience2', travelTime: 10, resourceOrExperienceTime: 5 },
  { node: 'experience3', travelTime: 15, resourceOrExperienceTime: 8 },
], 1000);

islandNetwork.addIslandOrExperience('experience2', [
  { node: 'experience4', travelTime: 20, resourceOrExperienceTime: 12 },
], 800);

islandNetwork.addIslandOrExperience('experience3', [
  { node: 'experience5', travelTime: 10, resourceOrExperienceTime: 7 },
], 500);

islandNetwork.addIslandOrExperience('experience4', [], 1200);

const maxUniqueExperiences = islandNetwork.findMaxExperiences('experience1');
console.log(`Maximum unique experiences: ${maxUniqueExperiences}`);

console.log("Starting the leader's journey for knowledge sharing:");
islandNetwork.shareKnowledge('experience1', 10000); // 10 seconds as a visit interval example

const resourcesPlanted = islandNetwork.distributeFrom('experience1');
console.log(`Total resources planted: ${resourcesPlanted}`);
