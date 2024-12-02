# GPS-Navigation-System
This Python project involves developing a GPS navigation application that allows users to plan routes between various points of interest such as restaurants, museums, and more within a city.  


# Project Structure:
```bash
GPS-System/

├── data/
│   └── coordinates.csv # File for storing predefined points of interest
├── src/
│   ├── app.py                 # Main flask app
│   ├── algorithms.py          # Contains Dijkstra and Bellman-Ford algorithms
│   ├── gui.py                 # Main GUI application logic
│   ├── utils.py               # Helper functions (coordinate conversions, etc.)
│   ├── search.py              # Search and filter functionality
│   └── __init__.py            # Marks the folder as a Python module
├── templates/
│   ├── index.html             # Main web page
├── static/
│   ├── css    
│   │   └── style.css     
│   ├── js    
│   │   └── script.css   
├── venv/                      # Virtual environment
├── requirements.txt           # Project dependencies
└── README.md                  # Project documentation
└── .gitignore                 # .gitignore file
```