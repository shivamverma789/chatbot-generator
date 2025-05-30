document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const editForm = document.getElementById("editForm")
  const nameInput = document.getElementById("name")
  const typeSelect = document.getElementById("type")
  const toneSelect = document.getElementById("tone")
  const abilitiesTextarea = document.getElementById("abilities")
  const goalTextarea = document.getElementById("goal")
  const visibilityRadios = document.querySelectorAll('input[name="visibility"]')

  // Preview elements
  const previewName = document.getElementById("previewName")
  const previewType = document.getElementById("previewType")
  const previewTone = document.getElementById("previewTone")
  const previewAbilities = document.getElementById("previewAbilities")
  const previewGoal = document.getElementById("previewGoal")
  const previewVisibility = document.getElementById("previewVisibility")
  const previewAvatar = document.getElementById("previewAvatar")

  // Buttons
  const saveBtn = document.getElementById("saveBtn")
  const cancelBtn = document.getElementById("cancelBtn")
  const previewBtn = document.getElementById("previewBtn")
  const deleteBtn = document.getElementById("deleteBtn")
  const shareBtn = document.getElementById("shareBtn")

  // Modals
  const deleteModal = document.getElementById("deleteModal")
  const shareModal = document.getElementById("shareModal")
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
  const confirmDeleteInput = document.getElementById("confirmDelete")

  // Character counters
  const abilitiesCounter = document.getElementById("abilitiesCounter")
  const goalCounter = document.getElementById("goalCounter")

  // Avatar mapping
  const avatarEmoji = {
    "Customer Support": "👩‍💼",
    Sales: "💼",
    Technical: "👨‍💻",
    Educational: "👩‍🏫",
    Entertainment: "🎭",
    "Personal Assistant": "🧠",
    Health: "⚕️",
    Financial: "💰",
  }

  // State
  let hasUnsavedChanges = false
  let originalFormData = {}

  // Initialize
  init()

  function init() {
    setupEventListeners()
    updateCharacterCounters()
    captureOriginalFormData()
    updatePreview()
  }

  function setupEventListeners() {
    // Form change detection
    const formInputs = [nameInput, typeSelect, toneSelect, abilitiesTextarea, goalTextarea, ...visibilityRadios]
    formInputs.forEach((input) => {
      input.addEventListener("input", handleFormChange)
      input.addEventListener("change", handleFormChange)
    })

    // Character counters
    abilitiesTextarea.addEventListener("input", updateCharacterCounters)
    goalTextarea.addEventListener("input", updateCharacterCounters)

    // Form submission
    editForm.addEventListener("submit", handleFormSubmit)

    // Button events
    cancelBtn.addEventListener("click", handleCancel)
    previewBtn.addEventListener("click", handlePreview)
    deleteBtn.addEventListener("click", showDeleteModal)
    shareBtn.addEventListener("click", showShareModal)

    // Modal events
    setupModalEvents()

    // Prevent accidental navigation
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Auto-save (optional)
    // setInterval(autoSave, 30000); // Auto-save every 30 seconds
  }

  function captureOriginalFormData() {
    originalFormData = {
      name: nameInput.value,
      type: typeSelect.value,
      tone: toneSelect.value,
      abilities: abilitiesTextarea.value,
      goal: goalTextarea.value,
      visibility: document.querySelector('input[name="visibility"]:checked')?.value,
    }
  }

  function handleFormChange() {
    checkForChanges()
    updatePreview()
    updateCharacterCounters()
  }

  function checkForChanges() {
    const currentData = {
      name: nameInput.value,
      type: typeSelect.value,
      tone: toneSelect.value,
      abilities: abilitiesTextarea.value,
      goal: goalTextarea.value,
      visibility: document.querySelector('input[name="visibility"]:checked')?.value,
    }

    hasUnsavedChanges = JSON.stringify(originalFormData) !== JSON.stringify(currentData)

    // Update save button state
    saveBtn.disabled = !hasUnsavedChanges || !validateForm()
    saveBtn.style.opacity = saveBtn.disabled ? "0.5" : "1"
  }

  function validateForm() {
    return (
      nameInput.value.trim() &&
      typeSelect.value &&
      toneSelect.value &&
      abilitiesTextarea.value.trim() &&
      document.querySelector('input[name="visibility"]:checked')
    )
  }

  function updateCharacterCounters() {
    if (abilitiesCounter) {
      abilitiesCounter.textContent = abilitiesTextarea.value.length
    }
    if (goalCounter) {
      goalCounter.textContent = goalTextarea.value.length
    }
  }

  function updatePreview() {
    // Update preview content
    previewName.textContent = nameInput.value || "Bot Name"
    previewType.textContent = typeSelect.value || "Bot Type"
    previewTone.textContent = toneSelect.value ? toneSelect.value + " tone" : "Tone"
    previewAbilities.textContent = abilitiesTextarea.value || "No abilities specified"
    previewGoal.textContent = goalTextarea.value || "No goal specified"

    // Update avatar
    const selectedType = typeSelect.value
    previewAvatar.textContent = avatarEmoji[selectedType] || "🤖"

    // Update visibility badge
    const selectedVisibility = document.querySelector('input[name="visibility"]:checked')?.value
    if (selectedVisibility) {
      const icon = selectedVisibility === "public" ? "🌍" : "🔒"
      const text = selectedVisibility.charAt(0).toUpperCase() + selectedVisibility.slice(1)
      previewVisibility.innerHTML = `
        <span class="visibility-icon">${icon}</span>
        <span class="visibility-text">${text}</span>
      `
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      showAlert("Please fill in all required fields.", "error")
      return
    }

    // Show loading state
    saveBtn.disabled = true
    saveBtn.innerHTML = '<span class="btn-icon">⟳</span><span>Saving...</span>'

    // Submit form
    editForm.submit()
  }

  function handleCancel() {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        window.location.href = "/my-bots"
      }
    } else {
      window.location.href = "/my-bots"
    }
  }

  function handlePreview() {
    // Open preview in new tab/window
    const botId = window.location.pathname.split("/")[2]
    window.open(`/bot/${botId}/chat`, "_blank")
  }

  function handleBeforeUnload(e) {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ""
    }
  }

  // Modal Functions
  function setupModalEvents() {
    // Delete modal
    document.getElementById("closeDeleteModal").addEventListener("click", hideDeleteModal)
    document.getElementById("cancelDelete").addEventListener("click", hideDeleteModal)
    confirmDeleteBtn.addEventListener("click", handleDelete)
    confirmDeleteInput.addEventListener("input", validateDeleteConfirmation)

    // Share modal
    document.getElementById("closeShareModal").addEventListener("click", hideShareModal)

    // Copy buttons
    document
      .querySelectorAll(".copy-btn")
      .forEach((btn) => {
        btn.addEventListener("click", handleCopy)
      })

    // Close modals on outside click
    ;[deleteModal, shareModal].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideDeleteModal()
          hideShareModal()
        }
      })
    })
  }

  function showDeleteModal() {
    deleteModal.classList.add("active")
    confirmDeleteInput.value = ""
    confirmDeleteBtn.disabled = true
    confirmDeleteInput.focus()
  }

  function hideDeleteModal() {
    deleteModal.classList.remove("active")
  }

  function validateDeleteConfirmation() {
    const isValid = confirmDeleteInput.value === "DELETE"
    confirmDeleteBtn.disabled = !isValid
    confirmDeleteBtn.style.opacity = isValid ? "1" : "0.5"
  }

  function handleDelete() {
    const botId = window.location.pathname.split("/")[2]

    // Show loading state
    confirmDeleteBtn.disabled = true
    confirmDeleteBtn.innerHTML = '<span class="btn-icon">⟳</span><span>Deleting...</span>'

    // Send delete request
    fetch(`/bot/${botId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          showAlert("Bot deleted successfully!", "success")
          setTimeout(() => {
            window.location.href = "/my-bots"
          }, 1500)
        } else {
          throw new Error("Failed to delete bot")
        }
      })
      .catch((error) => {
        console.error("Delete error:", error)
        showAlert("Failed to delete bot. Please try again.", "error")
        confirmDeleteBtn.disabled = false
        confirmDeleteBtn.innerHTML = '<span class="btn-icon">🗑️</span><span>Delete Forever</span>'
      })
  }

  function showShareModal() {
    shareModal.classList.add("active")
  }

  function hideShareModal() {
    shareModal.classList.remove("active")
  }

  function handleCopy(e) {
    const targetId = e.target.dataset.copy
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      targetElement.select()
      targetElement.setSelectionRange(0, 99999) // For mobile devices

      try {
        document.execCommand("copy")

        // Show feedback
        const originalText = e.target.textContent
        e.target.textContent = "Copied!"
        e.target.style.background = "#2cb67d"

        setTimeout(() => {
          e.target.textContent = originalText
          e.target.style.background = ""
        }, 2000)
      } catch (err) {
        console.error("Copy failed:", err)
        showAlert("Failed to copy to clipboard", "error")
      }
    }
  }

  // Utility Functions
  function showAlert(message, type = "info") {
    // Remove existing alerts
    document.querySelectorAll(".alert").forEach((alert) => alert.remove())

    const alert = document.createElement("div")
    alert.className = `alert alert-${type}`
    alert.innerHTML = `
      <span class="alert-icon">${type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️"}</span>
      <span>${message}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `

    const container = document.querySelector(".edit-container")
    const header = container.querySelector(".edit-header")
    container.insertBefore(alert, header.nextSibling)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove()
      }
    }, 5000)
  }

  function autoSave() {
    if (hasUnsavedChanges && validateForm()) {
      // Implement auto-save logic here
      console.log("Auto-saving...")
    }
  }

  // Global function for closing alerts
  window.closeAlert = (alertId) => {
    const alert = document.getElementById(alertId)
    if (alert) {
      alert.remove()
    }
  }

  // Hamburger menu functionality (if needed)
  const hamburger = document.getElementById("hamburger")
  const mobileMenu = document.getElementById("mobileMenu")

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      mobileMenu.classList.toggle("active")
    })
  }
})
