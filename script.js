// Global variables
let clickedProduct;
let lastUpdateData = null;
let assistantContainer;
let assistantLogo;
let userInput;
let sendMessageBtn;

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    assistantContainer = document.getElementById("assistantContainer");
    assistantLogo = document.getElementById("assistantLogo");
    userInput = document.getElementById("userInput");
    sendMessageBtn = document.getElementById("sendMessage");

    // Set up event listeners
    assistantLogo.addEventListener("click", toggleAssistant);
    sendMessageBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Set up interval functions
    setInterval(updateUserInfo, 1000);
    setInterval(updateOrderInfo, 1000);
    setInterval(updateLeaderboardInfo, 60000);

    // Initialize color picker
    initColorPicker();

    // Check for terms acceptance
    checkTermsAcceptance();
});

// Terms Modal Functions
function checkTermsAcceptance() {
    const termsAccepted = document.querySelector('.idtermsAccepted').textContent;

    if (termsAccepted === 'False') {
        $('#termsModal').modal('show');
    
        let countdownValue = 3;
        const countdownElement = document.getElementById('countdownValue');
        const agreeButton = document.querySelector('.btn-primary');
    
        agreeButton.disabled = true;
    
        const countdownInterval = setInterval(function() {
            countdownElement.textContent = countdownValue;
            countdownValue--;
    
            if (countdownValue < 0) {
                clearInterval(countdownInterval);
                agreeButton.disabled = false;
                countdownElement.textContent = '';
            }
        }, 1000);
    }
}

// User Info Functions
function updateUserInfo() {
    fetch("/api/get_UserInfo")
        .then(response => response.json())
        .then(data => {
            document.getElementById("role").innerText = data.role;
            document.getElementById("balance").innerText = data.balance;
            document.getElementById("expire_at").innerText = data.expire_at;
        })
        .catch(error => console.error("Error updating user info:", error));
}

// Order and Leaderboard Functions
function updateOrderInfo() {
    fetch("/api/get_orderan")
        .then(response => response.json())
        .then(data => updateOrderTable(data))
        .catch(error => console.error("Error updating orders:", error));
}

function updateLeaderboardInfo() {
    fetch("/api/get_leaderboard")
        .then(response => response.json())
        .then(data => updateLeaderTable(data))
        .catch(error => console.error("Error updating leaderboard:", error));
}

function updateOrderTable(orderData) {
    const orderTableBody = document.querySelector("#orderTable tbody");
    orderTableBody.innerHTML = "";

    orderData.forEach(function (order) {
        const row = orderTableBody.insertRow();
        const cellOrderLevel = row.insertCell(0);
        const cellOrderId = row.insertCell(1);
        const cellProduct = row.insertCell(2);
        const cellStatus = row.insertCell(3);

        cellOrderId.innerHTML = order.username;
        cellProduct.innerHTML = order.item;
        cellStatus.innerHTML = order.status;

        if (order.level.includes("Store")) {
            const storeIcon = document.createElement("i");
            storeIcon.className = "bi bi-shop text-primary me-2";
            storeIcon.setAttribute("title", "Store");
            cellOrderLevel.appendChild(storeIcon);
        }

        if (order.level.includes("VIP1")) {
            const vipImage = document.createElement("img");
            vipImage.src = "/static/img/vip1.svg";
            vipImage.width = 30;
            vipImage.height = 30;
            vipImage.alt = "VIP1";
            cellOrderLevel.appendChild(vipImage);
        } else if (order.level.includes("VIP2")) {
            const vipImage = document.createElement("img");
            vipImage.src = "/static/img/vip2.svg";
            vipImage.width = 30;
            vipImage.height = 30;
            vipImage.alt = "VIP2";
            cellOrderLevel.appendChild(vipImage);
        } else if (order.level.includes("VIP3")) {
            const vipImage = document.createElement("img");
            vipImage.src = "/static/img/vip3.svg";
            vipImage.width = 30;
            vipImage.height = 30;
            vipImage.alt = "VIP3";
            cellOrderLevel.appendChild(vipImage);
        } else if (!order.level.includes("Store")) {
            cellOrderLevel.textContent = order.level;
        }

        if (order.status === "Success") {
            row.classList.add("table-success");
        } else if (order.status === "Login Failed") {
            row.classList.add("table-warning");
        } else if (order.status === "Email New Account Has been Used") {
            row.classList.add("table-warning");
        } else if (order.status === "Cheat Failed") {
            row.classList.add("table-danger");
        } else {
            row.classList.add("table-info");
        }

        if (order.status.includes("%")) {
            const progressBar = document.createElement("div");
            progressBar.className = "progress";
            progressBar.innerHTML = `
                <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${order.status}" aria-valuenow="${parseInt(order.status)}" aria-valuemin="0" aria-valuemax="101">${order.status}</div>
            `;
            cellStatus.innerHTML = "";
            cellStatus.appendChild(progressBar);
        }
    });
}

