import json
import uuid

from updated_real_locations import real_locations

# Ensure we have locations object for backend
locations = {}

# Ensure we have extraNodes for frontend
extra_nodes = {}

for state, places in real_locations.items():
    for name, place_type, lat, lng in places:
        loc_id = f"{state[:3].upper()}_{uuid.uuid4().hex[:6].upper()}"
        
        # Backend JSON structure
        locations[loc_id] = {
            "id": loc_id,
            "name": name,
            "state": state,
            "type": place_type,
            "lat": lat,
            "lng": lng,
            "description": f"Famous {place_type.lower()} in {state}.",
            "scenic_score": 8,
            "crowd_level": "High",
            "budget_category": "Moderate",
            "best_season": "All Year",
            "estimated_cost_inr": 1500,
            "suggested_visit_time_hours": 3
        }
        
        # Frontend JS structure
        extra_nodes[loc_id] = {
            "id": loc_id,
            "name": f"{name} ({state})",
            "lat": lat,
            "lng": lng
        }

# 1. Write backend locations.json
with open('locations.json', 'w') as f:
    json.dump(locations, f, indent=4)
print(f"Generated locations.json with {len(locations)} real locations.")

# 2. Write frontend extra_cities.js
js_code = "export const extraNodes = {\n"
for key, val in extra_nodes.items():
    js_code += f"    '{key}': {json.dumps(val)},\n"
js_code += "};\n"

with open('../frontend/src/utils/extra_cities.js', 'w') as f:
    f.write(js_code)
print(f"Generated extra_cities.js with {len(extra_nodes)} real locations.")
