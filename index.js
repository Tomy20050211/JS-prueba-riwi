//Create routes
const routes = {
    "/": "./app/views/events.html",
    "/events": "./app/views/events.html",
    "/editEvent": "./app/views/editEvent.html",
    "/login": "./app/views/login.html",
    "/register": "./app/views/register.html",
    "/reservateEvent": "./app/views/enrollement.html",
    "/newEvent": "./app/views/newEvent.html",
    "/registerAdmin": "./app/views/registerAdmin.html",
    "/reservations": "./app/views/reservations.html"
}

//Declarate global vars
let currentEventId = null
let currentEventId2 = null
let btnToDelete = null
//Function for generating a random id.
function generateRandomId() {
    return Math.random().toString(16).slice(2, 6);
}

//Function for changing nav and profile.
function toggleNavigation() {
    const profile = document.getElementById("administrator")
    const profile2 = document.getElementById("visitor")
    const role = localStorage.getItem('Auth')
    const addButton = document.getElementById('add-event-btn');
    const addButton2 = document.getElementById('add-admin-btn');


    profile.hidden = role === 'user'
    addButton.hidden = role === 'user'
    addButton2.hidden = role === 'user'

    profile2.hidden = role === 'admin'
}

//Function to autenticate admin
function isAdministrator() {
    let auth = localStorage.getItem("Auth");
    return auth === "admin" || auth === 'user'
}

// Listen globally for clicks on elements with [data-link] attribute
document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute("href"); // Get the route from href
    const url = new URL(href, window.location.origin); // Convert it to full URL
    const route = url.pathname; // Get the pathname (e.g., "/users")

    if (routes[route]) {
        navigate(url); // Navigate to the route if it exists
    } else {
        console.warn("Ruta no válida:", route); // Log invalid route
    }
});

// Navigation function: fetch and render HTML from views based on route
async function navigate(href) {
    const url = new URL(href, window.location.origin);
    const route = url.pathname;

    if (!routes[route]) {
        console.warn("Ruta no encontrada:", route); // If the route doesn't exist
        return;
    }

    // Load the view's HTML
    const html = await fetch(routes[route]).then(res => res.text());
    document.getElementById("content").innerHTML = html;

    // Update browser URL
    history.pushState({}, "", href);

    // Wait a tick to allow DOM to update before continuing
    await new Promise(resolve => setTimeout(resolve, 0));

    // If editing user, download user info using ID from query string
    if (route === "/editEvent") {
        const id = url.searchParams.get("id");
        if (id) downloadInfo(id);
    }

    // If in users view, show users and hide add button if visitor
    if (route === "/events") {
        showEvents();
        toggleNavigation();
    }

    if (route === "/reservations") {
        showReservations();
    }

    // If in login view, setup login and visitor buttons
    if (route === "/login") {
        setupLoginForm();
        register();
    }

    if (route === "/reservateEvent") {
        const id2 = url.searchParams.get("id")
        if (id2) downloadReservation(id2)
    }

    if (route === "/reservateEvent") {
        showReservations()
    }

    if (!isAdministrator() && route !== "/login" && route !== "/register") {
        console.warn("Usuario no autorizado, redirigiendo a login...");
        return navigate("/login");
    }

}

// Enable browser back/forward navigation for SPA
window.addEventListener("popstate", () =>
    navigate(location.pathname)
);

// Setup register login button
function register() {
    const visit = document.getElementById('register-btn')
    visit.addEventListener('click', () => {
        localStorage.setItem("Auth", "user");
        navigate("/register")
    })
}

// Validate input fields (letters, numbers, required)
function validateField(id, { required = false, type = null, label = id } = {}) {
    const input = document.getElementById(id);
    if (!input) {
        console.warn(`El input con ID '${id}' no existe aún.`);
        return { valid: false, error: `Input no encontrado: ${id}` };
    }
    const value = input.value.trim();

    if (required && value === "") {
        return { valid: false, error: `El campo "${label}" es obligatorio.` };
    }
    if (type === "letters" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener letras.` };
    }
    if (type === "numbers" && !/^[0-9]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener números.` };
    }
    return { valid: true };
}

