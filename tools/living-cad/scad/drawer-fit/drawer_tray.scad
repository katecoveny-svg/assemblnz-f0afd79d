// assembl / living — drawer fit · tray
// -------------------------------------
// A tray sized to a measured drawer, with a grid of compartments. Every
// dimension a customer or a maker would change is a parameter at the top;
// everything below derives from them. No library dependencies, so the file
// carries no third-party licence. OpenSCAD 2021.01 or newer.
//
// Status: proposed, unprinted. Print one at a small size before trusting
// the clearances. Not for sale.

/* [Drawer, measured inside, in mm] */
drawer_width  = 300;   // left to right, inside the drawer
drawer_depth  = 400;   // front to back, inside the drawer
drawer_height = 60;    // floor to the underside of the drawer above, or the lip

/* [Tray] */
clearance     = 1.5;   // taken off each side so the tray drops in without force
tray_height   = 45;    // overall height; keep below drawer_height minus 5
wall          = 1.6;   // outer wall; 0.4 mm nozzle × 4 perimeters
floor_t       = 1.2;   // floor thickness
corner_r      = 6;     // outer corner radius

/* [Compartments] */
columns       = 3;     // compartments left to right
rows          = 2;     // compartments front to back
divider_t     = 1.2;   // divider thickness
divider_drop  = 8;     // dividers sit this much lower than the wall, so things are easy to lift out

/* [Label slot, on the front wall] */
label         = true;
label_width   = 60;
label_height  = 14;
label_depth   = 1.0;   // recess depth for a printed or paper label

/* [Printer limits] */
max_print     = 250;   // largest axis the printer bed accepts; the tray is split when exceeded

$fn = 48;

tray_w = drawer_width  - 2 * clearance;
tray_d = drawer_depth  - 2 * clearance;
tray_h = min(tray_height, drawer_height - 5);

assert(tray_w > 2 * wall + 10, "drawer too narrow for a tray");
assert(tray_h > floor_t + 5, "tray too low");

module rounded_box(w, d, h, r) {
    hull() for (x = [r, w - r], y = [r, d - r]) translate([x, y, 0]) cylinder(r = r, h = h);
}

module tray_body() {
    difference() {
        rounded_box(tray_w, tray_d, tray_h, corner_r);
        // cavity
        translate([wall, wall, floor_t])
            rounded_box(tray_w - 2 * wall, tray_d - 2 * wall, tray_h, max(corner_r - wall, 1));
        // label recess, front wall, centred
        if (label)
            translate([(tray_w - label_width) / 2, -0.01, tray_h - label_height - 4])
                cube([label_width, label_depth + 0.01, label_height]);
    }
}

module dividers() {
    inner_w = tray_w - 2 * wall;
    inner_d = tray_d - 2 * wall;
    h = tray_h - divider_drop;
    for (c = [1 : columns - 1])
        translate([wall + c * inner_w / columns - divider_t / 2, wall, 0]) cube([divider_t, inner_d, h]);
    for (r = [1 : rows - 1])
        translate([wall, wall + r * inner_d / rows - divider_t / 2, 0]) cube([inner_w, divider_t, h]);
}

module drawer_tray() {
    union() { tray_body(); dividers(); }
}

// Split along X when the tray is wider than the bed; each half gets a straight edge to butt against the other.
splits = ceil(tray_w / max_print);
if (splits <= 1) {
    drawer_tray();
} else {
    piece_w = tray_w / splits;
    for (i = [0 : splits - 1])
        translate([i * (piece_w + 10), 0, 0])
            intersection() {
                drawer_tray();
                translate([i * piece_w, -1, -1]) cube([piece_w, tray_d + 2, tray_h + 2]);
            }
    echo(str("Tray wider than the bed: printed as ", splits, " pieces of ", piece_w, " mm"));
}

echo(str("drawer tray ", tray_w, " × ", tray_d, " × ", tray_h, " mm, ", columns, " × ", rows, " compartments"));
