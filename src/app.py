from flask import Flask, render_template, jsonify, request
import csv
import os

# Specify the correct template folder location
app = Flask(__name__, template_folder="../templates", static_folder="../static")

# Route to render the map
@app.route("/")
def home():
    return render_template("index.html")

# Route to serve coordinates from the CSV file
@app.route("/api/coordinates")
def get_coordinates():
    data = []
    with open("data/coordinates.csv", "r") as file:  # Adjust the path to data
        reader = csv.DictReader(file)
        for row in reader:
            data.append({
                "lat": float(row["LATITUDE"]),
                "lon": float(row["LONGITUDE"]),
                "name": row.get("NAME", "Unknown")  # Optional: Handle missing 'NAME' field
            })
    return jsonify(data)


# Route to add a new coordinate
@app.route("/api/add-coordinate", methods=["POST"])
def add_coordinate():
    new_poi = request.json
    if not new_poi or not all(k in new_poi for k in ("lat", "lon", "name")):
        return jsonify({"error": "Invalid data"}), 400

    # Append the new coordinate to the CSV file
    with open("data/coordinates.csv", "a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([new_poi["lat"], new_poi["lon"], new_poi["name"]])

    return jsonify({"message": "Point added successfully!"}), 200



# Route to remove a point by name
@app.route("/api/delete-point", methods=["POST"])
def delete_point():
    point_name = request.json.get("name")
    updated_data = []

    # Read CSV and remove the point
    with open("data/coordinates.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["NAME"] != point_name:
                updated_data.append(row)

    # Write the updated data back to the CSV file
    with open("data/coordinates.csv", "w", newline="") as file:
        fieldnames = ["LATITUDE", "LONGITUDE", "NAME"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_data)

    return jsonify({"message": "Point deleted successfully!"})



if __name__ == "__main__":
    app.run(debug=True)
