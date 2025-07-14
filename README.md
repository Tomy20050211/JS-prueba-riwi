# Event Management SPA
- Tomas salazar Ruiz
- Gosling
- 1036449536
- tomasruiz1104@gmail.com
This is a simple JavaScript-based Single Page Application (SPA) for managing events. It includes route handling, global variable declarations, and utility functions for navigation and ID generation.

## 📁 File Structure
The application uses the following HTML views:

- `/` → `events.html`
- `/events` → `events.html`
- `/editEvent` → `editEvent.html`
- `/login` → `login.html`
- `/register` → `register.html`
- `/reservateEvent` → `enrollement.html`
- `/newEvent` → `newEvent.html`
- `/registerAdmin` → `registerAdmin.html`
- `/reservations` → `reservations.html`

All views are located inside the `/app/views/` folder.

## 🧠 Global Variables

```js
let currentEventId = null;
let currentEventId2 = null;
let btnToDelete = null;
```

These variables are used to track the currently selected event and the delete button reference.

## 🔐 Route Configuration

The `routes` object maps URL paths to specific view files. This setup is essential for SPA routing, allowing the app to load different content dynamically without a full page reload.

## 🔀 Utility Functions

### `generateRandomId()`
Generates a random 4-character hexadecimal ID:
```js
function generateRandomId() {
    return Math.random().toString(16).slice(2, 6);
}
```

This can be used to assign unique identifiers to events or other entities.

### `toggleNavigation()`
This function toggles the visibility or state of user profile sections based on their role (`administrator` or `visitor`):
```js
function toggleNavigation() {
    const profile = document.getElementById("administrator")
    const profile2 = document.getElementById("visitor")
}
```
```
---
## 💠 Technologies Used

- **HTML5** / **CSS3** / **JavaScript**
- **JSON Server** for mock REST API
- **Boxicons** for UI icons

## ▶️ Getting Started

1. **Install JSON Server globally (if not already):**

```bash
npm install -g json-server
```

2. **Run JSON Server with your database:**

```bash
json-server --watch db.json
```

3. **Open ****\`\`**** in your browser** (use Live Server for best experience).




