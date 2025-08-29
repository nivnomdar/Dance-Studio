export interface ClassImagesSectionHandle {
  uploadPendingImages: () => Promise<void>;
  commitDeletions: () => Promise<void>;
}
