import { PROTOCOL_VERSION } from './protocol'
import type { SSEEvent } from './protocol'

/**
 * Returns true if the event's schema_version is compatible with this runtime.
 * Compatible means major version matches (minor additions are allowed).
 */
export function isCompatibleVersion(ev: SSEEvent): boolean {
  const [ourMajor] = PROTOCOL_VERSION.split('.').map(Number)
  const [evMajor] = (ev.schema_version ?? '').split('.').map(Number)
  return evMajor === ourMajor
}

/**
 * Throws if the event's schema_version is incompatible with this runtime.
 * Use at the transport boundary when you want hard guarantees.
 */
export function assertCompatibleVersion(ev: SSEEvent): void {
  if (!isCompatibleVersion(ev)) {
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${PROTOCOL_VERSION}, ` +
      `received ${ev.schema_version}. Upgrade @meso/types or your backend.`
    )
  }
}
