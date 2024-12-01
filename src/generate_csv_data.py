import xml.etree.ElementTree as ET
import csv

osm_file = "maps/mapSetif.osm"  # Replace with your .osm file
tree = ET.parse(osm_file)
root = tree.getroot()

with open("coordinates.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["LATITUDE", "LONGITUDE"])

    for node in root.findall("node"):
        lat = node.attrib["lat"]
        lon = node.attrib["lon"]
        writer.writerow([lat, lon])

print("Coordinates saved to coordinates.csv")
