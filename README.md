Courier Dash – AI Based Delivery Routing Game
A browser-based puzzle game demonstrating AI-driven delivery route optimization using the A Search Algorithm*.

🚀 Project Overview
Courier Dash simulates the challenges of modern urban logistics. The player (or the AI) must navigate a city grid to deliver packages while avoiding obstacles and blocked roads. The project serves as a visual playground for understanding how heuristic-based pathfinding operates in real-world scenarios like delivery services and autonomous navigation.

🧠 AI Concepts ImplementedA Search Algorithm:* Finds the mathematically shortest path between the courier and the goal.Heuristic Evaluation: Uses the Manhattan Distance formula:$h(n) = |x1 - x2| + |y1 - y2|$Cost Function: Calculates movement priority based on:$f(n) = g(n) + h(n)$

🎮 Features
Grid-Based Movement: Navigate a 2D city map with obstacles.

AI Hint System: Real-time path calculation suggesting the optimal route.

State Management: Tracks parcel collection, step counts, and delivery progress.

Level Progression: Increasingly complex grids and obstacle placements.

Responsive UI: Clean, web-based interface built with modern CSS.

🎮 Features
Grid-Based Movement: Navigate a 2D city map with obstacles.

AI Hint System: Real-time path calculation suggesting the optimal route.

State Management: Tracks parcel collection, step counts, and delivery progress.

Level Progression: Increasingly complex grids and obstacle placements.

Responsive UI: Clean, web-based interface built with modern CSS.

🛠️ Technologies Used
HTML5: Structural layout and grid container.

CSS3: Grid styling, courier/parcel sprites, and level transitions.

JavaScript (ES6): Game logic, state management, and A* algorithm implementation.

📂 File Structure
CourierDash/
│
├── index.html      # UI structure and game dashboard
├── style.css       # Visual design, grid layouts, and animations
└── script.js       # Core logic: A* algorithm, movement, and game state

🕹️ How to Play
Start: The courier (🚴) begins at the central hub.

Deliver: Navigate to all parcel tiles (📦) on the grid.

Avoid: Do not attempt to cross blocked road tiles (🚧).

Finish: Once all parcels are collected, head to the final destination flag.

Hint: Stuck? Click the "AI Hint" button to see the optimal path calculated by the A* algorithm.

Developed by: Aayushi Shreshth

Git ID: @AaS2703
