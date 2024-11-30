import tkinter as tk
from PIL import Image, ImageTk

def display_map():
    # Create the main Tkinter window
    root = tk.Tk()
    root.title("GPS Navigation System - Setif Map")
    root.geometry("800x600")  # Adjust the window size as needed

    # Load the map image
    map_image = Image.open("maps/mapSetif.png")  # Path to your map image
    map_image = map_image.resize((800, 600))  # Resize the image to fit the window
    map_photo = ImageTk.PhotoImage(map_image)

    # Add the map image to a label widget
    map_label = tk.Label(root, image=map_photo)
    map_label.pack()

    # Run the Tkinter event loop
    root.mainloop()

# Call the function to display the map
display_map()