function updateLeaderTable(leaderData) {
    const LeaderTableBody = document.querySelector("#LeaderTable tbody");
    LeaderTableBody.innerHTML = "";

    leaderData.forEach(function (leaderx, index) {
        const row = LeaderTableBody.insertRow();
        const cellRank = row.insertCell(0);
        const cellUsername = row.insertCell(1);
        const cellValue = row.insertCell(2);

        cellRank.innerHTML = index + 1;
        cellUsername.innerHTML = leaderx.username;
        cellValue.innerHTML = leaderx.total_orderan;

        const spacer = document.createElement("span");
        spacer.innerHTML = "&nbsp;&nbsp;&nbsp;";

        if (leaderx.role === "Store") {
            const storeIcon = document.createElement("i");
            storeIcon.className = "bi bi-shop text-warning";
            storeIcon.setAttribute("title", "Store");
            cellUsername.appendChild(spacer);
            cellUsername.appendChild(storeIcon);
        }
    });
}

// Updates Functions
function fetchLatestUpdates() {
    fetch('/api/latest-updates')
        .then(response => response.json())
        .then(data => {
            if (lastUpdateData && JSON.stringify(lastUpdateData) !== JSON.stringify(data.updates)) {
                document.getElementById('newBadge').style.display = 'inline';
            }

            lastUpdateData = data.updates;
            const userRole = '';

            document.getElementById('latestUpdates').innerHTML = data.success ? 
            data.updates.map(update => `
                <div class="card mb-2" style="background-color: ${update.proses === 0 ? '#f8d7da' : '#d4edda'};">
                    <div class="card-body">
                        ${userRole === 'Admin' ? `
                            <div class="d-flex justify-content-between mb-2">
                                <button class="btn btn-warning btn-sm" onclick="editUpdate(${update.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteUpdate(${update.id})">Delete</button>
                            </div>
                        ` : ''}
                        ${update.status === "Selesai" ? 
                            '<p class="text-success fw-bold" style="font-size: 1.2em;">Selesai</p>' : 
                            `<p class="text-warning fw-bold" style="font-size: 1.2em;">Sedang dalam proses</p>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" style="width: ${update.status}%; background-color: #ffc107;" aria-valuenow="${update.status}" aria-valuemin="0" aria-valuemin="0" aria-valuemax="100">${update.status}%</div>
                            </div>`
                        }
                        <p class="card-title" hidden>${update.id}</p>
                        <h5 class="card-title">${update.date}</h5>
                        <p class="card-text">${update.update}</p>
                        <p class="card-text"><strong>Effect:</strong></p>
                        <ul>
                            ${update.effect.map(effect => `<li>${effect}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('') : '<p>Tidak ada update terbaru.</p>';
        })
        .catch(error => {
            console.error('Error fetching latest updates:', error);
            document.getElementById('latestUpdates').innerHTML = '<p>Error fetching updates.</p>';
        });
}

function markUpdatesAsRead() {
    document.getElementById('newBadge').style.display = 'none';
}

function editUpdate(id) {
    fetch(`/edit_update/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('updateStatus').value = data.status;
            document.getElementById('updateText').value = data.update;
            document.getElementById('updateEffect').value = data.effect.join(', ');
            document.getElementById('editUpdateForm').dataset.updateId = id;
            $('#editUpdateModal').modal('show');
        })
        .catch(error => console.error('Error fetching update data:', error));
}

function deleteUpdate(id) {
    fetch(`/delete_update/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log(`Update dengan ID: ${id} telah dihapus.`);
            fetchLatestUpdates();
        } else {
            console.error('Gagal menghapus update:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

function submitUpdateFormz() {
    const date = document.getElementById('updateDatez').value;
    const update = document.getElementById('updateTextz').value;
    const effect = document.getElementById('updateEffectz').value.split(',').map(e => e.trim());
    
    if (!date || !update || effect.length === 0 || effect[0] === "") {
        alert('Semua field harus diisi dengan benar!');
        return;
    }
    
    fetch('/process_update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, update, effect })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Update added successfully!');
            $('#addUpdateModal').modal('hide');
        } else {
            alert('Failed to add update: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Redeem Code Functions
function redeemCode() {
    const code = document.getElementById('redeemCode').value;
    const resultDiv = document.getElementById('redeemResult');

    if (!code) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Code cannot be empty</div>`;
        return;
    }

    fetch('/redeem-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            resultDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            updateUserInfo();
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.innerHTML = `<div class="alert alert-danger">Failed to redeem code</div>`;
    });
}

function generateRedeemCodes() {
    const amount = document.getElementById('redeemAmount').value;
    const count = document.getElementById('redeemCount').value;
    const isOneTime = document.getElementById('isOneTime').checked;
    
    fetch('/admin/generate-redeem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            count: count,
            is_one_time: isOneTime
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const codesList = document.getElementById('codesList');
            codesList.innerHTML = data.codes.map(code => `<li>${code}</li>`).join('');
            document.getElementById('generatedCodes').style.display = 'block';
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to generate codes');
    });
}

function copyGeneratedCodes() {
    const codes = Array.from(document.getElementById('codesList').getElementsByTagName('li'))
        .map(li => li.textContent)
        .join('\n');
    
    navigator.clipboard.writeText(codes).then(() => {
        alert('Codes copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy codes:', err);
        alert('Failed to copy codes');
    });
}

// Event Functions
function checkActiveEvents() {
    fetch('/api/active-events')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.events.length > 0) {
                const container = document.getElementById('eventNotifications');
                container.innerHTML = '';
                
                data.events.forEach(event => {
                    if (!event.is_claimed) {
                        const toast = document.createElement('div');
                        toast.className = 'toast show';
                        toast.setAttribute('role', 'alert');
                        toast.setAttribute('aria-live', 'assertive');
                        toast.setAttribute('aria-atomic', 'true');

                        toast.innerHTML = `
                            <div class="toast-header">
                                <strong class="me-auto">${event.event_name}</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">
                                Reward: ${event.amount} TopixSB Cash
                                ${
                                    event.deepLinkUrl
                                        ? `<a href="${event.deepLinkUrl}" class="btn btn-primary btn-sm mt-2">Claim</a>`
                                        : `<button class="btn btn-primary btn-sm mt-2" onclick="claimEvent(${event.id})">Claim</button>`
                                }
                            </div>
                        `;

                        container.appendChild(toast);
                    }
                });
            }
        })
        .catch(error => console.error('Error checking events:', error));
}

function claimEvent(eventId) {
    fetch(`/claim-event/${eventId}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            updateUserInfo();
            checkActiveEvents();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to claim event');
    });
}

// Color Picker Functions
function initColorPicker() {
    const hueRange = document.getElementById('hueRange');
    const hueValue = document.getElementById('hueValue');
    const colorDisplay = document.getElementById('colorDisplay');
    const rgbValue = document.getElementById('rgbValue');
    const textInput = document.getElementById('textInput');
    const outputText = document.getElementById('outputText');
    const copyButton = document.getElementById('copyButton');

    if (!hueRange) return;

    copyButton.addEventListener('click', () => {
        const text = `<color= #${rgbValue.textContent}>${textInput.value}</color>`;
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Code copied to clipboard!');
            })
            .catch((error) => {
                console.error('Error copying code to clipboard: ', error);
            });
    });

    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function updateColor() {
        const hue = hueRange.value;
        hueValue.textContent = hue;

        const [r, g, b] = hslToRgb(hue / 360, 1, 0.5);
        const colorHex = rgbToHex(r, g, b);
        rgbValue.textContent = colorHex;
        colorDisplay.style.backgroundColor = `#${colorHex}`;

        updateOutputText();
    }

    function updateOutputText() {
        const text = textInput.value.trim();
        const [r, g, b] = hslToRgb(hueRange.value / 360, 1, 0.5);
        const colorHex = rgbToHex(r, g, b);

        if (text) {
            outputText.innerHTML = `<span style="color: #${colorHex};">${text}</span>`;
        } else {
            outputText.textContent = '';
        }
    }

    hueRange.addEventListener('input', updateColor);
    textInput.addEventListener('input', updateOutputText);

    // Set initial color
    updateColor();
}

// Modal Functions
function openModal(product) {
    clickedProduct = product;
    showFlashMessage(product, "Please Wait", "success");
    customizeForm(product.querySelector(".item-name").value);
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

function showFlashMessage(clickedProduct, message, type) {
    var flashContainer = clickedProduct.querySelector(".flash-container");
    var flashDiv = document.createElement("div");
    flashDiv.className = "flash-message " + type;
    flashDiv.innerHTML = "<p>" + message + "</p>";

    flashContainer.appendChild(flashDiv);

    setTimeout(function () {
        flashDiv.style.opacity = "0";
        setTimeout(function () {
            flashDiv.remove();
        }, 1000);
    }, 5000);
}

async function customizeForm(itemName) {
    var purchaseForm = document.getElementById("purchaseForm");

    // Clear existing form elements
    while (purchaseForm.firstChild) {
        purchaseForm.removeChild(purchaseForm.firstChild);
    }

    // Add appropriate form elements based on item
    if (itemName === "Change Name") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="customName">New Name:</label>
                <input type="text" id="customName" name="customName" required>
            </div>
        `;
    } else if (itemName === "Change ID") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="customID">New ID:</label>
                <input type="text" id="customID" name="customID" pattern="^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{8}$" title="Please enter a mix of letters and numbers, exactly 8 characters." maxlength="8" required>
            </div>
        `;
    } else if (itemName === "Change ID ++") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="customID++">New ID:</label>
                <input type="text" id="customID++" name="customID++" title="Please enter your ID" required>
            </div>
        `;
    } else if (itemName === "Tune-UP") {
        try {
            // Fetch tuneup data
            var response = await fetch("/api/tuneup");
            var data = await response.json();

            purchaseForm.innerHTML = `
                <div class="form-group">
                    <label for="tuneupDropdown">Choose Tune-UP:</label>
                    <select id="tuneupDropdown" onchange="updateTuneupFields()">
                        <option value="">Select Tune-UP</option>
                        ${generateDropdownOptions(data)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="hp">HP:</label>
                    <input type="text" id="hp" name="hp" required>
                </div>
                <div class="form-group">
                    <label for="innerHp">Inner HP:</label>
                    <input type="text" id="innerHp" name="innerHp" required>
                </div>
                <div class="form-group">
                    <label for="nm">NM:</label>
                    <input type="text" id="nm" name="nm" required>
                </div>
                <div class="form-group">
                    <label for="innerNm">Inner NM:</label>
                    <input type="text" id="innerNm" name="innerNm" required>
                </div>
            `;
        } catch (error) {
            console.error("Error fetching tuneup data:", error);
        }
    } else if (itemName === "Cloning Account") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="new_email">New Email:</label>
                <input type="text" id="new_email" name="new_email" required>
            </div>
            <div class="form-group">
                <label for="new_password">New Password:</label>
                <input type="text" id="new_password" name="new_password" required>
            </div>
            <hr/>
        `;
    } else if (itemName === "Inject All (With Varian Type)") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="varian">Varian:</label>
                <input type="range" class="form-control-range" id="varian" name="varian" min="0" max="200" step="1" value="0" oninput="updateVarianValue()">
                <small>Value: <span id="varianValue">0</span></small>
            </div>
            <hr/>
        `;
    } else if (itemName === "Race Win Boost") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="raceWinBoost">Race Win Boost:</label>
                <input type="range" id="raceWinBoost" name="raceWinBoost" min="1" max="10000" step="1" value="9000" oninput="updateRaceWinBoostValue()">
                <small>Boost Win: <span id="raceWinBoostValue">9000</span></small>
                <small>Cost: <span id="raceWinBoostValueCost">9000</span></small>
            </div>
        `;
    } else if (itemName === "Inject Coin") {
        purchaseForm.innerHTML = `
            <div class="form-group">
                <label for="InjectCoin">Inject Coin:</label>
                <input type="range" id="InjectCoin" name="InjectCoin" min="1" max="50000" step="1" value="48000" oninput="updateInjectCoinValue()">
                <small>Coin: <span id="InjectCoinValue">48000</span></small>
                <small>Cost: <span id="InjectCoinValueCost">24000</span></small>
            </div>
        `;
    }
    
    // Add common form elements
    purchaseForm.innerHTML += `
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="username" required>
        </div>
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" autocomplete="current-password" required>
        </div>
        <div class="button-group">
            <button type="submit">Submit</button>
        </div>
    `;
}

function generateDropdownOptions(data) {
    return data.map(entry => `<option value="${entry.id}">${entry.desc}</option>`).join("");
}

async function updateTuneupFields() {
    var tuneupDropdown = document.getElementById("tuneupDropdown");
    var hpInput = document.getElementById("hp");
    var innerHpInput = document.getElementById("innerHp");
    var nmInput = document.getElementById("nm");
    var innerNmInput = document.getElementById("innerNm");

    var selectedTuneupId = tuneupDropdown.value;

    if (selectedTuneupId) {
        try {
            var response = await fetch(`/api/tuneup/${selectedTuneupId}`);
            var data = await response.json();

            hpInput.value = data.hp;
            innerHpInput.value = data.inner_hp;
            nmInput.value = data.nm;
            innerNmInput.value = data.inner_nm;
        } catch (error) {
            console.error("Error fetching tuneup data:", error);
        }
    } else {
        hpInput.value = "";
        innerHpInput.value = "";
        nmInput.value = "";
        innerNmInput.value = "";
    }
}

function updateRaceWinBoostValue() {
    var raceWinBoostSlider = document.getElementById("raceWinBoost");
    var raceWinBoostValue = document.getElementById("raceWinBoostValue");
    var raceWinBoostValueCost = document.getElementById("raceWinBoostValueCost");
    raceWinBoostValue.textContent = raceWinBoostSlider.value;
    raceWinBoostValueCost.textContent = raceWinBoostSlider.value;
}

function updateInjectCoinValue() {
    var InjectCoinSlider = document.getElementById("InjectCoin");
    var InjectCoinValue = document.getElementById("InjectCoinValue");
    var InjectCoinValueCost = document.getElementById("InjectCoinValueCost");

    InjectCoinValue.textContent = InjectCoinSlider.value;
    InjectCoinValueCost.textContent = Math.floor(InjectCoinSlider.value * 0.5);
}

function updateVarianValue() {
    var varianInput = document.getElementById("varian");
    var varianValueSpan = document.getElementById("varianValue");
    varianValueSpan.innerHTML = varianInput.value;
}

function getFormValues() {
    return {
        email: document.getElementById("email").value,
        new_email: document.getElementById("new_email")?.value || '',
        password: document.getElementById("password").value,
        new_password: document.getElementById("new_password")?.value || '',
        customName: document.getElementById("customName")?.value || '',
        customID: document.getElementById("customID")?.value || '',
        customIDplus: document.getElementById("customID++")?.value || '',
        boost_win: document.getElementById("raceWinBoost")?.value || '',
        InjectCoin: document.getElementById("InjectCoin")?.value || '',
        item: {
            name: clickedProduct?.querySelector(".item-name").value || '',
        },
        tuneupId: document.getElementById("tuneupDropdown")?.value || '',
        hp: document.getElementById("hp")?.value || '',
        innerHp: document.getElementById("innerHp")?.value || '',
        nm: document.getElementById("nm")?.value || '',
        innerNm: document.getElementById("innerNm")?.value || '',
        varian: document.getElementById("varianValue")?.innerHTML || ''
    };
}

function submitForm(event) {
    event.preventDefault();
    
    if (!clickedProduct) {
        console.error("No product is selected.");
        return;
    }

    var formData = getFormValues();

    fetch("/app_endpoint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeModal();
    })
    .catch(error => {
        console.error("Request failed:", error);
    });
}

