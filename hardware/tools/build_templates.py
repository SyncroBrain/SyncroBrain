#!/usr/bin/env python3
"""Write reference schematic, PCB, BOM, Gerber, and drill files.

These are review artifacts for later bench acceptance. They are not a
hardware-verified fabrication release and they are not a 220 V safety design.
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "templates"

BOARDS = [
    {
        "id": "A-env-node",
        "kit": "kit-env-node",
        "title": "Environment sensor node",
        "mcu": "ESP32-C3 module (alt: nRF52840 for battery door)",
        "size": (50, 40),
        "bom": [
            ("U1", "1", "Wi-Fi/BLE module", "ESP32-C3-MINI-1", "nRF52840 module"),
            ("U2", "1", "3.3V LDO", "AMS1117-3.3", "ME6211C33"),
            ("J1", "1", "Probe header", "XH-2.54 6pin", "JST GH"),
            ("D1", "1", "TVS array", "SRV05-4", "ESD9B"),
            ("SW1", "1", "Kill switch dry contact", "tactile", "terminal block"),
        ],
    },
    {
        "id": "B-relay-4ch",
        "kit": "kit-rly-4ch",
        "title": "Four relay actuator",
        "mcu": "ESP32-C3 module (alt: BK7231N protocol path)",
        "size": (70, 50),
        "bom": [
            ("U1", "1", "Wi-Fi module", "ESP32-C3-MINI-1", "BK7231N module"),
            ("K1-K4", "4", "Relay 12/24V", "Hongfa HF32", "Omron G5V"),
            ("Q1-Q4", "4", "Coil driver", "SS8050", "2N3904"),
            ("D1-D4", "4", "Flyback diode", "1N4148", "SS14"),
            ("U2", "1", "3.3V LDO", "AMS1117-3.3", "ME6211C33"),
        ],
    },
    {
        "id": "C-win-act",
        "kit": "kit-win-act",
        "title": "Window linear actuator",
        "mcu": "ESP32-C3 module",
        "size": (60, 45),
        "bom": [
            ("U1", "1", "Wi-Fi module", "ESP32-C3-MINI-1", "ESP32-S3-MINI"),
            ("U3", "1", "H-bridge", "DRV8871", "dual relay"),
            ("SW_OPEN", "1", "Open limit", "microswitch", "hall"),
            ("SW_CLOSE", "1", "Close limit", "microswitch", "hall"),
            ("J_RAIN", "1", "Rain contact", "terminal", "XH"),
        ],
    },
    {
        "id": "D-valve-pump",
        "kit": "kit-valve-8z / kit-pond-ctrl",
        "title": "Valve and pump driver",
        "mcu": "ESP32-C3 or CH32V307 + radio module",
        "size": (80, 55),
        "bom": [
            ("U1", "1", "MCU module", "ESP32-C3-MINI-1", "CH32V307 + FC41D"),
            ("K_PUMP", "1", "Pump contactor", "24V relay", "SSR"),
            ("K_VALVE", "4", "Valve drivers", "MOS+relay", "ULN2803"),
            ("J_420", "1", "4-20mA isolated input", "ISO124 style", "optocoupler ADC"),
            ("J_FLOW", "1", "Flow pulse", "terminal", "XH"),
        ],
    },
    {
        "id": "E-cold-trk",
        "kit": "kit-cold-trk",
        "title": "Cold-chain tracker",
        "mcu": "ESP32-C3 or CH32 + Cat-1",
        "size": (65, 45),
        "bom": [
            ("U1", "1", "MCU", "ESP32-C3-MINI-1", "CH32V203"),
            ("U4", "1", "Cat-1 module", "Quectel EC800", "SIMCom A7670"),
            ("U5", "1", "GNSS", "module built-in", "AT6558"),
            ("J_TEMP", "1", "Temperature probe", "DS18B20", "NTC"),
            ("BT1", "1", "Li-ion pack", "18650 holder", "pouch"),
        ],
    },
    {
        "id": "F-fan-aux",
        "kit": "kit-fan-pwm",
        "title": "Aux fan for EV or ESS shed",
        "mcu": "ESP32-C3 module",
        "size": (55, 40),
        "bom": [
            ("U1", "1", "Wi-Fi module", "ESP32-C3-MINI-1", "ESP32-S3-MINI"),
            ("U6", "1", "PWM isolator", "optocoupler", "0-10V isolator"),
            ("J_FAN", "1", "Fan output", "terminal", "XH"),
        ],
    },
    {
        "id": "G-gateway",
        "kit": "kit-gw-esp",
        "title": "RS485 field gateway carrier",
        "mcu": "ESP32-S3 module (heavy protocols use N100, not this PCB)",
        "size": (70, 50),
        "bom": [
            ("U1", "1", "Wi-Fi module", "ESP32-S3-MINI-1", "ESP32-C3-MINI-1"),
            ("U7", "1", "Isolated RS485", "ISO3082", "MAX3485 + opto"),
            ("J_ETH", "0", "Ethernet not on this board", "use N100 box", "RK3568"),
        ],
    },
]


def mm_to_kicad(mm: float) -> str:
    return f"{mm:.4f}"


def write_bom(board: dict, folder: Path) -> None:
    path = folder / "bom.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["ref", "qty", "value", "example_mfr", "alternate", "kit"])
        for row in board["bom"]:
            w.writerow([*row, board["kit"]])


def write_schematic(board: dict, folder: Path) -> None:
    title = board["title"].replace('"', "")
    text = f"""(kicad_sch
  (version 20231120)
  (generator "syncrobrain-hw-template")
  (generator_version "0.1")
  (uuid "a0e5c3b2-1111-4111-8111-{board['id'][:8].encode().hex()[:12]}")
  (paper "A4")
  (title_block
    (title "{title}")
    (date "2026-09-21")
    (rev "0.1-reference")
    (comment 1 "Not hardware-verified. Review before fab.")
    (comment 2 "{board['mcu']}")
  )
  (lib_symbols)
  (text "{title}\\nKit {board['kit']}\\nMCU {board['mcu']}\\nReference only — local kill, 3.3V logic, isolated actuator supply."
    (at 25.4 25.4 0)
    (effects (font (size 2.54 2.54)) (justify left))
    (uuid "b0e5c3b2-2222-4222-8222-{board['id'][:8].encode().hex()[:12]}")
  )
  (sheet_instances
    (path "/" (page "1"))
  )
)
"""
    # uuid hex from id may not be hex if id has letters only - A-env is fine with encode hex
    (folder / f"{board['id']}.kicad_sch").write_text(text, encoding="utf-8")


def write_pcb(board: dict, folder: Path) -> None:
    w, h = board["size"]
    body = f"""(kicad_pcb
  (version 20240108)
  (generator "syncrobrain-hw-template")
  (generator_version "0.1")
  (general (thickness 1.6))
  (paper "A4")
  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
    (36 "B.SilkS" user)
    (37 "F.SilkS" user)
    (38 "B.Mask" user)
    (39 "F.Mask" user)
    (44 "Edge.Cuts" user)
  )
  (setup (pad_to_mask_clearance 0))
  (net 0 "")
  (gr_rect
    (start 0 0)
    (end {mm_to_kicad(w)} {mm_to_kicad(h)})
    (stroke (width 0.15) (type default))
    (layer "Edge.Cuts")
    (uuid "c0e5c3b2-3333-4333-8333-000000000001")
  )
  (gr_text "{board['id']} reference"
    (at 5 5 0)
    (layer "F.SilkS")
    (uuid "c0e5c3b2-3333-4333-8333-000000000002")
    (effects (font (size 1.2 1.2) (thickness 0.15)))
  )
)
"""
    (folder / f"{board['id']}.kicad_pcb").write_text(body, encoding="utf-8")


def xy(x_mm: float, y_mm: float) -> str:
    return f"X{int(round(x_mm * 1_000_000))}Y{int(round(y_mm * 1_000_000))}"


def write_gerber(board: dict, folder: Path) -> None:
    w, h = board["size"]
    gerber = folder / "gerber"
    gerber.mkdir(exist_ok=True)
    header = (
        "G04 SyncroBrain reference gerber. Not a released fab package.*\n"
        "%TF.GenerationSoftware,SyncroBrain,hw-template,0.1*%\n"
        "%FSLAX46Y46*%\n%MOMM*%\n"
    )
    edge = (
        header
        + "%ADD10C,0.150000*%\nD10*\n"
        + f"{xy(0, 0)}D02*\n{xy(w, 0)}D01*\n{xy(w, h)}D01*\n{xy(0, h)}D01*\n{xy(0, 0)}D01*\n"
        + "M02*\n"
    )
    (gerber / f"{board['id']}-Edge_Cuts.gbr").write_text(edge, encoding="utf-8")
    # Four module pads on front copper, 1.0 mm apertures.
    pads = header + "%ADD11C,1.000000*%\nD11*\n"
    for i, (x, y) in enumerate(((8, 12), (12, 12), (8, 16), (12, 16))):
        pads += f"{xy(x, y)}D03*\n"
    pads += "M02*\n"
    (gerber / f"{board['id']}-F_Cu.gbr").write_text(pads, encoding="utf-8")
    back = header + "%ADD12C,0.200000*%\nD12*\n" + f"{xy(2, 2)}D02*\n{xy(w - 2, 2)}D01*\nM02*\n"
    (gerber / f"{board['id']}-B_Cu.gbr").write_text(back, encoding="utf-8")
    silk = header + "%ADD13C,0.150000*%\nD13*\n" + f"{xy(6, 6)}D02*\n{xy(30, 6)}D01*\nM02*\n"
    (gerber / f"{board['id']}-F_SilkS.gbr").write_text(silk, encoding="utf-8")
    mask = header + "%ADD14C,1.200000*%\nD14*\n"
    for x, y in ((8, 12), (12, 12), (8, 16), (12, 16)):
        mask += f"{xy(x, y)}D03*\n"
    mask += "M02*\n"
    (gerber / f"{board['id']}-F_Mask.gbr").write_text(mask, encoding="utf-8")
    drill = (
        "; SyncroBrain reference drill. Not hardware-verified.\n"
        "M48\n"
        "METRIC,TZ\n"
        "T01C0.800\n"
        "%\n"
        "T01\n"
    )
    for x, y in ((8, 12), (12, 12), (8, 16), (12, 16)):
        drill += f"X{x:.3f}Y{y:.3f}\n"
    drill += "M30\n"
    (gerber / f"{board['id']}.drl").write_text(drill, encoding="utf-8")
    readme = (
        f"# {board['id']} fab files\n\n"
        "Reference Gerber/Excellon for later human review.\n"
        "Not DRC-clean, not impedance-controlled, not a 220 V safety design,\n"
        "and not hardware-verified.\n"
    )
    (gerber / "README.md").write_text(readme, encoding="utf-8")


def main() -> None:
    index = []
    for board in BOARDS:
        folder = OUT / board["id"]
        folder.mkdir(parents=True, exist_ok=True)
        write_bom(board, folder)
        write_schematic(board, folder)
        write_pcb(board, folder)
        write_gerber(board, folder)
        (folder / "README.md").write_text(
            f"# {board['title']}\n\n"
            f"- Kit: `{board['kit']}`\n"
            f"- MCU placeholder: {board['mcu']}\n"
            "- Open the `.kicad_sch` / `.kicad_pcb` in KiCad 8 for editing.\n"
            "- `gerber/` is a reference plot generated with this repo, for review before you fab.\n"
            "- Not hardware-verified.\n",
            encoding="utf-8",
        )
        index.append({"id": board["id"], "kit": board["kit"], "title": board["title"]})
    (OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(BOARDS)} templates under {OUT}")


if __name__ == "__main__":
    main()
