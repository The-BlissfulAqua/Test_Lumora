// Re-export the project's canonical AnomalyService implementation from the root
// services folder. Some components import from `src/services/...` while others
// import from `services/...`. Re-exporting keeps a single implementation and
// avoids duplication / empty module runtime errors.

export * from '../../services/AnomalyService';
export { AnomalyService } from '../../services/AnomalyService';
