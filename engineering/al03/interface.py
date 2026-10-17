# Assembl Living AL-03 CAD generation
# Source of truth: use the complete tested CadQuery generator in the downloadable AL-03 engineering pack.
# This repo file records the engineering interface and release gates until CAD binaries are uploaded.
AL03 = {
 "revision":"AL-03-experimental",
 "geometry":"keyed desktop locating peg (NOT bayonet / locking)",
 "pitch_mm":70,
 "nominal_male_radius_mm":11.8,
 "female_clearance_test_mm":[0.20,0.35,0.50],
 "components":["dock","fluted cup short","fluted cup tall","grid panel","desktop adapter","3 female tolerance coupons"],
 "validated":{"closed_stl_surfaces":True,"physical_fit":False,"wall_load":False,"commercial_release":False},
}
