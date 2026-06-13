import json
import random
import uuid

states_data = {
    "Andhra Pradesh": {"coords": (15.9129, 79.7400), "coastal": True, "hill": False},
    "Arunachal Pradesh": {"coords": (28.2180, 94.7278), "coastal": False, "hill": True},
    "Assam": {"coords": (26.2006, 92.9376), "coastal": False, "hill": False},
    "Bihar": {"coords": (25.0961, 85.3131), "coastal": False, "hill": False},
    "Chhattisgarh": {"coords": (21.2787, 81.8661), "coastal": False, "hill": False},
    "Goa": {"coords": (15.2993, 74.1240), "coastal": True, "hill": False},
    "Gujarat": {"coords": (22.2587, 71.1924), "coastal": True, "hill": False},
    "Haryana": {"coords": (29.0588, 76.0856), "coastal": False, "hill": False},
    "Himachal Pradesh": {"coords": (31.1048, 77.1734), "coastal": False, "hill": True},
    "Jharkhand": {"coords": (23.6102, 85.2799), "coastal": False, "hill": True},
    "Karnataka": {"coords": (15.3173, 75.7139), "coastal": True, "hill": True},
    "Kerala": {"coords": (10.8505, 76.2711), "coastal": True, "hill": True},
    "Madhya Pradesh": {"coords": (22.9734, 78.6569), "coastal": False, "hill": False},
    "Maharashtra": {"coords": (19.7515, 75.7139), "coastal": True, "hill": True},
    "Manipur": {"coords": (24.6637, 93.9063), "coastal": False, "hill": True},
    "Meghalaya": {"coords": (25.4670, 91.3662), "coastal": False, "hill": True},
    "Mizoram": {"coords": (23.1645, 92.9376), "coastal": False, "hill": True},
    "Nagaland": {"coords": (26.1584, 94.5624), "coastal": False, "hill": True},
    "Odisha": {"coords": (20.9517, 85.9000), "coastal": True, "hill": False},
    "Punjab": {"coords": (31.1471, 75.3412), "coastal": False, "hill": False},
    "Rajasthan": {"coords": (27.0238, 74.2179), "coastal": False, "hill": False},
    "Sikkim": {"coords": (27.5330, 88.5122), "coastal": False, "hill": True},
    "Tamil Nadu": {"coords": (11.1271, 78.6569), "coastal": True, "hill": True},
    "Telangana": {"coords": (18.1124, 79.0193), "coastal": False, "hill": False},
    "Tripura": {"coords": (23.9408, 91.9882), "coastal": False, "hill": False},
    "Uttar Pradesh": {"coords": (26.8467, 80.9462), "coastal": False, "hill": False},
    "Uttarakhand": {"coords": (30.0668, 79.0193), "coastal": False, "hill": True},
    "West Bengal": {"coords": (22.9868, 87.8550), "coastal": True, "hill": True},
    "Andaman and Nicobar Islands": {"coords": (11.7401, 92.6586), "coastal": True, "hill": False},
    "Chandigarh": {"coords": (30.7333, 76.7794), "coastal": False, "hill": False},
    "Daman and Diu": {"coords": (20.1809, 73.0169), "coastal": True, "hill": False},
    "Lakshadweep": {"coords": (10.5667, 72.6417), "coastal": True, "hill": False},
    "Delhi": {"coords": (28.7041, 77.1025), "coastal": False, "hill": False},
    "Puducherry": {"coords": (11.9416, 79.8083), "coastal": True, "hill": False},
    "Jammu and Kashmir": {"coords": (33.7782, 76.5762), "coastal": False, "hill": True},
    "Ladakh": {"coords": (34.1526, 77.5771), "coastal": False, "hill": True}
}

categories = ["Temple", "Historical", "Waterfall", "Museum", "Wildlife Sanctuary", "Local Market", "Fort"]
coastal_categories = ["Beach", "Lighthouse", "Port"]
hill_categories = ["Viewpoint", "Trekking Trail", "Tea Garden", "Snow Peak"]

budgets = ["Budget", "Moderate", "Luxury"]
seasons = ["Winter", "Summer", "Monsoon", "All Year"]

locations = {}

def generate_places(state_name, data, num_places=30):
    base_lat, base_lng = data["coords"]
    
    for i in range(num_places):
        # Determine type
        possible_cats = categories.copy()
        if data["coastal"]: possible_cats.extend(coastal_categories)
        if data["hill"]: possible_cats.extend(hill_categories)
        
        place_type = random.choice(possible_cats)
        name = f"{state_name} {place_type} {i+1}"
        
        # Jitter coords within a roughly ~200km radius
        lat = base_lat + random.uniform(-2.0, 2.0)
        lng = base_lng + random.uniform(-2.0, 2.0)
        
        loc_id = f"{state_name[:3].upper()}_{uuid.uuid4().hex[:6].upper()}"
        
        locations[loc_id] = {
            "id": loc_id,
            "name": name,
            "state": state_name,
            "type": place_type,
            "lat": round(lat, 4),
            "lng": round(lng, 4),
            "description": f"A beautiful {place_type.lower()} located in the heart of {state_name}. A must-visit attraction for tourists looking for peace and adventure.",
            "scenic_score": random.randint(5, 10),
            "crowd_level": random.choice(["Low", "Moderate", "High", "Very High"]),
            "budget_category": random.choice(budgets),
            "best_season": random.choice(seasons),
            "estimated_cost_inr": random.randint(200, 5000),
            "suggested_visit_time_hours": random.randint(1, 8)
        }

def main():
    print("Generating 1000+ locations across 36 States and UTs...")
    for state, data in states_data.items():
        # Generate roughly 30 places per state = ~1080 places
        generate_places(state, data, random.randint(25, 35))
        
    print(f"Generated exactly {len(locations)} locations.")
    
    with open('locations.json', 'w') as f:
        json.dump(locations, f, indent=4)
        
    print("Saved to locations.json")

if __name__ == "__main__":
    main()
