import osmnx as ox
import networkx as nx
import csv

def extract_road_data(osm_file, output_csv):
    # Load the graph from the OSM file
    G = ox.graph_from_xml(osm_file, simplify=True)

    # Prepare the CSV
    with open(output_csv, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['lat1', 'lon1', 'lat2', 'lon2', 'distance'])  # CSV header

        # Iterate over edges in the graph
        for u, v, data in G.edges(data=True):
            # Get coordinates of nodes
            u_coords = G.nodes[u]['y'], G.nodes[u]['x']
            v_coords = G.nodes[v]['y'], G.nodes[v]['x']

            # Get the edge distance (in meters, convert to km)
            distance = data.get('length', 0) / 1000.0

            # Write to CSV
            writer.writerow([u_coords[0], u_coords[1], v_coords[0], v_coords[1], distance])

    print(f"Road data has been saved to {output_csv}")

if __name__ == "__main__":
    # Specify the input OSM file and output CSV
    osm_file = "data/Setifmap.osm"  # Adjust this path to your downloaded .osm file
    output_csv = "data/roads.csv"  # Output file
    extract_road_data(osm_file, output_csv)