// Function to add new event to JSON server
async function addEvent() {
    const buttonSave = document.getElementById('btn-add-event')
    const nameNewEvent = document.getElementById("event-name").value
    const eventDescription = document.getElementById("event-description").value
    const eventCapacity = document.getElementById("event-capacity").value
    const eventDate = document.getElementById("event-date").value

    buttonSave.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("event-name", { required: true, type: "letters", label: "Event's name" }),
        validateField("event-description", { required: true, label: "Event description" }),
        validateField("event-capacity", { required: true, type: "numbers", label: "Capacity enable" }),
        validateField("event-date", { required: true, type: "date", label: "Event's date" })
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    // Create user object
    const newEvent = {
        "id": generateRandomId(),
        "name": nameNewEvent,
        "description": eventDescription,
        "capacity": eventCapacity,
        "date": eventDate
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('event-response')
            respon.innerHTML = `<p>Event ${data.name} correctly added.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('event-response')
            respon.innerHTML = `<p>Error! Event not added: ${error}</p>`
        })
}

// Fetch and display events list
async function showEvents() {
    let eventsTable = document.getElementById('eventsTable');
    try {
        let html = '';
        const response = await fetch('http://localhost:3000/events');
        const datas = await response.json();

        // If user is a visitor, display with some changes
        if (localStorage.getItem('Auth') == 'user') {
            datas.forEach(data => {
                html += `
                <tr>
                    <td><img src="./app/img/events.jpg" alt="Foto"></td>
                    <td>${data.name}</td>
                    <td>${data.description}</td>
                    <td>${data.capacity}</td>
                    <td>${data.date}</td>
                    <td class="actions">
                        <a id="btn-${data.id}" href="/reservateEvent?id=${data.id}" data-link class='bx bx-message-alt-x' style='color:#810af3'>Enroll event</a>
                    </td>
                </tr>`;
                setTimeout(() => {
                    if (data.capacity == "0") {

                        btnToDelete = document.getElementById(`btn-${data.id}`)
                        btnToDelete.style.display = "none"
                    }
                }, 0)

            });
            eventsTable.innerHTML = html;
        } else if (localStorage.getItem('Auth') == 'admin') {
            datas.forEach(data => {
                html += `
                <tr>
                    <td><img src="./app/img/events.jpg" alt="Foto"></td>
                    <td>${data.name}</td>
                    <td>${data.description}</td>
                    <td>${data.capacity}</td>
                    <td>${data.date}</td>
                    <td class="actions">
                        <i onclick="deleteEvent('${data.id}')" class='bx bx-message-alt-x' style='color:#810af3'></i>
                        <i class='bx bxs-edit-alt' href="/editEvent?id=${data.id}" data-link></i>
                    </td>
                </tr>
            `;
            });
            eventsTable.innerHTML = html;
        }
    } catch (error) {
        console.log(error)
    }
}

// Delete event by ID
async function deleteEvent(id) {

    const confirmDelete = confirm("Are you sure about deleting this event?");
    if (!confirmDelete) return;

    const results = document.getElementById('new-event-results');

    try {
        await fetch(`http://localhost:3000/events/${id}`, { method: 'DELETE' });
        results.innerHTML = `<p>Event correctly delete.</p>`;
        showEvents(); // Refresh user list
    } catch (error) {
        results.innerHTML = `<p>Error! Event not delete: ${error}</p>`;
    }
}

