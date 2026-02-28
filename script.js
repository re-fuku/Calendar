
class MyCalendar extends HTMLElement {

    // コンストラクタ
    constructor() {
        super(); // HTMLElementの初期化
        this.attachShadow({mode: 'open'}); // Shadow DOMの作成
        const today = new Date(); // 今日の日付
        this.year = today.getFullYear(); // 現在の都市
        this.month = today.getMonth() + 1; // 現在の月(0~11なので+1)
        this.day = today.getDate(); // 現在の日
    }

    // カレンダーの月部分を作成する
    generateMonth() {
        let html = '';

        for (let month = 1; month <= 12; month++) {
            const checked = month === this.month ? 'checked' : '';
            html += 
                `<label class="month">
                    <input type="radio" name="select_month" value="${month}" ${checked}>
                    <span class="month-number">${month}</span>
                </label>
            `;
        }

        return html;
    }

    // カレンダーの日付部分を作成する
    generateDayGrid(year, month) {
        const firstDay = new Date(year, month - 1, 1).getDay(); // 月の最初の曜日(0=sat)
        const daysInMonth = new Date(year, month, 0).getDate(); // その月の日数

        let html = '';

        //　月の開始日までの空白セルを追加する
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day empty"></div>';
        }

        // 日付を追加
        for (let day = 1; day <= daysInMonth; day++) {
            const checked = day === this.day ? 'checked' : '';

            html += 
                `<label class="day">
                    <input type="radio" name="select_day" value="${day}" ${checked}>
                    <span class="day-number">${day}</span>
                </label>
            `;

        }

        return html;
    }

    // 月のラジオボタンにイベントを追加
    setUpMonthListeners() {
        const monthRadios = this.shadowRoot.querySelectorAll('input[name="select_month"]');

        monthRadios.forEach(radio => {
            // "select_month"内のラジオボタンに'change'イベント付与
            radio.addEventListener('change', (e) => {
                this.month = parseInt(e.target.value); // 月の値をラジオボタンのvalueで変更
                this.updateCalendar(); // カレンダーを更新する
            })
        })
    }

    // 月が変更されたら日付部分を更新する
    updateCalendar() {
        const daysGrid = this.shadowRoot.querySelector('.days-grid');
        daysGrid.innerHTML = this.generateDayGrid(this.year, this.month); // 日付を作成しなおす
        
        this.setUpDayListeners() // 日付のラジオボタンを再設定しなおす
    }

    // 日付のラジオボタンにイベントを追加
    setUpDayListeners() {
        const dayRadios = this.shadowRoot.querySelectorAll('input[name="select_day"]');

        dayRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.day = parseInt(e.target.value);
            })
        })
    }

    // 年を変更する関数
    changeYear(value) {
        this.year += value;
        this.shadowRoot.querySelector('#current-year').textContent = this.year;
        this.updateCalendar();
    }


    // 要素がDOMに追加されたときに自動実行される初期化処理
    connectedCallback() {
        this.render();
        this.setUpMonthListeners();

        const value = this.getAttribute('value');
        if (value) {
            const [y, m, d] = value.split('-');
            this.shadowRoot.querySelector('#input-year').value = y;
            this.shadowRoot.querySelector('#input-month').value = parseInt(m);
            this.shadowRoot.querySelector('#input-day').value = parseInt(d);
            this.year = parseInt(y); //確認必要
            this.month = parseInt(m);
            this.day = parseInt(d);
        }
    }

    // カレンダー全体のHTMLを生成してShadow DOMに描画する
    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="style.css">

            <div id="app-container">
                <!-- ➀日付入力部分 -->
                <div class="date-picker">
                    <input type="number" id="input-year" value="${this.year}">年
                    <input type="number" id="input-month" value="${this.month}">月
                    <input type="number" id="input-day" value="${this.day}">日
                    <button id="calendarBtn" onClick="this.getRootNode().host.shadowRoot.querySelector('#calendar').classList.add('show')">📅</button>
                </div>

                <!-- ➁カレンダー部分 -->
                <div id="calendar" class="modal">

                    <!-- ヘッダー -->
                    <div class="calendar-header">
                        <button id="closeModal" class="close" onClick="this.getRootNode().host.shadowRoot.querySelector('#calendar').classList.remove('show')">×</button>
                        <button id="prev-year" onClick="this.getRootNode().host.changeYear(-1)"> < </button>
                        <span id="current-year">${this.year}</span>
                        <button id="next-year" onClick="this.getRootNode().host.changeYear(1)"> > </button>
                        <button id="checkModal" class="check">✔</button>
                    </div>

                    <!-- 月表示の部分 -->
                    <div class="month-container">
                        ${this.generateMonth()}
                    </div>

                    <!-- 曜日表示の部分 -->
                    <div class="weekdays">
                        <span style="color: red"> sun </span>
                        <span> mon </span>
                        <span> tue </span>
                        <span> wed </span>
                        <span> thu </span>
                        <span> fri </span>
                        <span style="color: blue"> sat </span>
                    </div>

                    <!-- 日付表示の部分 -->
                    <div class="days-grid">
                        ${this.generateDayGrid(this.year, this.month)}
                    </div>

                    <!-- ➂年をスクロールで選択する部分 -->
                    <div id="year-modal" class="modal"></div>

                </div>
            </div>
            `;
    }
}

customElements.define('my-calendar', MyCalendar);