// Utility Functions
function redirectToGroupTele() {
    window.open('https://t.me/+S3onUs2_39UxYzk1', '_blank');
}

function redirectToChannel() {
    window.open('https://t.me/topixsbofficial_1', '_blank');
}

function redirectToGroupWA() {
    window.open('https://chat.whatsapp.com/I0xXPZ5W62xHhBV1VSAZWq', '_blank');
}

function redirectToTiktok() {
    window.open('https://www.tiktok.com/@topixsbofficial', '_blank');
}

function logout() {
    alert('Anda telah logout.');
    window.location.href = '/logout';
}

function topup() {
    window.open('https://account.topixsb.dev');
}

function showFileForm() {
    var fileForm = document.getElementById("fileForm");
    fileForm.style.display = "block";
}

// Assistant Chat Functions
function toggleAssistant() {
    assistantContainer.style.display = (assistantContainer.style.display === "none" || assistantContainer.style.display === "") ? "block" : "none";
}

function sendMessage() {
    var userMessage = userInput.value.trim();
    if (userMessage !== "") {
        appendMessage("Unknown", userMessage);
        handleAssistantResponse(userMessage);
        userInput.value = "";
    }
}

function handleAssistantResponse(userMessage) {
    var assistantResponse = getAssistantResponse(userMessage);
    appendMessage("TopixSB", assistantResponse);
}

