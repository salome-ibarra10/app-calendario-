document.addEventListener('DOMContentLoaded', function() {
    // Configuración inicial
    let currentDate = new Date();
    let cycleLength = 28;
    let periodLength = 5;
    let lastPeriodDate = null;
    let periodHistory = [];
    
    // Elementos del DOM
    const currentMonthYear = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const monthSelector = document.getElementById('month-selector');
    const cycleLengthInput = document.getElementById('cycle-length');
    const periodLengthInput = document.getElementById('period-length');
    const saveSettingsBtn = document.getElementById('save-settings');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const closeNotification = document.querySelector('.close-notification');
    
    // Cargar datos guardados
    loadSavedData();
    
    // Inicializar calendario
    renderCalendar();
    renderMonthSelector();
    checkUpcomingPeriod();
    
    // Event listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    prevYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar();
        renderMonthSelector();
    });
    
    nextYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar();
        renderMonthSelector();
    });
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    closeNotification.addEventListener('click', () => {
        notification.style.display = 'none';
    });
    
    // Funciones
    function renderCalendar() {
        // Configurar el encabezado del mes y año
        const options = { month: 'long', year: 'numeric' };
        currentMonthYear.textContent = currentDate.toLocaleDateString('es-ES', options);
        
        // Limpiar el calendario
        calendarGrid.innerHTML = '';
        
        // Añadir encabezados de días
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Obtener primer día del mes y último día del mes
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Obtener día de la semana del primer día (0-6 donde 0 es domingo)
        const startingDayOfWeek = firstDayOfMonth.getDay();
        
        // Añadir días vacíos si el mes no comienza en domingo
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Añadir días del mes
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Verificar si es un día de periodo
            if (isPeriodDay(date)) {
                dayElement.classList.add('period-day');
                const periodMarker = document.createElement('div');
                periodMarker.textContent = '🌸';
                dayElement.appendChild(periodMarker);
            }
            
            // Verificar si es un día predicho de periodo
            if (isPredictedPeriodDay(date)) {
                dayElement.classList.add('predicted-period');
                const predictedMarker = document.createElement('div');
                predictedMarker.textContent = '🔮';
                dayElement.appendChild(predictedMarker);
            }
            
            // Hacer clic para marcar el primer día del periodo
            dayElement.addEventListener('click', () => {
                if (confirm(`¿Quieres marcar el ${day}/${currentDate.getMonth() + 1} como el primer día de tu periodo?`)) {
                    lastPeriodDate = new Date(date);
                    periodHistory.push(new Date(date));
                    saveData();
                    renderCalendar();
                    checkUpcomingPeriod();
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    function renderMonthSelector() {
        monthSelector.innerHTML = '';
        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];
        
        months.forEach((month, index) => {
            const button = document.createElement('button');
            button.className = 'month-button';
            if (index === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()) {
                button.classList.add('active');
            }
            button.textContent = month;
            button.addEventListener('click', () => {
                currentDate.setMonth(index);
                renderCalendar();
                
                // Actualizar clase active
                document.querySelectorAll('.month-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
            monthSelector.appendChild(button);
        });
    }

    function isPeriodDay(date) {
        if (!lastPeriodDate) return false;
        
        // Verificar si es el mismo día que el último periodo registrado
        if (isSameDay(date, lastPeriodDate)) return true;
        
        // Verificar si está dentro del rango de días del periodo
        const periodEndDate = new Date(lastPeriodDate);
        periodEndDate.setDate(lastPeriodDate.getDate() + periodLength - 1);
        
        return date >= lastPeriodDate && date <= periodEndDate;
    }
    
    function isPredictedPeriodDay(date) {
        if (!lastPeriodDate) return false;
        
        // Calcular el próximo periodo esperado
        const nextPeriodDate = new Date(lastPeriodDate);
        nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
        
        const nextPeriodEndDate = new Date(nextPeriodDate);
        nextPeriodEndDate.setDate(nextPeriodDate.getDate() + periodLength - 1);
        
        // Verificar si la fecha está dentro del rango predicho
        return date >= nextPeriodDate && date <= nextPeriodEndDate;
    }
    
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function saveSettings() {
        cycleLength = parseInt(cycleLengthInput.value);
        periodLength = parseInt(periodLengthInput.value);
        saveData();
        renderCalendar();
        checkUpcomingPeriod();
        alert('Configuración guardada correctamente.');
    }
    
    function checkUpcomingPeriod() {
        if (!lastPeriodDate) return;
        
        const today = new Date();
        const nextPeriodDate = new Date(lastPeriodDate);
        nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
        
        // Calcular días restantes para el próximo periodo
        const timeDiff = nextPeriodDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff > 0 && daysDiff <= 3) {
            notificationMessage.textContent = `¡Hello Kitty te avisa! Tu periodo está por llegar en ${daysDiff} día${daysDiff > 1 ? 's' : ''}.`;
            notification.style.display = 'block';
            
            // Ocultar notificación después de 5 segundos
            setTimeout(() => {
                notification.style.display = 'none';
            }, 10000);
        }
    }
    
    function saveData() {
        const data = {
            cycleLength,
            periodLength,
            lastPeriodDate: lastPeriodDate ? lastPeriodDate.getTime() : null,
            periodHistory: periodHistory.map(date => date.getTime())
        };
        localStorage.setItem('menstrualCalendarData', JSON.stringify(data));
    }
    
    function loadSavedData() {
        const savedData = localStorage.getItem('menstrualCalendarData');
        if (savedData) {
            const data = JSON.parse(savedData);
            cycleLength = data.cycleLength || 28;
            periodLength = data.periodLength || 5;
            lastPeriodDate = data.lastPeriodDate ? new Date(data.lastPeriodDate) : null;
            periodHistory = data.periodHistory ? data.periodHistory.map(time => new Date(time)) : [];
            
            // Actualizar inputs
            cycleLengthInput.value = cycleLength;
            periodLengthInput.value = periodLength;
        }
    }
});