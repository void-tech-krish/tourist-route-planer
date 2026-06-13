import json
import math
import random

def haversine_dist(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def generate_itinerary(state, days, budget_tier, style_pref):
    try:
        with open('locations.json', 'r') as f:
            all_locations = json.load(f)
    except FileNotFoundError:
        return {"error": "Database not generated yet."}

    # 1. Filter by State
    state_locations = [loc for loc in all_locations.values() if loc["state"].lower() == state.lower()]
    if not state_locations:
        return {"error": f"No locations found for {state}."}

    # 2. Filter & Sort based on preferences
    # Give higher weight to locations matching the budget and style (if any specific style logic is added)
    def score_location(loc):
        score = loc["scenic_score"]
        if loc["budget_category"].lower() == budget_tier.lower():
            score += 5
        if style_pref.lower() in loc["type"].lower():
            score += 5
        return score

    state_locations.sort(key=score_location, reverse=True)

    # 3. Pick top (days * 2) locations to ensure 2 activities per day
    num_activities = days * 2
    selected = state_locations[:num_activities]

    # If we don't have enough, just use what we have
    if len(selected) < num_activities:
        selected = state_locations

    # 4. Traveling Salesman / Greedy Route Optimization (Start at first location, find nearest neighbor)
    route = []
    if selected:
        current = selected[0]
        route.append(current)
        selected.remove(current)
        
        while selected:
            # Find nearest
            nearest = min(selected, key=lambda x: haversine_dist(current["lat"], current["lng"], x["lat"], x["lng"]))
            route.append(nearest)
            selected.remove(nearest)
            current = nearest

    # 5. Build Day-by-Day Itinerary
    itinerary = []
    total_cost = 0
    actual_days = 0
    
    loc_idx = 0
    for day in range(1, days + 1):
        if loc_idx >= len(route):
            break # Stop generating empty days if we run out of locations
            
        day_plan = {
            "day": day,
            "title": f"Exploring {state} - Day {day}",
            "activities": []
        }
        
        # Add 2 activities per day if available
        if loc_idx < len(route):
            act1 = route[loc_idx]
            day_plan["activities"].append({
                "time": "10:00 AM",
                "location": act1,
                "cost": act1["estimated_cost_inr"]
            })
            total_cost += act1["estimated_cost_inr"]
            loc_idx += 1
            
        if loc_idx < len(route):
            act2 = route[loc_idx]
            dist = haversine_dist(route[loc_idx-1]["lat"], route[loc_idx-1]["lng"], act2["lat"], act2["lng"])
            travel_time = round((dist / 50) * 60) # mins
            
            day_plan["activities"].append({
                "time": "02:00 PM",
                "location": act2,
                "travel_from_previous": f"{dist:.1f} km ({travel_time} mins)",
                "cost": act2["estimated_cost_inr"]
            })
            total_cost += act2["estimated_cost_inr"]
            loc_idx += 1
            
        itinerary.append(day_plan)
        actual_days += 1

    return {
        "success": True,
        "state": state,
        "total_days": actual_days,
        "total_estimated_cost_inr": total_cost,
        "itinerary": itinerary
    }
