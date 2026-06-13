from flask import Flask, jsonify, request
from flask_cors import CORS
import ai_algorithms
import planner
import os
import random
import json

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "message": "Tourist Route Planner API is running",
        "algorithms_available": ["backtracking", "forward_checking", "minimax", "alpha_beta"]
    })

@app.route('/api/route/backtracking', methods=['POST'])
def route_backtracking():
    data = request.json
    source = data.get('source', 'Delhi')
    target = data.get('target', 'Udaipur')
    max_cost = data.get('max_cost', 700)
    
    res = ai_algorithms.backtracking_search(source, target, max_cost, [source], 0)
    if res:
        return jsonify({"success": True, "path": res[0], "cost": res[1]})
    return jsonify({"success": False, "message": "No route found within budget."})

@app.route('/api/route/minimax', methods=['POST'])
def route_minimax():
    data = request.json
    source = data.get('source', 'Delhi')
    target = data.get('target', 'Mumbai') # Fixed goal in current script
    
    best_move = None
    best_val = float('inf')
    
    if source in ai_algorithms.graph:
        for n in ai_algorithms.graph[source]:
            move_val = ai_algorithms.minimax(n, 2, True, [source, n])
            if move_val < best_val:
                best_val = move_val
                best_move = n
                
    if best_move:
        return jsonify({"success": True, "next_best_move": best_move, "score": best_val})
    return jsonify({"success": False, "message": "No path evaluated."})

@app.route('/api/plan-itinerary', methods=['POST'])
def plan_itinerary():
    data = request.json
    state = data.get('state', 'Delhi')
    days = data.get('days', 3)
    budget_tier = data.get('budget', 'Moderate')
    style_pref = data.get('style', 'Temple')
    
    result = planner.generate_itinerary(state, int(days), budget_tier, style_pref)
    
    if "error" in result:
        return jsonify({"success": False, "message": result["error"]})
        
    return jsonify(result)

@app.route('/api/chat', methods=['POST'])
def chat_bot():
    data = request.json
    user_message = data.get('message', '').lower()
    
    # Try Gemini first if key exists
    api_key = os.environ.get("GEMINI_API_KEY")
    if HAS_GEMINI and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"You are Travelora, an AI travel assistant for India. Be concise, helpful, and friendly. User asks: {user_message}"
            response = model.generate_content(prompt)
            return jsonify({"success": True, "reply": response.text})
        except Exception as e:
            print("Gemini error:", e)
            pass

    # Advanced Rule-based Fallback
    try:
        with open('locations.json', 'r') as f:
            all_locations = json.load(f)
    except:
        all_locations = {}

    states_map = {loc["state"].lower(): loc["state"] for loc in all_locations.values() if "state" in loc}
    cities_map = {loc["name"].lower(): loc for loc in all_locations.values() if "name" in loc}
    
    aliases = {"gujrat": "gujarat", "maharastra": "maharashtra", "bangalore": "bengaluru", "kerala": "kerala"}
    
    user_message_clean = user_message.replace('?', '').replace(',', '')
    words = user_message_clean.split()
    
    for i, w in enumerate(words):
        if w in aliases:
            words[i] = aliases[w]
            user_message_clean = user_message_clean.replace(w, aliases[w])

    if any(word in user_message_clean for word in ['hi', 'hello', 'hey', 'greetings']):
        responses = [
            "Hello! I'm Travelora. Which state or city are you planning to visit?",
            "Hi there! Ready to explore India? Let me know where you want to go!",
            "Greetings! I can help you pick a destination. What's on your mind?"
        ]
        return jsonify({"success": True, "reply": random.choice(responses)})
        
    if 'budget' in user_message_clean or 'cost' in user_message_clean or 'cheap' in user_message_clean:
        responses = [
            "We offer itineraries for Backpackers, Moderate, and Luxury budgets. You can select your preference in the planner menu!",
            "I can optimize routes to minimize costs. Just choose the 'Backpacker' option when planning your trip!"
        ]
        return jsonify({"success": True, "reply": random.choice(responses)})
        
    if any(word in user_message_clean for word in ['thanks', 'thank', 'awesome', 'great', 'nice']):
        return jsonify({"success": True, "reply": "You're very welcome! Let me know if you need more travel ideas."})
        
    if any(word in user_message_clean for word in ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay']):
        return jsonify({"success": True, "reply": "Great! Simply use the trip planner form on this page to get your detailed day-by-day itinerary."})

    matched_state = None
    for state_lower, state_real in states_map.items():
        if state_lower in user_message_clean or any(state_lower == w for w in words):
            matched_state = state_real
            break

    matched_city = None
    for city_lower, loc in cities_map.items():
        if city_lower in user_message_clean or any(city_lower == w for w in words):
            matched_city = loc
            break

    if matched_city:
        city_name = matched_city["name"]
        city_state = matched_city.get("state", "India")
        responses = [
            f"{city_name} is a fantastic choice! It's located in {city_state}. You can use the trip planner to build a full itinerary around {city_state}.",
            f"I see you're interested in {city_name}. We have it in our database! Just select {city_state} in the planner to get started."
        ]
        return jsonify({"success": True, "reply": random.choice(responses)})

    if matched_state:
        locs_in_state = [loc["name"] for loc in all_locations.values() if loc.get("state", "").lower() == matched_state.lower()]
        places = ", ".join(locs_in_state[:3]) if locs_in_state else "many great spots"
        responses = [
            f"{matched_state} is a wonderful destination! You can visit places like {places}. Simply select {matched_state} in the planner form to generate your trip!",
            f"I know some great spots in {matched_state}, including {places}. Use the trip planner to see the best routes and budgets!",
        ]
        return jsonify({"success": True, "reply": random.choice(responses)})
    
    longest_word = max(words, key=len) if words else ""
    if len(longest_word) > 4 and longest_word not in ['about', 'where', 'planning', 'want', 'visit', 'please']:
        reply = f"I'm still learning about '{longest_word.title()}'. Currently, I have data for major cities and states. Could you specify the state?"
    else:
        reply = "I can help you plan a multi-day itinerary based on your budget and style. Just let me know the state or a major city!"

    return jsonify({"success": True, "reply": reply})

@app.route('/api/bayesian_delay', methods=['POST'])
def bayesian_delay():
    data = request.json
    weather = data.get('weather', 'Sunny')
    distance_km = data.get('distance_km', 500) # Default to medium if not provided
    
    if distance_km < 500:
        distance_status = 'Short'
    elif distance_km < 1500:
        distance_status = 'Medium'
    else:
        distance_status = 'Long'
    
    try:
        p_delay = ai_algorithms.conditional_probability_delay_given_weather_distance('Yes', weather, distance_status)
        return jsonify({"success": True, "weather": weather, "distance_status": distance_status, "probability": p_delay})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    print("Starting AI Tourist Route Planner Backend on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
