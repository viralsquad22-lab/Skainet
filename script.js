document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const notification = document.getElementById('notification');
    const deliveryPanel = document.getElementById('deliveryPanel');
    const deliveryForm = document.getElementById('deliveryForm');
    const totalWeightSpan = document.getElementById('totalWeight');
    const weightInputs = document.querySelectorAll('.weight-input');
    const targetJoyeroSpan = document.getElementById('targetJoyero');
    const cancelDeliveryBtn = document.getElementById('cancelDelivery');
    
    let activeJoyeroId = null;
    
    // Configuración de límites por rol
    const limits = {
        'Dueño': 2,
        'Administrador': 1,
        'Líder de Taller': 1,
        'Joyero': 3
    };

    // Estado inicial de usuarios (simulado)
    let users = [];

    const showNotification = (message, isError = false) => {
        notification.textContent = message;
        notification.classList.remove('hidden', 'error');
        if (isError) notification.classList.add('error');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    };

    const updateDashboard = () => {
        // Limpiar todas las listas
        Object.keys(limits).forEach(role => {
            const roleId = `col-${role.replace(/ /g, '')}`;
            const column = document.getElementById(roleId);
            if (column) {
                const list = column.querySelector('.user-list');
                const counter = column.querySelector('.counter');
                const roleUsers = users.filter(u => u.role === role);
                
                list.innerHTML = '';
                counter.textContent = `${roleUsers.length}/${limits[role]}`;

                roleUsers.forEach(user => {
                    const card = document.createElement('div');
                    card.className = 'user-card';
                    card.style.cursor = role === 'Joyero' ? 'pointer' : 'default';
                    
                    const statusClass = user.working ? 'status-working' : 'status-available';
                    const statusText = user.working ? 'EN PROCESO' : 'DISPONIBLE';
                    
                    card.innerHTML = `
                        <div class="user-info">
                            <h4>${user.name}</h4>
                            <p>${user.specialty || 'Sin especialidad'}</p>
                            ${role === 'Joyero' ? `<span class="user-status ${statusClass}">${statusText}</span>` : ''}
                            ${user.working ? `<div class="timer" data-start="${user.startTime}">00:00:00</div>` : ''}
                        </div>
                        <button class="btn-delete" title="Eliminar">&times;</button>
                    `;
                    
                    if (role === 'Joyero') {
                        card.onclick = (e) => {
                            if (e.target.classList.contains('btn-delete')) return;
                            openDelivery(user);
                        };
                    }
                    
                    card.querySelector('.btn-delete').onclick = (e) => {
                        e.stopPropagation();
                        users = users.filter(u => u.id !== user.id);
                        updateDashboard();
                    };

                    list.appendChild(card);
                });
            }
        });
    };

    const openDelivery = (user) => {
        if (user.working) {
            showNotification(`${user.name} ya tiene un trabajo en proceso.`, true);
            return;
        }
        activeJoyeroId = user.id;
        targetJoyeroSpan.textContent = user.name;
        deliveryPanel.classList.remove('hidden');
        deliveryPanel.scrollIntoView({ behavior: 'smooth' });
    };

    const calculateTotal = () => {
        let total = 0;
        weightInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        totalWeightSpan.textContent = `${total.toFixed(2)}g`;
    };

    weightInputs.forEach(input => {
        input.oninput = calculateTotal;
    });

    cancelDeliveryBtn.onclick = () => {
        deliveryPanel.classList.add('hidden');
        deliveryForm.reset();
        calculateTotal();
        activeJoyeroId = null;
    };

    deliveryForm.onsubmit = (e) => {
        e.preventDefault();
        const user = users.find(u => u.id === activeJoyeroId);
        if (user) {
            user.working = true;
            user.startTime = Date.now();
            user.weights = {
                anillo: parseFloat(document.getElementById('weightAnillo').value),
                plastilina: parseFloat(document.getElementById('weightPlastilina').value),
                bolsa: parseFloat(document.getElementById('weightBolsa').value)
            };
            showNotification(`Trabajo iniciado para ${user.name}`);
            cancelDeliveryBtn.click();
            updateDashboard();
        }
    };

    // Lógica del Timer (cada segundo)
    setInterval(() => {
        document.querySelectorAll('.timer').forEach(timer => {
            const start = parseInt(timer.dataset.start);
            const now = Date.now();
            const diff = now - start;
            
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            
            timer.textContent = `${h}:${m}:${s}`;
        });
    }, 1000);

    userForm.onsubmit = (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const role = document.getElementById('userRole').value;
        const specialty = document.getElementById('userSpecialty').value;

        // Validar límite
        const currentCount = users.filter(u => u.role === role).length;
        if (currentCount >= limits[role]) {
            showNotification(`Límite alcanzado para el rol de ${role}`, true);
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            role,
            specialty
        };

        users.push(newUser);
        updateDashboard();
        userForm.reset();
        showNotification(`Usuario ${name} registrado correctamente.`);
    };

    // Inicializar dashboard vacío
    updateDashboard();
});
