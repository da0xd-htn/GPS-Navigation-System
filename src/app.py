from flask import Flask, render_template, jsonify
import csv
import os

# Specify the correct template folder location
app = Flask(__name__, template_folder="../templates")

# Route to render the map
@app.route("/")
def home():
    return render_template("index.html")

# Route to serve coordinates from the CSV file
@app.route("/api/coordinates")
def get_coordinates():
    data = []
    with open("../data/coordinates.csv", "r") as file:  # Adjust the path to data
        reader = csv.DictReader(file)
        for row in reader:
            data.append({"lat": float(row["LATITUDE"]), "lon": float(row["LONGITUDE"])})
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
