class GymTracker {
  constructor() {
    this.currentDate = new Date()
    this.selectedDate = null
    this.workouts = this.loadWorkouts()
    this.monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    this.init()
  }

  init() {
    this.renderCalendar()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Month navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      this.renderCalendar()
    })

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      this.renderCalendar()
    })

    // Modal controls
    document.querySelector(".close").addEventListener("click", () => {
      this.closeModal()
    })

    document.getElementById("exerciseModal").addEventListener("click", (e) => {
      if (e.target.id === "exerciseModal") {
        this.closeModal()
      }
    })

    // Add exercise
    document.getElementById("addExercise").addEventListener("click", () => {
      this.addExercise()
    })

    // Enter key to add exercise
    document
      .getElementById("exerciseName")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addExercise()
        }
      })
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    // Update month display
    document.getElementById(
      "currentMonth"
    ).textContent = `${this.monthNames[month]} ${year}`

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Get previous month's last days
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()

    const calendarGrid = document.getElementById("calendarGrid")
    calendarGrid.innerHTML = ""

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayElement = this.createDayElement(
        daysInPrevMonth - i,
        year,
        month - 1,
        true
      )
      calendarGrid.appendChild(dayElement)
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = this.createDayElement(day, year, month, false)
      calendarGrid.appendChild(dayElement)
    }

    // Add next month's leading days
    const totalCells = calendarGrid.children.length
    const remainingCells = 42 - totalCells // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const dayElement = this.createDayElement(day, year, month + 1, true)
      calendarGrid.appendChild(dayElement)
    }
  }

  createDayElement(day, year, month, isOtherMonth) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"

    if (isOtherMonth) {
      dayElement.classList.add("other-month")
    }

    // Check if it's today
    const today = new Date()
    if (
      !isOtherMonth &&
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayElement.classList.add("today")
    }

    const dateKey = this.getDateKey(year, month, day)
    const dayWorkouts = this.workouts[dateKey] || []

    // Check if day has workouts
    if (dayWorkouts.length > 0) {
      dayElement.classList.add("has-workout")
    }

    dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${this.renderWorkoutSummary(dayWorkouts)}
        `

    dayElement.addEventListener("click", () => {
      this.openModal(year, month, day)
    })

    return dayElement
  }

  renderWorkoutSummary(workouts) {
    if (workouts.length === 0) return ""

    const totalExercises = workouts.length
    const exerciseNames = workouts
      .slice(0, 2)
      .map((w) => w.name)
      .join(", ")
    const moreText = workouts.length > 2 ? `+${workouts.length - 2}` : ""

    return `
            <div class="workout-summary">
                <div class="exercise-count">${totalExercises} ejercicio${
      totalExercises > 1 ? "s" : ""
    }</div>
            </div>
        `
  }

  openModal(year, month, day) {
    this.selectedDate = { year, month, day }
    const dateKey = this.getDateKey(year, month, day)

    const date = new Date(year, month, day)
    const dateString = date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    document.getElementById("selectedDate").textContent = dateString
    document.getElementById("exerciseModal").style.display = "block"

    this.renderExercisesList()
    this.clearForm()
  }

  closeModal() {
    document.getElementById("exerciseModal").style.display = "none"
    this.selectedDate = null
  }

  addExercise() {
    const name = document.getElementById("exerciseName").value.trim()
    const sets = parseInt(document.getElementById("sets").value)
    const reps = parseInt(document.getElementById("reps").value)
    const weight = parseFloat(document.getElementById("weight").value)

    if (!name || !sets || !reps || isNaN(weight)) {
      alert("Por favor, completa todos los campos")
      return
    }

    const dateKey = this.getDateKey(
      this.selectedDate.year,
      this.selectedDate.month,
      this.selectedDate.day
    )

    if (!this.workouts[dateKey]) {
      this.workouts[dateKey] = []
    }

    const exercise = {
      id: Date.now(),
      name,
      sets,
      reps,
      weight,
      timestamp: new Date().toISOString(),
    }

    this.workouts[dateKey].push(exercise)
    this.saveWorkouts()
    this.renderExercisesList()
    this.renderCalendar()
    this.clearForm()
  }

  renderExercisesList() {
    const dateKey = this.getDateKey(
      this.selectedDate.year,
      this.selectedDate.month,
      this.selectedDate.day
    )

    const exercises = this.workouts[dateKey] || []
    const exercisesList = document.getElementById("exercisesList")

    if (exercises.length === 0) {
      exercisesList.innerHTML =
        '<p style="color: #718096; text-align: center; padding: 20px;">No hay ejercicios registrados para este día</p>'
      return
    }

    exercisesList.innerHTML = exercises
      .map(
        (exercise) => `
            <div class="exercise-item">
                <div class="exercise-info">
                    <h5>${exercise.name}</h5>
                    <div class="exercise-details">
                        ${exercise.sets} series × ${exercise.reps} reps @ ${exercise.weight}kg
                    </div>
                </div>
                <button class="delete-btn" onclick="gymTracker.deleteExercise('${dateKey}', ${exercise.id})">
                    Eliminar
                </button>
            </div>
        `
      )
      .join("")
  }

  deleteExercise(dateKey, exerciseId) {
    if (!this.workouts[dateKey]) return

    this.workouts[dateKey] = this.workouts[dateKey].filter(
      (exercise) => exercise.id !== exerciseId
    )

    if (this.workouts[dateKey].length === 0) {
      delete this.workouts[dateKey]
    }

    this.saveWorkouts()
    this.renderExercisesList()
    this.renderCalendar()
  }

  clearForm() {
    document.getElementById("exerciseName").value = ""
    document.getElementById("sets").value = ""
    document.getElementById("reps").value = ""
    document.getElementById("weight").value = ""
    document.getElementById("exerciseName").focus()
  }

  getDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`
  }

  loadWorkouts() {
    try {
      const stored = localStorage.getItem("gymTrackerWorkouts")
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Error loading workouts:", error)
      return {}
    }
  }

  saveWorkouts() {
    try {
      localStorage.setItem("gymTrackerWorkouts", JSON.stringify(this.workouts))
    } catch (error) {
      console.error("Error saving workouts:", error)
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.gymTracker = new GymTracker()
})
