# Tourist Route Planner - Advanced AI Algorithms
# This script demonstrates Backtracking, Forward Checking, Minimax, and Alpha-Beta Pruning.

# 1. Simplified Indian Cities Graph with Distances (in km)
graph = {
    'Delhi': {'Agra': 200, 'Jaipur': 280, 'Chandigarh': 250},
    'Agra': {'Delhi': 200, 'Jaipur': 240, 'Kanpur': 280},
    'Jaipur': {'Delhi': 280, 'Agra': 240, 'Udaipur': 390},
    'Chandigarh': {'Delhi': 250, 'Shimla': 110},
    'Shimla': {'Chandigarh': 110}, # Dead end
    'Kanpur': {'Agra': 280, 'Varanasi': 330},
    'Varanasi': {'Kanpur': 330}, # Dead end
    'Udaipur': {'Jaipur': 390, 'Ahmedabad': 260},
    'Ahmedabad': {'Udaipur': 260, 'Mumbai': 530},
    'Mumbai': {'Ahmedabad': 530, 'Pune': 150},
    'Pune': {'Mumbai': 150}
}

# Heuristic distances to 'Mumbai' (Goal node for Minimax)
heuristic = {
    'Delhi': 1400, 'Agra': 1200, 'Jaipur': 1100, 'Chandigarh': 1600,
    'Shimla': 1700, 'Kanpur': 1300, 'Varanasi': 1500, 'Udaipur': 750,
    'Ahmedabad': 500, 'Mumbai': 0, 'Pune': 150
}

# ---------------------------------------------------------
# 1. BACKTRACKING
# ---------------------------------------------------------
print("\n" + "="*50)
print("1. BACKTRACKING ALGORITHM")
print("="*50)
print("Goal: Find a path from Delhi to Udaipur within a budget of 700 km.")

def backtracking_search(current, goal, max_cost, path, current_cost):
    if current == goal:
        return path, current_cost
    
    for neighbor, cost in graph[current].items():
        if neighbor not in path:
            if current_cost + cost <= max_cost:
                print(f"  -> Exploring: {neighbor} (Total: {current_cost + cost} km)")
                result = backtracking_search(neighbor, goal, max_cost, path + [neighbor], current_cost + cost)
                if result:
                    return result
            else:
                print(f"  <- Backtracking from {neighbor} (Exceeds budget: {current_cost + cost} > {max_cost})")
    return None

res_bt = backtracking_search('Delhi', 'Udaipur', 700, ['Delhi'], 0)
if res_bt:
    print(f"\n[SUCCESS] Route Found via Backtracking: {' -> '.join(res_bt[0])} | Cost: {res_bt[1]} km")
else:
    print("\n[FAILED] No route found within budget.")

# ---------------------------------------------------------
# 2. FORWARD CHECKING (CSP)
# ---------------------------------------------------------
print("\n" + "="*50)
print("2. FORWARD CHECKING ALGORITHM")
print("="*50)
print("Goal: Same as above, but look ahead to avoid dead ends (like Shimla/Varanasi).")

def forward_checking_search(current, goal, max_cost, path, current_cost):
    if current == goal:
        return path, current_cost
    
    for neighbor, cost in graph[current].items():
        if neighbor not in path and current_cost + cost <= max_cost:
            # Look ahead (Forward Checking)
            has_future = False
            if neighbor == goal:
                has_future = True
            else:
                for nn in graph[neighbor]:
                    if nn not in path and nn != current:
                        has_future = True
                        break
            
            if has_future:
                print(f"  -> Valid Forward Check: {neighbor} has outgoing routes.")
                result = forward_checking_search(neighbor, goal, max_cost, path + [neighbor], current_cost + cost)
                if result:
                    return result
            else:
                print(f"  [X] Pruning {neighbor} immediately (Forward Check detected a dead end).")
                
    return None