// Load event's info into form to edit
async function downloadInfo(id) {
    currentEventId = id;

    try {
        const res = await fetch(`http://localhost:3000/events/${id}`);
        const data = await res.json();

        // Fill form inputs with user data
        const name = document.getElementById("event-name1");
        const description = document.getElementById("event-description1");
        const capacity = document.getElementById("event-capacity1");
        const date = document.getElementById("event-date1");

        if (name && description && capacity && date) {
            name.value = data.name;
            description.value = data.description;
            capacity.value = data.capacity;
            date.value = data.date;
        } else {
            console.error("Inputs no encontrados");
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}

// Submit edited user data
async function editEvent() {
    const name = document.getElementById("event-name1").value;
    const description = document.getElementById("event-description1").value;
    const capacity = document.getElementById("event-capacity1").value;
    const date = document.getElementById("event-date1").value;

    // Field validations
    const validations = [
        validateField("event-name1", { required: true, type: "letters", label: "Event's name" }),
        validateField("event-description1", { required: true, type: "letters", label: "Event description" }),
        validateField("event-capacity1", { required: true, type: "numbers", label: "Capacity enable" }),
        validateField("event-date1", { required: true, type: "date", label: "Event's date" })
    ];
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const updatedEvent = {
        name,
        description,
        capacity,
        date,
    };

    if (!currentEventId) {
        alert("No se encontró el ID del usuario para actualizar.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/events/${currentEventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEvent)
        });

        const data = await res.json();

        document.getElementById("edit-response").innerHTML =
            `<p>Event ${data.name} edited correctly.</p>`;
    } catch (error) {
        document.getElementById("edit-response").innerHTML =
            `<p>Error! Event not edited: ${error}</p>`;
    }
}

// Logout button to clear session and redirect to login
const buttonCloseSession = document.getElementById("close-session");
buttonCloseSession.addEventListener("click", () => {
    localStorage.removeItem("Auth");
    navigate("/login");
});

// Setup login form and handle login logic
function setupLoginForm() {
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        const userInput = document.getElementById('userLogin');
        const passInput = document.getElementById('passwordLogin');
        const errorDiv = document.getElementById('error');

        if (!loginForm || !userInput || !passInput) {
            console.warn("No se encontró el formulario de login o sus campos.");
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let authorized = false;
            errorDiv.textContent = "";

            try {
                const res = await fetch(`http://localhost:3000/users`);
                const users = await res.json();
                const user = userInput.value.trim();
                const pass = passInput.value.trim();

                for (const admin of users) {
                    if (admin.user === user && admin.password === pass) {
                        if (admin.isAdmin === true) {
                            localStorage.setItem("Auth", "admin");
                            navigate("/events");
                            authorized = true;
                            break;
                        } else if (admin.isAdmin === false) {
                            localStorage.setItem("Auth", "user");
                            navigate("/events");
                            authorized = true;
                            break;
                        } else {
                            navigate("/login");
                        }
                    }
                }
                if (!authorized) {
                    errorDiv.textContent = "User or password are not correct.";
                }
            } catch (err) {
                errorDiv.textContent = "Eror! Please check your information.";
                console.error(err);
            }
        });
    }, 0);
}

//Function to register a new user
async function registerUser() {
    const nameNewUser = document.getElementById('nameNewUser').value
    const emailNewUser = document.getElementById('emailNewUser').value
    const passwordNewUser = document.getElementById('passwordNewUser').value
    const buttonRegister = document.getElementById('btn-register')

    buttonRegister.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("nameNewUser", { required: true, type: "letters", label: "Nombre de usuario" }),
        validateField("emailNewUser", { required: true, type: "email", label: "Email" }),
        validateField("passwordNewUser", { required: true, label: "Contraseña" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const newUser = {
        "id": generateRandomId(),
        "isAdmin": false,
        "user": nameNewUser,
        "password": passwordNewUser,
        "email": emailNewUser
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML += `<p>User ${data.name} created successfuly.</p>`
            showEvents()
        })
        .catch(error => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML = `<p>Error al crear el usuario: ${error}</p>`
        })
}

