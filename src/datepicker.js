function isEqualToDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
}

function format(date, formatStr) {
    day = date.toLocaleString('en-US', { weekday: 'long'});
    dayNumber = date.getDate();
    dayShort = date.toLocaleString('en-US', { weekday: 'short'});
    year = date.getFullYear();
    yearShort = date.toLocaleString('en-US', { year: '2-digit'});
    month = date.toLocaleString('en-US', { month: 'long'});
    monthShort = date.toLocaleString('en-US', { month: 'short'});
    monthNumber = date.getMonth() + 1;
    return formatStr
    .replace(/\bYYYY\b/, year)
    .replace(/\bYYY\b/, yearShort)
    .replace(/\bDDDD\b/, day)
    .replace(/\bDDD\b/, dayShort)
    .replace(/\bDD\b/, dayNumber.toString().padStart(2, '0'))
    .replace(/\bD\b/, date)
    .replace(/\bMMMM\b/, month)
    .replace(/\bMMM\b/, monthShort)
    .replace(/\bMM\b/, monthNumber.toString().padStart(2, '0'))
    .replace(/\bM\b/, monthNumber)
}


class Calendar {
    constructor(year, month) {
        this.currentYear = year
        this.currentMonth = month
    }

    getDay(dayNumber) {
        return new Date(this.currentYear, this.currentMonth, dayNumber)
    }

    getPreviousMonth() {
        if (this.currentMonth === 0) {
            return new Date(this.currentYear - 1, 11)
        }
        return new Date(this.currentYear, this.currentMonth - 1)
    }

    getNextMonth() {
        if (this.currentMonth === 11) {
            return new Date(this.currentYear + 1, 0)
        }
        return new Date(this.currentYear, this.currentMonth + 1);
    }

    goToDate(monthNumber, year) {
        this.currentMonth = monthNumber;
        this.currentYear = year;
    }

    goToNextYear() {
        this.currentYear += 1;
        this.currentMonth = 0;
    }

    goToPreviousYear() {
        this.currentYear -= 1;
        this.currentMonth = 11;
    }

    goToNextMonth() {
        if (this.currentMonth === 11) {
            return this.goToNextYear();
        }
        this.currentMonth += 1
    }

    goToPreviousMonth() {
        if (this.currentMonth === 0) {
            return this.goToPreviousYear();
        }
        this.currentMonth -= 1
    }
}

class DatePicker extends HTMLElement {
    format = 'MMM DD, YYYY';
    position = 'bottom';
    visible = false;
    date = null;
    mounted = false;
    // elements
    toggleButton = null;
    calendarDropDown = null;
    calendarDateElement = null;
    calendarDaysContainer = null;
    selectedDayElement = null;

    constructor() {
        super();

        const date = new Date(this.date ?? (this.getAttribute("date") || Date.now()));
        this.shadow = this.attachShadow({
            mode: "open"
        });
        this.date = date
        this.calendar = new Calendar(date.getFullYear(), date.getMonth());

        this.format = this.getAttribute('format') || this.format;
        this.position = DatePicker.position.includes(this.getAttribute('position')) ?
            this.getAttribute('position') :
            this.position;
        this.visible = this.getAttribute('visible') === '' ||
            this.getAttribute('visible') === 'true' ||
            this.visible;

        this.setAttribute('value', this.calendar.getDay(this.date.getDate()).getTime())

        this.render()
    }
    
    connectedCallback() {
        this.mounted = true;

        this.toggleButton = this.shadow.querySelector('.date-toggle');
        this.calendarDropDown = this.shadow.querySelector('.calendar-dropdown');
        const [prevBtn, calendarDateElement, nextButton] = this.calendarDropDown
            .querySelector('.header').children;
        this.calendarDateElement = calendarDateElement;
        this.calendarDaysContainer = this.calendarDropDown.querySelector('.month-days');

        this.toggleButton.addEventListener('click', () => this.toggleCalendar());
        prevBtn.addEventListener('click', () => this.prevMonth());
        nextButton.addEventListener('click', () => this.nextMonth());
        document.addEventListener('click', (e) => this.handleClickOut(e));

        this.renderCalendarDays();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.mounted) return;