res_fc = forward_checking_search('Delhi', 'Udaipur', 700, ['Delhi'], 0)
if res_fc:
    print(f"\n[SUCCESS] Route Found via Forward Checking: {' -> '.join(res_fc[0])} | Cost: {res_fc[1]} km")

# ---------------------------------------------------------
# 3. MINIMAX ALGORITHM
# ---------------------------------------------------------
print("\n" + "="*50)
print("3. MINIMAX ALGORITHM")
print("="*50)
print("Scenario: Player MIN (Traveler) wants to reach Mumbai quickly.")
print("          Player MAX (Bad Weather) tries to delay the traveler.")
print("Max Depth: 3 (Evaluating worst-case scenario ahead)")

def minimax(current, depth, is_maximizing, path):
    if depth == 0 or current == 'Mumbai':
        return heuristic.get(current, float('inf'))

    if is_maximizing: # Weather's turn (maximize distance)
        max_eval = float('-inf')
        for neighbor in graph[current]:
            if neighbor not in path:
                ev = minimax(neighbor, depth - 1, False, path + [neighbor])
                max_eval = max(max_eval, ev)
        return max_eval if max_eval != float('-inf') else heuristic.get(current, float('inf'))
    else: # Traveler's turn (minimize distance)
        min_eval = float('inf')
        for neighbor in graph[current]:
            if neighbor not in path:
                ev = minimax(neighbor, depth - 1, True, path + [neighbor])
                min_eval = min(min_eval, ev)
        return min_eval if min_eval != float('inf') else heuristic.get(current, float('inf'))

# Find best move from Delhi using Minimax
best_move = None
best_val = float('inf')
for n in graph['Delhi']:
    move_val = minimax(n, 2, True, ['Delhi', n])
    print(f"  Evaluating move Delhi -> {n} | Minimax Score: {move_val}")
    if move_val < best_val:
        best_val = move_val
        best_move = n

print(f"\n[RESULT] Minimax recommends moving Delhi -> {best_move} (Assuming worst-case weather)")

# ---------------------------------------------------------
# 4. ALPHA-BETA PRUNING
# ---------------------------------------------------------
print("\n" + "="*50)
print("4. ALPHA-BETA PRUNING")
print("="*50)
print("Scenario: Same as Minimax, but dramatically faster by pruning useless branches.")

pruned_count = 0

def alpha_beta(current, depth, alpha, beta, is_maximizing, path):
    global pruned_count
    if depth == 0 or current == 'Mumbai':
        return heuristic.get(current, float('inf'))

    if is_maximizing:
        max_eval = float('-inf')
        for neighbor in graph[current]:
            if neighbor not in path:
                ev = alpha_beta(neighbor, depth - 1, alpha, beta, False, path + [neighbor])
                max_eval = max(max_eval, ev)
                alpha = max(alpha, ev)
                if beta <= alpha:
                    pruned_count += 1
                    break # Beta cut-off
        return max_eval if max_eval != float('-inf') else heuristic.get(current, float('inf'))
    else:
        min_eval = float('inf')
        for neighbor in graph[current]:
            if neighbor not in path:
                ev = alpha_beta(neighbor, depth - 1, alpha, beta, True, path + [neighbor])
                min_eval = min(min_eval, ev)
                beta = min(beta, ev)
                if beta <= alpha:
                    pruned_count += 1
                    break # Alpha cut-off
        return min_eval if min_eval != float('inf') else heuristic.get(current, float('inf'))

best_move_ab = None
best_val_ab = float('inf')
for n in graph['Delhi']:
    move_val = alpha_beta(n, 2, float('-inf'), float('inf'), True, ['Delhi', n])
    if move_val < best_val_ab:
        best_val_ab = move_val
        best_move_ab = n

print(f"  [RESULT] Alpha-Beta also recommends Delhi -> {best_move_ab}")
print(f"  [EFFICIENCY] The Alpha-Beta algorithm pruned {pruned_count} branches, saving computation time!")

