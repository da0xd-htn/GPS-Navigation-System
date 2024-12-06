import networkx as nx
import csv
import pickle
import math

# Haversine formula to calculate distance between two lat-lon points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Radius of the Earth in kilometers
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Load graph from CSV
def load_graph(csv_file):
    G = nx.Graph()
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        next(reader)
        for row in reader:
            lat1, lon1, lat2, lon2, distance = map(float, row)
            node1 = (lat1, lon1)
            node2 = (lat2, lon2)
            G.add_node(node1)
            G.add_node(node2)
            G.add_edge(node1, node2, weight=distance)
    return G

# Save the graph as a pickle file
def save_graph(graph, file_name):
    with open(file_name, 'wb') as f:
        pickle.dump(graph, f)

# Load graph from pickle file
def load_graph_pickle(file_name):
    with open(file_name, 'rb') as f:
        return pickle.load(f)

# Find the nearest node based on latitude and longitude
def find_nearest_node(graph, lat, lon):
    nearest_node = None
    min_distance = float('inf')  # Start with a large number
    for node in graph.nodes():
        node_lat = node[0]
        node_lon = node[1]
        distance = haversine(lat, lon, node_lat, node_lon)
        if distance < min_distance:
            min_distance = distance
            nearest_node = node
    return nearest_node

# Calculate the shortest path using Dijkstra's algorithm
def calculate_route(graph, source_node, destination_node):
    try:
        route = nx.shortest_path(graph, source=source_node, target=destination_node, weight='weight')
        return route
    except nx.NetworkXNoPath:
        print("No path found between the source and destination.")
        return None

# Main script
graph = load_graph("data/roads.csv")
save_graph(graph, "data/graph.pkl")

# Example source and destination coordinates
source_lat = 36.2023038
source_lon = 5.408276
destination_lat = 36.2006936
destination_lon = 5.4088903

# Find nearest nodes for source and destination
source_node = find_nearest_node(graph, source_lat, source_lon)
destination_node = find_nearest_node(graph, destination_lat, destination_lon)

# Calculate the route
route = calculate_route(graph, source_node, destination_node)
if route:
    print(f"Calculated route: {route}")
else:
    print("Route could not be calculated.")
