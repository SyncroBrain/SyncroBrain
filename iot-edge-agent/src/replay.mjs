/** Protocol record / replay for simulators (no live sockets). */

export function recordFrame(tape, frame) {
  tape.push({ at: Date.now(), frame });
  return tape;
}

export function replay(tape, handler) {
  return tape.map((entry) => handler(entry.frame));
}