# ---------------------------------------------------------
# 5. UNCERTAINTY-AWARE DECISIONS (EXPECTED UTILITY)
# ---------------------------------------------------------
print("\n" + "="*50)
print("5. UNCERTAINTY-AWARE DECISIONS (EXPECTED UTILITY)")
print("="*50)
print("Scenario: Deciding whether to take a scenic mountain route or a highway.")
print("The mountain route is faster but highly affected by bad weather.")
print("We use Expected Utility (EU) to make the best decision under uncertainty.")

# Actions: 'Highway', 'Mountain'
# States of Nature (Weather): 'Clear', 'Storm'
# Probabilities of Weather
P_weather = {'Clear': 0.7, 'Storm': 0.3}

# Utilities (Payouts/Scores for each action under each weather condition)
# Higher utility is better
utilities = {
    'Highway': {
        'Clear': 50,  # Pleasant, standard time
        'Storm': 40   # A bit slow, but safe
    },
    'Mountain': {
        'Clear': 100, # Beautiful, fast
        'Storm': -50  # Dangerous, blocked roads
    }
}

def calculate_expected_utility(action):
    eu = 0
    for weather, prob in P_weather.items():
        eu += prob * utilities[action][weather]
    return eu

best_action = None
max_eu = float('-inf')

for action in utilities.keys():
    eu = calculate_expected_utility(action)
    print(f"  Expected Utility for '{action}': {eu:.2f}")
    if eu > max_eu:
        max_eu = eu
        best_action = action

print(f"\n[RESULT] Optimal Decision under uncertainty: Take the '{best_action}' route (Max EU: {max_eu:.2f})")

# ---------------------------------------------------------
# 6. HIDDEN MARKOV MODELS (HMM) INTUITION FOR TRACKING
# ---------------------------------------------------------
print("\n" + "="*50)
print("6. HIDDEN MARKOV MODELS (HMM) INTUITION FOR SENSOR TRACKING")
print("="*50)
print("Scenario: Tracking a tourist's hidden state (At 'Hotel' or 'Attraction')")
print("using noisy sensor data (GPS showing 'Stationary' or 'Moving').")

# States: ['Hotel', 'Attraction']
# Observations: ['Stationary', 'Moving']

# Prior probabilities
prior = {'Hotel': 0.6, 'Attraction': 0.4}

# Transition Model: P(State_t | State_t-1)
transitions = {
    'Hotel': {'Hotel': 0.8, 'Attraction': 0.2},
    'Attraction': {'Hotel': 0.3, 'Attraction': 0.7}
}

# Sensor/Emission Model: P(Observation | State)
emissions = {
    'Hotel': {'Stationary': 0.9, 'Moving': 0.1},
    'Attraction': {'Stationary': 0.4, 'Moving': 0.6}
}

# Let's say we observe the sequence: ['Moving', 'Stationary']
# We will use a simple Forward algorithm approach to update beliefs (Sensor Fusion)
observations = ['Moving', 'Stationary']
beliefs = prior.copy()

for t, obs in enumerate(observations):
    print(f"\nTime Step {t+1} - Observation: '{obs}'")
    new_beliefs = {}
    
    # 1. Time Update (Predict next state based on transitions)
    predicted = {'Hotel': 0, 'Attraction': 0}
    for curr_state in transitions:
        for next_state in transitions[curr_state]:
            predicted[next_state] += beliefs[curr_state] * transitions[curr_state][next_state]
            
    # 2. Measurement Update (Update with sensor data using Bayes Rule intuition)
    for state in predicted:
        new_beliefs[state] = predicted[state] * emissions[state][obs]
        
    # 3. Normalize
    total_prob = sum(new_beliefs.values())
    for state in new_beliefs:
        new_beliefs[state] /= total_prob
        print(f"  P({state} | observations) = {new_beliefs[state]:.4f}")
        
    beliefs = new_beliefs

