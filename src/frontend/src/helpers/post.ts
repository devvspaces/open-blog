import { Post } from "../../../declarations/backend/backend.did";
import { PostStatus } from "./types";

/**
 * Get post status from candid variant
 * @param post
 */
export function getPostStatus(post: Post) {
  if ((post.status as any).Draft === null) {
    return PostStatus.Draft;
  }
  if ((post.status as any).Published === null) {
    return PostStatus.Published;
  }
  if ((post.status as any).Archived === null) {
    return PostStatus.Archived;
  }
}