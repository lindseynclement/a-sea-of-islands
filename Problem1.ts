// represents each neighbor island's experiences
type Neighbor = {
  node: string;
  travelTime: number;
  experienceTime: number;
};

// manages the graph of experiences and handles the DFS traversal
class IslandTour {
  private graph: Map<string, Neighbor[]>; // each experience node points to an array of Neighbor objects
  private populations: Map<string, number>; // tracks population for each island
  private lastVisit: Map<string, number>; // tracks last visit time for each island

  constructor() {
    this.graph = new Map();
    this.populations = new Map();
    this.lastVisit = new Map();
  }

  // adds an experience and its neighbors to the graph
  addExperience(experience: string, neighbors: Neighbor[], population: number): void {
    this.graph.set(experience, neighbors);
    this.populations.set(experience, population);
    this.lastVisit.set(experience, -Infinity); // initially, no visits
  }

  // Depth-First Search algorithm to recursively explore paths and count unique experiences
  private dfs(
    current: string,
    visited: Set<string>,
    totalTime: number,
    maxExperiencesCount: number,
    experienceCount: number,
  ): number {
    // updates maxExperiencesCount if this path has found more unique experiences
    let currentMaxExperiences = Math.max(maxExperiencesCount, experienceCount);

    const neighbors = this.graph.get(current) || [];

    for (const neighbor of neighbors) {
      const { node: nextNode, travelTime, experienceTime } = neighbor;

      if (!visited.has(nextNode)) {
        visited.add(nextNode);

        const newTime = totalTime + travelTime + experienceTime;
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

  // Finds the maximum unique experiences a leader can gather, prioritizing high-population islands and recency
  findMaxExperiences(start: string): number {
    const visited = new Set<string>([start]);
    return this.dfs(start, visited, 0, 0, 1);
  }

  // Additional method to calculate priority based on population and recency of visits
  calculatePriority(island: string): number {
    const population = this.populations.get(island) || 0;
    const recencyFactor = Date.now() - (this.lastVisit.get(island) || 0); // using current timestamp for simplicity
    return population * recencyFactor;
  }

  // Method to track the leader's journey for knowledge sharing
  shareKnowledge(start: string, visitInterval: number): void {
    const visited = new Set<string>();
    visited.add(start);
    
    let queue: string[] = [start]; // queue to manage islands to visit
    console.log(`Starting knowledge sharing journey from ${start}`);
    
    while (queue.length > 0) {
      const currentIsland = queue.shift();
      if (!currentIsland) continue;

      // Update the last visit time for the current island
      this.lastVisit.set(currentIsland, Date.now());

      console.log(`Visited ${currentIsland} with population ${this.populations.get(currentIsland)} at time ${this.lastVisit.get(currentIsland)}`);

      const neighbors = this.graph.get(currentIsland) || [];
      for (const neighbor of neighbors) {
        const { node: nextNode, travelTime } = neighbor;

        // Only add to queue if the island hasn’t been visited recently (based on interval)
        if (!visited.has(nextNode) || (Date.now() - (this.lastVisit.get(nextNode) || 0)) > visitInterval) {
          visited.add(nextNode);
          queue.push(nextNode);
          console.log(`Queueing ${nextNode} for visit with travel time ${travelTime}`);
        }
      }
    }
  }
}

// test cases
const tour = new IslandTour();
tour.addExperience('experience1', [
  { node: 'experience2', travelTime: 10, experienceTime: 5 },
  { node: 'experience3', travelTime: 15, experienceTime: 8 },
], 1000);

tour.addExperience('experience2', [
  { node: 'experience4', travelTime: 20, experienceTime: 12 },
], 800);

tour.addExperience('experience3', [
  { node: 'experience5', travelTime: 10, experienceTime: 7 },
], 500);

tour.addExperience('experience4', [], 1200); // No neighbors for experience4

const maxUniqueExperiences = tour.findMaxExperiences('experience1');
console.log(`Maximum unique experiences: ${maxUniqueExperiences}`);

// Example of knowledge sharing based on population priority and recency
console.log("Starting the leader's journey for knowledge sharing:");
tour.shareKnowledge('experience1', 10000); // 10 seconds as a visit interval example
