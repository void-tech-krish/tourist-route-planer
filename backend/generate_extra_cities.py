import json

# Read the massive database
with open('locations.json', 'r') as f:
    locations = json.load(f)

# Group by state
state_locs = {}
for loc_id, data in locations.items():
    state = data["state"]
    if state not in state_locs:
        state_locs[state] = []
    state_locs[state].append(data)

# Pick up to 8 cities per state to add to the Map
extra_nodes = {}
for state, locs in state_locs.items():
    for loc in locs[:8]: # 8 per state * 36 = 288 cities!
        extra_nodes[loc["id"]] = {
            "id": loc["id"],
            "name": f'{loc["name"]} ({loc["state"]})',
            "lat": loc["lat"],
            "lng": loc["lng"]
        }

# Generate JS code
js_code = "export const extraNodes = {\n"
for key, val in extra_nodes.items():
    js_code += f"    '{key}': {json.dumps(val)},\n"
js_code += "};\n"

with open('../frontend/src/utils/extra_cities.js', 'w') as f:
    f.write(js_code)

print(f"Generated extra_cities.js with {len(extra_nodes)} new locations!")