most_likely_current_state = max(beliefs, key=beliefs.get)
print(f"\n[RESULT] After observations {observations}, the tourist is most likely at: {most_likely_current_state}")
print("="*50 + "\n")

# ---------------------------------------------------------
# 7. BAYESIAN NETWORKS (PROBABILISTIC INFERENCE)
# ---------------------------------------------------------
print("\n" + "="*50)
print("7. BAYESIAN NETWORKS (PROBABILISTIC INFERENCE)")
print("="*50)
print("Scenario: Predicting 'Travel Delay' based on 'Weather' and 'Traffic'.")
print("Network Structure:")
print("  Weather -> Traffic")
print("  Weather, Traffic -> Travel Delay")

# Probabilities (Conditional Probability Tables - CPTs)
# P(Weather)
p_weather = {'Sunny': 0.7, 'Rainy': 0.3}

# P(Traffic | Weather)
p_traffic_given_weather = {
    'Sunny': {'Light': 0.8, 'Heavy': 0.2},
    'Rainy': {'Light': 0.4, 'Heavy': 0.6}
}

# P(Distance)
p_distance = {'Short': 0.3, 'Medium': 0.5, 'Long': 0.2}

# P(Delay | Traffic, Weather, Distance)
p_delay_given_traffic_weather_dist = {
    ('Light', 'Sunny', 'Short'): {'Yes': 0.02, 'No': 0.98},
    ('Heavy', 'Sunny', 'Short'): {'Yes': 0.15, 'No': 0.85},
    ('Light', 'Rainy', 'Short'): {'Yes': 0.10, 'No': 0.90},
    ('Heavy', 'Rainy', 'Short'): {'Yes': 0.40, 'No': 0.60},
    
    ('Light', 'Sunny', 'Medium'): {'Yes': 0.05, 'No': 0.95},
    ('Heavy', 'Sunny', 'Medium'): {'Yes': 0.30, 'No': 0.70},
    ('Light', 'Rainy', 'Medium'): {'Yes': 0.20, 'No': 0.80},
    ('Heavy', 'Rainy', 'Medium'): {'Yes': 0.70, 'No': 0.30},
    
    ('Light', 'Sunny', 'Long'): {'Yes': 0.15, 'No': 0.85},
    ('Heavy', 'Sunny', 'Long'): {'Yes': 0.50, 'No': 0.50},
    ('Light', 'Rainy', 'Long'): {'Yes': 0.35, 'No': 0.65},
    ('Heavy', 'Rainy', 'Long'): {'Yes': 0.85, 'No': 0.15}
}

def joint_probability(weather, traffic, distance, delay):
    """Calculates P(Weather, Traffic, Distance, Delay) using the Chain Rule."""
    p_w = p_weather[weather]
    p_t_given_w = p_traffic_given_weather[weather][traffic]
    p_dist = p_distance[distance]
    p_d = p_delay_given_traffic_weather_dist[(traffic, weather, distance)][delay]
    return p_w * p_t_given_w * p_dist * p_d

def conditional_probability_delay_given_weather_distance(delay_status, weather_status, distance_status):
    """Calculates P(Delay=delay_status | Weather=weather_status, Distance=distance_status)"""
    joint_w_d_dist = 0
    for t in ['Light', 'Heavy']:
        joint_w_d_dist += joint_probability(weather_status, t, distance_status, delay_status)
    return joint_w_d_dist / (p_weather[weather_status] * p_distance[distance_status])

print("\n--- Exact Inference by Enumeration ---")
p_delay_given_sunny_medium = conditional_probability_delay_given_weather_distance('Yes', 'Sunny', 'Medium')
print(f"  Probability of Delay given Sunny & Medium dist: {p_delay_given_sunny_medium:.4f}")

print("\n[RESULT] Bayesian Network inference completed successfully.")
print("="*50 + "\n")