        switch (name) {
            case "date":
                this.date = new Date(newValue);
                this.calendar.goToDate(this.date.monthNumber, this.date.year);
                this.renderCalendarDays();
                this.updateToggleText();
                break;
            case "format":
                this.format = newValue;
                this.updateToggleText();
                break;
            case "visible":
                this.visible = ['', 'true', 'false'].includes(newValue) ?
                    newValue === '' || newValue === 'true' :
                    this.visible;
                this.toggleCalendar(this.visible);
                break;
            case "position":
                this.position = DatePicker.position.includes(newValue) ?
                    newValue :
                    this.position;
                this.calendarDropDown.className =
                    `calendar-dropdown ${this.visible ? 'visible' : ''} ${this.position}`;
                break;
        }
    }

    toggleCalendar(visible = null) {
        if (visible === null) {
            this.calendarDropDown.classList.toggle('visible');
        } else if (visible) {
            this.calendarDropDown.classList.add('visible');
        } else {
            this.calendarDropDown.classList.remove('visible');
        }

        this.visible = this.calendarDropDown.className.includes('visible');

        if (this.visible) {
            this.calendarDateElement.focus();
        } else {
            this.toggleButton.focus();

            if (!this.isCurrentCalendarMonth()) {
                this.calendar.goToDate(this.date.getMonth(), this.date.getFullYear());
                this.renderCalendarDays();
            }
        }
    }

    prevMonth() {
        this.calendar.goToPreviousMonth();
        this.renderCalendarDays();
    }

    nextMonth() {
        this.calendar.goToNextMonth();
        this.renderCalendarDays();
    }

    updateHeaderText() {
        const monthYear = format(this.calendar.getDay(1), "MMMM, YYYY")
        this.calendarDateElement.textContent = monthYear
        this.calendarDateElement
            .setAttribute('aria-label', `current month ${monthYear}`);
    }

    isCurrentCalendarMonth() {
        return this.calendar.currentMonth === this.date.getMonth() &&
            this.calendar.currentYear === this.date.getFullYear();
    }

    selectDay(el, day) {
        if (isEqualToDate(day, this.date)) return;

        this.date = day;

        if (day.monthNumber !== this.calendar.currentMonth.number) {
            this.prevMonth();
        } else {
            el.classList.add('selected');
            this.selectedDayElement.classList.remove('selected');
            this.selectedDayElement = el;
        }
        this.setAttribute('value', day.getTime())
        this.toggleCalendar();
        this.updateToggleText();
        this.updateHeaderText();
        this.updateMonthDays();
    }

    handleClickOut(e) {
        if (this.visible && (this !== e.target)) {
            this.toggleCalendar(false);
        }
    }
    
    getMonthDaysGrid() {
        const totalLastMonthFinalDays = this.calendar.getDay(1).getDay()
        const totalDays = new Date(this.calendar.currentYear, this.calendar.currentMonth + 1, 0).getDate() + totalLastMonthFinalDays;
        const monthList = Array.from({
            length: totalDays
        });

        for (let i = 0; i < totalLastMonthFinalDays; i++) {
            monthList[totalLastMonthFinalDays - i - 1] = this.calendar.getDay(-i)
        }
        for (let i = 0; i < totalDays - totalLastMonthFinalDays; i++){
            monthList[i + totalLastMonthFinalDays] = this.calendar.getDay(i + 1)
        }
        return monthList;
    }

    updateToggleText() {
        const date = format(this.date, this.format)
        this.toggleButton.textContent = date;
    }

    updateMonthDays() {
        this.calendarDaysContainer.innerHTML = '';

        this.getMonthDaysGrid().forEach(day => {
            const el = document.createElement('button');
            el.part = 'month-day'
            el.textContent = day.getDate();
            el.addEventListener('click', () => this.selectDay(el, day));
            el.setAttribute('aria-label', format(day, this.format));
            el.setAttribute('value', day.getTime())

            if (day.getMonth() === this.calendar.currentMonth) {
                el.part += ' month-day-current'
                if (isEqualToDate(this.date, day)) {
                    el.part += ' month-day-current-selected'
                    this.selectedDayElement = el;
                }
            } else {
                el.part += ' month-day-noncurrent'
                if (isEqualToDate(this.date, day)) {
                    el.part += ' month-day-noncurrent-selected'
                    this.selectedDayElement = el;
                }
            }
            this.calendarDaysContainer.appendChild(el);
        })
    }

    renderCalendarDays() {
        this.updateHeaderText();
        this.updateMonthDays();
        this.calendarDateElement.focus();
    }

    static get observedAttributes() {
        return ['date', 'format', 'visible', 'position'];
    }

    static get position() {
        return ['top', 'left', 'bottom', 'right'];
    }

    get style() {
        return `
        :host {
          position: relative;
        }
        
        .calendar-dropdown {
            display: none;
            position: absolute;
        }

        .calendar-dropdown.top {
          top: auto;
          bottom: 100%;
          transform: translate(-50%, -8px);
        }
        
        .calendar-dropdown.left {
          top: 50%;
          left: 0;
          transform: translate(calc(-8px + -100%), -50%);
        }
        
        .calendar-dropdown.right {
          top: 50%;
          left: 100%;
          transform: translate(8px, -50%);
        }
        
        .calendar-dropdown.visible {
          display: block;
        }
    `;
    }

    render() {
        const monthYear = format(this.date, "MMMM, YYYY")
        const date = format(this.date, this.format)
        this.shadow.innerHTML = `
        <style>${this.style}</style>
        <button type="button" class="date-toggle" part="date-toggle">${date}</button>
        <div part="calendar-dropdown" class="calendar-dropdown ${this.visible ? 'visible' : ''} ${this.position}">
            <div part="header-div">
            <div part="header" class="header">
            <button type="button" part="month-navigator" aria-label="previous month"></button>
            <h4 tabindex="0" part="header-text" aria-label="current month ${monthYear}">
              ${monthYear}
            </h4>
            <button type="button" part="month-navigator month-navigator-next" aria-label="next month"></button>
        </div>
        <div part="week-days">
        <span part="week-day">Sun</span>
        <span part="week-day">Mon</span>
        <span part="week-day">Tue</span>
        <span part="week-day">Wed</span>
        <span part="week-day">Thu</span>
        <span part="week-day">Fri</span>
        <span part="week-day">Sat</span>
        </div>
            </div>
          <div part="month-days" class="month-days"></div>
        </div>
      `
    }
}

customElements.define("date-picker", DatePicker);