//Function to register a new admin
async function registerAdmin() {
    const nameNewUser = document.getElementById('nameNewAdmin').value
    const emailNewUser = document.getElementById('emailNewAdmin').value
    const passwordNewUser = document.getElementById('passwordNewAdmin').value
    const buttonRegister = document.getElementById('btn-registerAdmin')

    buttonRegister.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("nameNewAdmin", { required: true, type: "letters", label: "Nombre de usuario" }),
        validateField("emailNewAdmin", { required: true, type: "email", label: "Email" }),
        validateField("passwordNewAdmin", { required: true, label: "Contraseña" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const newUser = {
        "id": generateRandomId(),
        "isAdmin": true,
        "user": nameNewUser,
        "password": passwordNewUser,
        "email": emailNewUser
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML += `<p>Usuario ${data.name} creado con éxito.</p>`
            showEvents()
        })
        .catch(error => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML = `<p>Error al crear el usuario: ${error}</p>`
        })
}

async function reserve() {
    const buttonSave = document.getElementById('btn-reserve-event')
    const nameEvent = document.getElementById("event-name2").value
    const quantityPeople = document.getElementById("cuantity-enroll").value
    const nameReservation = document.getElementById("nameReservation").value
    const numberReservation = document.getElementById("numberReservation").value


    buttonSave.onclick = (e) => {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("event-name2", { required: true, type: "letters", label: "Event's name" }),
        validateField("nameReservation", { required: true, type: "letters", label: "Who is enrolling?" }),
        validateField("cuantity-enroll", { required: true, type: "numbers", label: "Cuantity of people to enroll" }),
        validateField("numberReservation", { required: true, type: "numbers", label: "Phone number" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const res = await fetch(`http://localhost:3000/events/${currentEventId2}`);
    const data = await res.json();


    // Create user object
    const newReservation = {
        "id": generateRandomId(),
        "name": nameEvent,
        "nameReservation": nameReservation,
        "numberReservation": numberReservation,
        "quantity": quantityPeople
    }

    const quantity = {
        "id": currentEventId2,
        "name": data.name,
        "description": data.description,
        "capacity": data.capacity - quantityPeople,
        "date": data.date
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReservation)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Event ${data.name} enroll correctly.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Error! Was not possible to reserve: ${error}</p>`
        })


    // PUT request to JSON server
    await fetch(`http://localhost:3000/events/${currentEventId2}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quantity)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Event ${data.name} update correctly</p>`
        })
        .catch(error => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Error! Wasn't possible to update event: ${error}</p>`
        })




}

// Load book's info into form to edit
async function downloadReservation(id) {
    currentEventId2 = id;

    try {
        const res = await fetch(`http://localhost:3000/events/${currentEventId2}`);
        const data = await res.json();

        // Fill form inputs with user data
        const name = document.getElementById("event-name2");

        if (name) {
            name.value = data.name;
        } else {
            console.error("Inputs no encontrados");
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}

//Function to show reservations
async function showReservations() {
    let reservationTable = document.getElementById('reservationsTable');



    try {
        let html = '';
        const response = await fetch('http://localhost:3000/reservations');
        const data = await response.json();

        // If user is a visitor
        if (localStorage.getItem('Auth') == 'user') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./app/img/events.jpg" alt="Foto"></td>
                    <td>${data.name}</td>
                    <td>${data.name}</td>
                    <td>${data.nameReservation}</td>
                    <td>${data.quantity}</td>
                </tr>
            `;
            }
            );
            reservationTable.innerHTML = html;
        } else if (localStorage.getItem('Auth') == 'admin') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./app/img/events.jpg" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.nameReservation}</td>
                    <td>${data.numberReservation}</td>
                    <td>${data.quantity}</td>
                </tr>
            `;
            });
            reservationTable.innerHTML = html;
        }
    } catch (error) {
        const results = document.getElementById('new-book-results');
        console.log(error)
    }
}

