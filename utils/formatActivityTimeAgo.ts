import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { parseISO } from "date-fns/parseISO"

export function formatActivityTimeAgo(created: string) {
  return formatDistanceToNow(parseISO(created), { addSuffix: true })
}
