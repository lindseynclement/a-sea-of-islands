// represents each neighbor island's experiences
type Neighbor = {
  node: string;
  travelTime: number;
  experienceTime: number;
};

// manages the graph of experiences and handle the DFS traversal
class IslandTour {
  private graph: Map<string, Neighbor[]>; // each experience node points to an array of Neighbor objects

  constructor() {
    this.graph = new Map();
  }

  // adds an experience and its neighbors to the graph
  addExperience(experience: string, neighbors: Neighbor[]): void {
    this.graph.set(experience, neighbors);
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

  findMaxExperiences(start: string): number {
    const visited = new Set<string>([start]);
    return this.dfs(start, visited, 0, 0, 1);
  }
}

// test cases
const tour = new IslandTour();
tour.addExperience('experience1', [
  { node: 'experience2', travelTime: 10, experienceTime: 5 },
  { node: 'experience3', travelTime: 15, experienceTime: 8 },
]);

tour.addExperience('experience2', [
  { node: 'experience4', travelTime: 20, experienceTime: 12 },
]);

tour.addExperience('experience3', [
  { node: 'experience5', travelTime: 10, experienceTime: 7 },
]);

const maxUniqueExperiences = tour.findMaxExperiences('experience1');
console.log(`Maximum unique experiences: ${maxUniqueExperiences}`);
