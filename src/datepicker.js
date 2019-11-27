function isSameDate(someDate, otherDate) {
  return someDate.getDate() == otherDate.getDate() &&
    someDate.getMonth() == otherDate.getMonth() &&
    someDate.getFullYear() == otherDate.getFullYear()
}

function dateIsoString(date) {
  var month = date.getMonth() + 1
  month = month < 10 ? "0" + month : month
  var day = date.getDate()
  day = day < 10 ? "0" + day : day
  return date.getFullYear() + '-' + month + '-' + day
}

function parseGermanDate(string) {
  var parts = string.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/)
  if (parts) {
    var day = parseInt(parts[1])
    var month = parseInt(parts[2])
    var year = parseInt(parts[3].length == 2 ? "20" + parts[3] : parts[3])
    var date = new Date(year, month - 1, day)
    if (date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day) {
      return date
    }
  }
}

function formatGermanDate(date) {
  var day = date.getDate()
  day = day < 10 ? "0" + day : day
  var month = date.getMonth() + 1
  month = month < 10 ? "0" + month : month
  var year = date.getFullYear()
  return day + "." + month + "." + year
}

document.querySelectorAll('.js-datepicker').forEach(function (input) {
  var button = input.parentElement.querySelector('button')
  var popup = input.parentElement.querySelector('.js-datepicker-popup')
  var months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"
  ]

  function renderPopup(year, month) {
    var selectedDate = parseGermanDate(input.value)
    var minDate = input.getAttribute('min') ? new Date(input.getAttribute('min')) : null
    if (minDate) {
      minDate.setHours(0, 0, 0, 0)
    }
    var maxDate = input.getAttribute('max') ? new Date(input.getAttribute('max')) : null
    if (maxDate) {
      maxDate.setHours(0, 0, 0, 0)
    }

    // Navigation
    var prevButton = popup.querySelector('.prev-button')
    prevButton.onclick = function (event) {
      event.preventDefault()
      if (month === 1) {
        renderPopup(year - 1, 12)
      } else {
        renderPopup(year, month - 1)
      }
    }
    var nextButton = popup.querySelector('.next-button')
    nextButton.onclick = function (event) {
      event.preventDefault()
      if (month === 12) {
        renderPopup(year + 1, 1)
      } else {
        renderPopup(year, month + 1)
      }
    }
    var currentNav = popup.querySelector('.current-month')
    currentNav.innerHTML = months[month - 1] + " " + year

    var table = popup.querySelector('table')
    table.innerHTML = ""
    // weekday header
    var days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    var header = document.createElement("tr")
    days.forEach(function (day) {
      var th = document.createElement("th")
      th.innerHTML = day
      th.className = "p-2 text-center text-gray-500 uppercase text-xs"
      header.appendChild(th)
    })
    table.appendChild(header)

    var firstDateOfMonth = new Date(year, month - 1, 1)
    var lastDateOfMonth = new Date(year, month, 0)
    var offset = firstDateOfMonth.getDay()
    offset = offset === 0 ? 6 : offset - 1 // Mo = 0
    var currentDay = 1
    var tr
    var td
    // loop over weeks
    for (var i = 0; i < 6; i++) {
      tr = document.createElement("tr")
      table.appendChild(tr)
      if (currentDay === lastDateOfMonth.getDate()) break

      // loop over weekdays
      for (var j = 0; j < 7; j++) {
        td = document.createElement("td")
        td.className = "text-center p-1"
        tr.appendChild(td)
        if (offset === 0) {
          // add button (disabled by default)
          var dayButton = document.createElement('button')
          dayButton.innerHTML = currentDay
          dayButton.setAttribute('type', 'button')
          dayButton.setAttribute('disabled', 'disabled')
          dayButton.className = "w-8 h-8 rounded-full focus:outline-none focus:bg-blue-200 text-center text-gray-500 pointer-events-none"
          var date = new Date(year, month - 1, currentDay)
          date.setHours(0, 0, 0, 0)
          dayButton.title = days[j] + ", " + formatGermanDate(date)
          dayButton.setAttribute('data-date', dateIsoString(date))
          td.appendChild(dayButton)

          // highlight today
          if (isSameDate(date, new Date())) {
            dayButton.className += ' font-bold'
            dayButton.title = "heute"
          }

          // highlight selected date
          if (selectedDate && isSameDate(date, selectedDate)) {
            dayButton.className += ' bg-blue-300'
          }

          // highlight min date
          if (minDate && isSameDate(date, minDate)) {
            dayButton.className += ' bg-blue-100'
          }

          // click handler and enable button if not disabled
          if ((!minDate || date >= minDate) && !maxDate || date <= maxDate) {
            dayButton.className += " hover:bg-blue-200 text-gray-700 pointer-events-auto"
            dayButton.removeAttribute('disabled')
            dayButton.classList.remove('cursor-not-allowed')
            dayButton.classList.remove('text-gray-500')
            dayButton.classList.remove('pointer-events-none')
            dayButton.onclick = function (event) {
              var date = new Date(event.target.getAttribute('data-date'))
              date.setHours(0, 0, 0, 0)
              input.value = formatGermanDate(date)
              input.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true,
              }))
              popup.classList.add('hidden')
              input.focus()
            }
          }

          if (currentDay === lastDateOfMonth.getDate()) break
          currentDay++
        } else {
          offset--
        }
      }
    }
    popup.appendChild(table)

    // focus a date initially
    var selectedDateButton = selectedDate ? table.querySelector('[data-date="' + dateIsoString(selectedDate) + '"]') : null
    var todayButton = table.querySelector('[data-date="' + dateIsoString(new Date()) + '"]')
    var minDateButton = minDate ? table.querySelector('[data-date="' + dateIsoString(minDate) + '"]') : null
    if (selectedDateButton) {
      selectedDateButton.focus()
    } else if (minDateButton) {
      minDateButton.focus()
    } else if (todayButton) {
      todayButton.focus()
    } else {
      table.querySelector('button').focus()
    }

    // keyboard nav in table
    table.onkeydown = function (event) {
      var date = new Date(event.target.getAttribute('data-date'))
      date.setHours(0, 0, 0, 0)
      // focus next date on ArrowRight
      if (event.key === 'ArrowRight' || event.key == 'Right') {
        event.preventDefault()
        date.setDate(date.getDate() + 1)
        if (date.getMonth() + 1 !== month) {
          return renderPopup(date.getFullYear(), date.getMonth() + 1)
        } else {
          return table.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
        }
      }
      // focus prev date on ArrowRight
      if (event.key === 'ArrowLeft' || event.key == 'Left') {
        event.preventDefault()
        date.setDate(date.getDate() - 1)
        if (date.getMonth() + 1 !== month) {
          setTimeout(function () {
            var buttons = popup.querySelectorAll('table button')
            buttons[buttons.length - 1].focus()
          }, 5)
          return renderPopup(date.getFullYear(), date.getMonth() + 1)
        } else {
          return table.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
        }
      }
      // focus next week on ArrowDown
      if (event.key === 'ArrowDown' || event.key == 'Down') {
        event.preventDefault()
        date.setDate(date.getDate() + 7)
        if (date.getMonth() + 1 !== month) {
          setTimeout(function () {
            popup.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
          }, 5)
          return renderPopup(date.getFullYear(), date.getMonth() + 1)
        } else {
          return table.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
        }
      }
      // focus prev week on ArrowUp
      if (event.key === 'ArrowUp' || event.key == 'Up') {
        event.preventDefault()
        date.setDate(date.getDate() - 7)
        if (date.getMonth() + 1 !== month) {
          setTimeout(function () {
            popup.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
          }, 5)
          return renderPopup(date.getFullYear(), date.getMonth() + 1)
        } else {
          return table.querySelector('[data-date="' + dateIsoString(date) + '"]').focus()
        }
      }
    }

  }

  // open/close on button click
  button.addEventListener('click', function (event) {
    if (input.hasAttribute('disabled')) {
      return;
    }
    event.preventDefault()
    if (popup.classList.contains('hidden')) {
      popup.classList.remove('hidden')

      var date
      var selectedDate = parseGermanDate(input.value)
      var minDate = input.getAttribute('min') ? new Date(input.getAttribute('min')) : null
      if (selectedDate) {
        date = selectedDate
      } else if (minDate) {
        date = minDate
      } else {
        date = new Date()
      }
      renderPopup(date.getFullYear(), date.getMonth() + 1)
    } else {
      popup.classList.add('hidden')
    }
  })

  // close on ESC
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (!popup.classList.contains('hidden')) {
        event.preventDefault()
        popup.classList.add('hidden')
      }
    }
  })

  // close on click outside
  document.addEventListener('click', function (event) {
    if (!(popup.contains(event.target) || event.target === popup || event.target === button || button.contains(event.target))) {
      if (!popup.classList.contains('hidden')) {
        event.preventDefault()
        popup.classList.add('hidden')
      }
    }
  })
})