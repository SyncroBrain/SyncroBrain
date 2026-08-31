/** Modbus TCP ADU helper + register map apply (no live socket in unit tests). */

export function buildReadHoldingRegisters(unitId, address, quantity) {
  const pdu = Buffer.alloc(5);
  pdu.writeUInt8(0x03, 0);
  pdu.writeUInt16BE(address, 1);
  pdu.writeUInt16BE(quantity, 3);
  const mbap = Buffer.alloc(7);
  mbap.writeUInt16BE(1, 0);
  mbap.writeUInt16BE(0, 2);
  mbap.writeUInt16BE(pdu.length + 1, 4);
  mbap.writeUInt8(unitId, 6);
  return Buffer.concat([mbap, pdu]);
}

export function decodeRegisters(buffer, map) {
  const out = {};
  for (const [key, spec] of Object.entries(map)) {
    const offset = spec.offset * 2;
    if (spec.type === "u16") out[key] = buffer.readUInt16BE(offset) * (spec.scale ?? 1);
    else if (spec.type === "i16") out[key] = buffer.readInt16BE(offset) * (spec.scale ?? 1);
    else if (spec.type === "u32") out[key] = buffer.readUInt32BE(offset) * (spec.scale ?? 1);
    else out[key] = buffer.readUInt16BE(offset) * (spec.scale ?? 1);
  }
  return out;
}

export function applyMap(registers, map) {
  const buf = Buffer.alloc(512);
  for (const [addr, value] of Object.entries(registers)) {
    buf.writeUInt16BE(Number(value), Number(addr) * 2);
  }
  return decodeRegisters(buf, map);
}

/** Modbus RTU CRC-16 (poly 0xA001). */
export function crc16(buffer) {
  let crc = 0xffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >> 1) ^ 0xa001 : crc >> 1;
    }
  }
  return crc & 0xffff;
}

export function buildReadHoldingRegistersRtu(unitId, address, quantity) {
  const pdu = Buffer.alloc(6);
  pdu.writeUInt8(unitId, 0);
  pdu.writeUInt8(0x03, 1);
  pdu.writeUInt16BE(address, 2);
  pdu.writeUInt16BE(quantity, 4);
  const out = Buffer.alloc(8);
  pdu.copy(out);
  out.writeUInt16LE(crc16(pdu), 6);
  return out;
}
