import networkx as nx
import csv
import pickle

# Function to load the graph from the CSV
def load_graph(csv_file):
    G = nx.Graph()  # We use an undirected graph
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header

        # Iterate over each row in the CSV
        for row in reader:
            lat1, lon1, lat2, lon2, distance = map(float, row)  # Convert to floats
            node1 = (lat1, lon1)  # Starting node
            node2 = (lat2, lon2)  # Ending node

            # Add nodes to the graph (optional: the nodes will be created automatically when adding edges)
            G.add_node(node1, y=lat1, x=lon1)
            G.add_node(node2, y=lat2, x=lon2)

            # Add an edge between the nodes with weight (distance)
            G.add_edge(node1, node2, weight=distance)

    return G

# Save the graph to a pickle file
def save_graph(graph, file_name):
    with open(file_name, 'wb') as f:
        pickle.dump(graph, f)

# Load the graph from pickle file
def load_graph_pickle(file_name):
    with open(file_name, 'rb') as f:
        return pickle.load(f)

# Example usage
graph = load_graph("data/roads.csv")  # Load the graph from the CSV
save_graph(graph, "data/graph.pkl")  # Save the graph as a pickle file
print("Graph loaded and saved successfully!")
