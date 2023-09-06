let bearerToken = null;
const maxLoginRetries = 3;
let loginRetryCount = 0;

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function login() {
    const loginForm = document.getElementById("loginForm");
    const login_id = loginForm.querySelector("#login_id").value;
    const password = loginForm.querySelector("#password").value;

    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp';

    try {
        const response = await fetch(proxyUrl + apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login_id: login_id,
                password: password,
            }),
        });

        const data = await handleResponse(response);
        bearerToken = data.access_token;
        alert("Login successful! Bearer token: " + bearerToken);
        window.location.href = "home.html";

        await getCustomerList();

    } catch (error) {
        if (loginRetryCount < maxLoginRetries) {
            loginRetryCount++;
            console.log(`Login retry ${loginRetryCount} after error: ${error.message}`);
            setTimeout(login, 3000);
        } else {
            alert("Maximum login retries exceeded. Login failed.");
        }
    }
}

async function getCustomerList() {

    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';
    bearerToken = 'dGVzdEBzdW5iYXNlZGF0YS5jb206VGVzdEAxMjM='; //(for testing purpose)

    console.log("Bearer Token:", JSON.stringify(bearerToken));
    

    const params = new URLSearchParams({ cmd: 'get_customer_list' });
    try {
        const response = await fetch(proxyUrl + apiUrl + '?' + params.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                "x-requested-with": "XMLHttpRequest",
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const customerListTable = document.getElementById("customerList");
            customerListTable.innerHTML = "";
            const headerRow = customerListTable.insertRow();
            const headers = ["First Name", "Last Name", "Street", "Address", "City", "State", "Email", "Phone", "Actions"];
            headers.forEach((headerText) => {
                const headerCell = document.createElement("th");
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });
            data.forEach((customer) => {
                const row = customerListTable.insertRow();
                const columns = ["first_name", "last_name", "street", "address", "city", "state", "email", "phone"];
                columns.forEach((column) => {
                    const cell = row.insertCell();
                    cell.textContent = customer[column] || "";
                });

                const actionsCell = row.insertCell();

                const updateIcon = document.createElement("i");
                updateIcon.className = "fas fa-edit";
                updateIcon.style.marginRight = "16px"
                updateIcon.addEventListener("click", () => {
                    alert(`Update action for ${customer["first_name"]} ${customer["last_name"]}`);
                    const updateUrl = `update_field.html?uuid=${customer["uuid"]}`;
                    window.location.href = updateUrl;

                });

                const deleteIcon = document.createElement("i");
                deleteIcon.className = "fas fa-trash";
                deleteIcon.style.marginRight = "5px"
                deleteIcon.style.color = "red"
                deleteIcon.addEventListener("click", () => {
                    const confirmation = window.confirm(`Are you sure you want to delete ${customer["first_name"]} ${customer["last_name"]}?`);
                    if (confirmation) {
                        deleteCustomer(customer.uuid);
                    } else {
                        
                    }
                    
                });
                actionsCell.appendChild(updateIcon);
                actionsCell.appendChild(deleteIcon);
            });
        } else {
            throw new Error(`Failed to get customer list. Status: ${response.status}`);
        }
    } catch (error) {
        alert("Failed to get customer list: " + error.message);
    }
}

async function deleteCustomer(customerUUID) {
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';
    bearerToken = 'dGVzdEBzdW5iYXNlZGF0YS5jb206VGVzdEAxMjM=';
    const params = new URLSearchParams({ cmd: 'delete', uuid: customerUUID});
    try {
        const response = await fetch(proxyUrl + apiUrl + '?' + params.toString(), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
        });

        if (response.status === 200) {
            alert("Customer record Deleted successfully!");
            window.location.href = "home.html";
        } else if (response.status === 500) {
            alert(' Error Not deleted.');
        } else if (response.status === 400) {
            alert(' UUID not found');
        } else {
            alert('Failed to delete customer data. Status: ' + response.status);
        }
    } catch (error) {
        alert("Failed to delete customer: " + error.message);
    }
}


async function createCustomer() {
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';
    bearerToken = 'dGVzdEBzdW5iYXNlZGF0YS5jb206VGVzdEAxMjM='; //(for testing purpose)

    const params = new URLSearchParams({ cmd: 'create' });
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const street = document.getElementById("street").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    if (!first_name.trim() || !last_name.trim()) {
        alert("First Name and Last Name are mandatory.");
        return;
    }

    try {
        const response = await fetch(proxyUrl + apiUrl + '?' + params.toString(), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name,
                street: street,
                address: address,
                city: city,
                state: state,
                email: email,
                phone: phone,
            }),
        });

        if (response.status === 201) {
            alert("Customer created successfully!");
            window.location.href = "home.html";
        }
        else {
            throw new Error(`Failed to create customer. Status: ${response.status}`);
        }
    } catch (error) {
        alert("Failed to create customer: " + error.message);
    }
}