function getAssistantResponse(userMessage) {
    const responses = [
        { keywords: ["fitur", "apa fitur", "fitur website"], response: "Website ini memiliki fitur seperti pembelian dan kustomisasi fitur, asisten virtual, program VIP, pengelolaan pesanan dan papan peringkat, serta sistem top-up dan pembayaran." },
        { keywords: ["cara menggunakan", "bagaimana menggunakan", "panduan"], response: "Untuk menggunakan website ini, Anda bisa mulai dengan berinteraksi dengan asisten virtual, membeli dan mengkustomisasi fitur, bergabung dengan program VIP, memeriksa status pesanan dan papan peringkat, serta melakukan top-up saldo." },
        { keywords: ["bantuan", "butuh bantuan", "pertolongan"], response: "Jika Anda memerlukan bantuan lebih lanjut, silakan hubungi tim support kami melalui halaman kontak." },
        { keywords: ["topup", "isi saldo", "saldo"], response: "Untuk melakukan top-up, Anda dapat menuju ke halaman top-up di website kami dan mengikuti instruksi yang diberikan. Pastikan untuk memeriksa status pembayaran setelah melakukan transaksi." },
        { keywords: ["topup tidak masuk", "saldo tidak bertambah", "topup gagal"], response: "Jika top-up Anda tidak masuk, pastikan Anda telah mengikuti semua instruksi dengan benar. Jika masalah berlanjut, silakan hubungi tim dukungan kami untuk bantuan lebih lanjut." },
        { keywords: ["gagal", "masalah", "error"], response: "Jika Anda mengalami kegagalan, pastikan untuk memeriksa kembali langkah-langkah yang Anda lakukan. Jika masalah berlanjut, silakan hubungi tim dukungan kami di Whatsapp." },
        { keywords: ["robot", "asli", "TopixSB asli"], response: "Jika Anda ingin berbincang dengan TopixSB yang asli, Anda dapat bergabung ke grup Whatsapp / Telegram" },
        { keywords: ["program vip", "vip", "keuntungan vip"], response: "Program VIP kami menawarkan berbagai tingkatan dengan keuntungan eksklusif. Anda dapat bergabung dengan memilih tingkat VIP yang diinginkan." },
        { keywords: ["pesanan", "status pesanan", "cek pesanan"], response: "Anda dapat memeriksa status pesanan Anda di halaman pesanan. Informasi diperbarui secara berkala." },
        { keywords: ["papan peringkat", "leaderboard", "ranking"], response: "Papan peringkat menunjukkan peringkat pengguna berdasarkan aktivitas mereka di website. Anda dapat melihatnya di halaman papan peringkat." },
        { keywords: ["kustomisasi fitur", "edit fitur", "ubah fitur"], response: "Untuk mengkustomisasi fitur, pilih fitur yang diinginkan dan isi formulir kustomisasi yang tersedia." },
        { keywords: ["beli fitur", "pembelian", "checkout"], response: "Anda dapat membeli fitur dengan menambahkannya ke keranjang dan menyelesaikan proses pembayaran di halaman checkout." },
        { keywords: ["cloning account", "duplikasi akun", "copy akun"], response: "Fitur Cloning Account memungkinkan Anda untuk menggandakan akun dengan mudah. Pastikan untuk mengikuti instruksi yang diberikan." },
        { keywords: ["change id", "ganti id", "ubah id"], response: "Fitur Change ID memungkinkan Anda untuk mengubah ID akun Anda. Pastikan untuk mengikuti format yang benar saat mengisi formulir." },
        { keywords: ["apa yang dapat dilakukan asisten", "help", "bantuan asisten", "asisten virtual"], response: "Asisten virtual ini dapat membantu Anda dengan berbagai pertanyaan dan masalah, seperti informasi tentang fitur website, cara menggunakan website, bantuan dengan top-up dan pesanan, serta informasi tentang program VIP dan papan peringkat." },
        { keywords: ["logo store", "diskon", "20%"], response: "Logo store adalah logo dimana usernya dapat diskon 20% di semua item. Pastikan untuk memeriksa apakah Anda memiliki logo store untuk mendapatkan diskon ini. Cara mendapatkan logo store adalah dengan melakukan transaksi sebanyak 200.000." }
    ];

    const lowerUserMessage = userMessage.toLowerCase();
    for (const { keywords, response } of responses) {
        if (keywords.some(keyword => lowerUserMessage.includes(keyword))) {
            return response;
        }
    }

    return "Saya adalah asisten virtual. Saya dapat membantu Anda dengan berbagai pertanyaan umum. Jika Anda memiliki pertanyaan lain, silakan tanyakan dan saya akan berusaha untuk merespon.";
}

