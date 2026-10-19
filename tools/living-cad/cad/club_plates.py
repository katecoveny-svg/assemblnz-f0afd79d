"""Batch number plates for a club or school.

Usage:  python3 cad/club_plates.py riders.csv out_dir [club name]
CSV columns: number,name   (header optional). One plate STL + one lettering STL per rider,
plus a summary CSV the print partner can work from.
"""
import csv, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally as d

FONT = os.path.join(os.path.dirname(__file__), "..", "fonts", "InstrumentSans-SemiBold.ttf")


def main(csv_path, out_dir, club=""):
    os.makedirs(out_dir, exist_ok=True)
    rows = []
    with open(csv_path, newline="") as f:
        for r in csv.reader(f):
            if not r or r[0].strip().lower() == "number":
                continue
            num = "".join(ch for ch in r[0] if ch.isdigit())[:3]
            name = (r[1] if len(r) > 1 else "").strip().upper()[:12]
            if not num:
                continue
            plate, text = d.number_plate(num, name or club.upper()[:12] or " ", FONT)
            base = f"plate-{num}-{''.join(c for c in name if c.isalnum()) or 'rider'}"
            lib.to_trimesh(plate).export(os.path.join(out_dir, base + ".stl"))
            lib.to_trimesh(text).export(os.path.join(out_dir, base + "-lettering.stl"))
            rows.append((num, name, base + ".stl", base + "-lettering.stl"))
    with open(os.path.join(out_dir, "plates.csv"), "w", newline="") as f:
        w = csv.writer(f); w.writerow(["number", "name", "plate_file", "lettering_file"]); w.writerows(rows)
    print(f"{len(rows)} plates written to {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "")
