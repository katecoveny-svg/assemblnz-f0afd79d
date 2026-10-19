// assembl / living — drawer fit · free divider
// --------------------------------------------
// A standalone divider that wedges across a drawer with soft end feet, for
// drawers that get dividers but no tray (cutlery, linen, socks). Length is
// the measured inside dimension less clearance; the feet give a little
// spring. No library dependencies. Proposed, unprinted, not for sale.

/* [Drawer, measured inside, in mm] */
span          = 400;   // inside dimension the divider crosses
drawer_height = 60;

/* [Divider] */
clearance     = 0.6;   // total; the feet take up the rest
height        = 40;    // keep below drawer_height minus 5
thickness     = 2.0;
foot_length   = 18;    // the flat foot at each end that touches the drawer side
foot_t        = 1.2;   // foot plate thickness; thinner flexes more
notch_pitch   = 0;     // 0 = none; otherwise notches every n mm for crossing dividers
notch_depth   = 20;

$fn = 32;

len = span - clearance;
h = min(height, drawer_height - 5);

module blade() { cube([len, thickness, h]); }

module feet() {
    for (x = [0, len - foot_t])
        translate([x, -foot_length / 2 + thickness / 2, 0]) cube([foot_t, foot_length, h]);
}

module notches() {
    if (notch_pitch > 0)
        for (x = [notch_pitch : notch_pitch : len - notch_pitch])
            translate([x - thickness / 2 - 0.2, -1, h - notch_depth]) cube([thickness + 0.4, thickness + 2, notch_depth + 1]);
}

difference() { union() { blade(); feet(); } notches(); }

echo(str("divider ", len, " × ", h, " mm, feet ", foot_length, " mm"));
