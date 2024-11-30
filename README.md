# GPS-Navigation-System
This Python project involves developing a GPS navigation application that allows users to plan routes between various points of interest such as restaurants, museums, and more within a city.  


# Project Structure:

GPS-System/
├── maps/
│   └── map.png                # The map of Setif
├── data/
│   └── points_of_interest.csv # File for storing predefined points of interest
├── src/
│   ├── display_map.py         # Handles the map display GUI
│   ├── algorithms.py          # Contains Dijkstra and Bellman-Ford algorithms
│   ├── gui.py                 # Main GUI application logic
│   ├── utils.py               # Helper functions (coordinate conversions, etc.)
│   ├── search.py              # Search and filter functionality
│   └── __init__.py            # Marks the folder as a Python module
├── tests/
│   └── test_algorithms.py     # Test cases for your algorithms
├── venv/                      # Virtual environment
├── requirements.txt           # Project dependencies
└── README.md                  # Project documentation