function appendMessage(sender, message) {
    var messageContainer = document.createElement("div");
    messageContainer.className = "mb-2";

    var senderLabel = document.createElement("strong");
    senderLabel.textContent = sender + ": ";

    var messageText = document.createTextNode(message);

    messageContainer.appendChild(senderLabel);
    messageContainer.appendChild(messageText);

    var assistantBody = document.getElementById("assistantBody");
    assistantBody.appendChild(messageContainer);

    // Scroll to the bottom of the chatbox
    assistantBody.scrollTop = assistantBody.scrollHeight;
}

// Initialize event listeners for forms
document.getElementById('generateRedeemForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    generateRedeemCodes();
});

document.getElementById('editUpdateForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const updateId = this.dataset.updateId;
    formData.append('updateId', updateId);

    fetch(`/edit_update/${updateId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        $('#editUpdateModal').modal('hide');
        fetchLatestUpdates();
    })
    .catch(error => console.error('Error submitting edit form:', error));
});

document.getElementById('createEventForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const eventName = document.getElementById('eventName').value;
    const amount = document.getElementById('eventAmount').value;
    
    fetch('/admin/create-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_name: eventName,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Event created successfully');
            $('#createEventModal').modal('hide');
            checkActiveEvents();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create event');
    });
});

// Check for active events when page loads
document.addEventListener('DOMContentLoaded', checkActiveEvents);

// Fix: Ensure jQuery is available
if (typeof jQuery == 'undefined') {
    console.error('jQuery is not loaded. Please ensure jQuery is properly included in your HTML.');
    // Option 1: Load jQuery from a CDN (Content Delivery Network)
    var script = document.createElement('script');
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
    script.type = 'text/javascript';
    script.onload = function() {
        // After jQuery is loaded, you can run your jQuery code
        $(document).ready(function() {
            // Your jQuery code here
            console.log('jQuery has loaded');
        });
    };
    document.getElementsByTagName('head')[0].appendChild(script);

    // Option 2: If jQuery is supposed to be included in your project, ensure it's loaded correctly in your HTML.
} else {
    // Now it's safe to use jQuery
    $(document).ready(function() {
        // Your jQuery code here
    });
}