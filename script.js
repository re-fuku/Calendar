
class MyCalendar extends HTMLElement {
    // フィールド
    today = new Date(); // 今日の日付
    min = this.getAttribute('min') // 最小値
    value = this.getAttribute('value') // 初期値
    max = this.getAttribute('max') // 最大値
    tmpYear = parseInt(this.value.split('-')[0]); // 年を一時保存
    tmpMonth = parseInt(this.value.split('-')[1]); // 月を一時保存
    tmpDay = parseInt(this.value.split('-')[2]); // 日を一時保存
    minYear = parseInt(this.min.split('-')[0]); // 最小値の年
    maxYear = parseInt(this.max.split('-')[0]); // 最大値の年
    minMonth = parseInt(this.min.split('-')[1]); // 最小値の月
    maxMonth = parseInt(this.max.split('-')[1]); // 最大値の月
    minDay = parseInt(this.min.split('-')[2]); // 最小値の日
    maxDay = parseInt(this.max.split('-')[2]); // 最大値の日
    nextDay; // 次の日付
    nextMonth; // 次の月

    // コンストラクタ
    constructor() {
        super(); // HTMLElementの初期化
        this.attachShadow({mode: 'open'}); // Shadow DOMの作成
    }

    // カレンダーの月部分を作成する
    generateMonth() {
        let html = '';

        for (let month = 1; month <= 12; month++) {
            const checked = month === this.tmpMonth ? 'checked' : '';
            const disabled = this.isSelectableMonth(this.tmpYear, month) ? '' : 'disabled'; // 選択できない月はdisabledにする
            html += 
                `<label class="month ${disabled}">
                    <input type="radio" name="select_month" value="${month}" ${checked} ${disabled}>
                    <span class="month-number">${month}</span>
                </label>
            `;
        }

        return html;
    }

    // カレンダーの日付部分を作成する
    generateDayGrid() {
        const firstDay = new Date(this.tmpYear, this.tmpMonth - 1, 1).getDay(); // 月の最初の曜日(0=sat)
        const daysInMonth = new Date(this.tmpYear, this.tmpMonth, 0).getDate(); // その月の日数

        let html = '';

        //　月の開始日までの空白セルを追加する
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day empty"></div>';
        }

        // 日付を追加
        for (let day = 1; day <= daysInMonth; day++) {
            const checked = day === this.tmpDay? 'checked' : '';
            const disabled = this.isSelectableDate(this.tmpYear, this.tmpMonth, day) ? '' : 'disabled'; // 選択できない日付はdisabledにする

            html += 
                `<label class="day ${disabled}">
                    <input type="radio" name="select_day" value="${day}" ${checked} ${disabled}>
                    <span class="day-number">${day}</span>
                </label>
            `;

        }

        return html;
    }

    // 年の選択部分を作成する
    generateYearSelect() {
        let html = '';

        for(let year = this.minYear; year <= this.maxYear; year++) {
            const checked = year === this.tmpYear ? 'checked' : '';

            html += 
                `<label class="year">
                    <input type="radio" name="select_year" value="${year}" ${checked}>
                    <span class="year-number">${year}</span>
                </label>
            `;
        }

        return html;
    }

    // カレンダーを更新する
    updateCalendar() {
        const monthContainer = this.shadowRoot.querySelector('.month-container');
        const daysGrid = this.shadowRoot.querySelector('.days-grid');
        const daysInMonth = new Date(this.tmpYear, this.tmpMonth, 0).getDate(); // その月の日数

        // 既に選択されている日付が変更後の月の最大日付より大きかった場合
        if (this.tmpDay > daysInMonth) {
            this.tmpDay = daysInMonth;
        }
        

        monthContainer.innerHTML = this.generateMonth(); // 月を作成しなおす
        daysGrid.innerHTML = this.generateDayGrid(); // 日付を作成しなおす

        this.setUpMonthListeners(); // 月のラジオボタンにイベントを追加しなおす
        this.setUpDayListeners(); // 日付のラジオボタンにイベントを追加しなおす
    }

    // 日付のラジオボタンにイベントを追加
    setUpDayListeners() {
        const dayRadios = this.shadowRoot.querySelectorAll('input[name="select_day"]');
        
        dayRadios.forEach(radio => {
            radio.addEventListener('click', (e) => {
                this.nextDay = parseInt(e.target.value);

                if (this.isSelectableDate(this.tmpYear, this.tmpMonth, this.nextDay)) {
                    this.tmpDay = this.nextDay;
                } 
            })
        })
    }

    // 月のラジオボタンにイベントを追加
    setUpMonthListeners() {
        this.shadowRoot.querySelectorAll('input[name="select_month"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.nextMonth = parseInt(e.target.value);

                if (this.isSelectableMonth(this.tmpYear, this.nextMonth)) {
                    this.tmpMonth = this.nextMonth;
                }

                this.updateCalendar();
            })
        })
    }

    // 年を増減する関数
    changeYear(value) {
        if ((value === -1 && this.tmpYear > this.minYear) || (value === 1 && this.tmpYear < this.maxYear)) {
            this.tmpYear += value;
            this.shadowRoot.querySelector('#current-year').textContent = this.tmpYear;
            this.updateCalendar();
        }
    }


    // 要素がDOMに追加されたときに自動実行される初期化処理
    connectedCallback() {
        this.render();
        this.setUpEventListeners();
    }

    // 選択しようとした日付が選択できるか判定する関数
    isSelectableDate(year, month, day) {
        const selectDate = new Date(year, month - 1, day);
        const flg = new Date(this.min) <= selectDate && selectDate <= new Date(this.max); // 選択しようとした日付がmin以上max以下か
        
        return flg;
    }

    // 選択しようとした月が選択できるか判定する関数
    isSelectableMonth(year, month) {
        const ym = year * 100 + month;
        const minYm = this.minYear * 100 + this.minMonth;
        const maxYm = this.maxYear * 100 + this.maxMonth;
        const flg = minYm <= ym && ym <= maxYm; // 選択しようとした年月がmin以上max以下か

        return flg;
    }

    // イベントを作成する関数
    setUpEventListeners() {
        // ------------------------------------ //
        // ➀日付入力画面
        // ------------------------------------ //

        // カレンダーアイコンをクリックした際の処理
        this.shadowRoot.querySelector('#calendarBtn').addEventListener('click', () => {
            this.shadowRoot.querySelector('#calendar').classList.add('show');
            this.shadowRoot.querySelector('#current-year').focus();
        });

        // ------------------------------------ //
        // ➁カレンダー画面
        // ------------------------------------ //

        // カレンダーの[×]ボタンをクリックした際の処理
        this.shadowRoot.querySelector('#closeModal').addEventListener('click', () => {
            this.shadowRoot.querySelector('#calendar').classList.remove('show');
        });

        // カレンダーの[<]ボタンををクリックした際の処理
        this.shadowRoot.querySelector('#prev-year').addEventListener('click', () => {
            this.changeYear(-1);
        });

        // カレンダーの[>]ボタンををクリックした際の処理
        this.shadowRoot.querySelector('#next-year').addEventListener('click', () => {
            this.changeYear(1);
        });

        // カレンダーの年の部分をクリックした際の処理
        this.shadowRoot.querySelector('#current-year').addEventListener('click', () => {
            this.shadowRoot.querySelector('#year-modal').classList.add('show');
            this.shadowRoot.querySelector('#year-modal').focus();
        });

        // カレンダーの✔がクリックされた際の処理
        this.shadowRoot.querySelector('#checkModal').addEventListener('click',() => {
            // "day-picker"のinputにそれぞれ値を登録する
            this.shadowRoot.querySelector('#input-year').value = this.tmpYear;
            this.shadowRoot.querySelector('#input-month').value = this.tmpMonth;
            this.shadowRoot.querySelector('#input-day').value = this.tmpDay;

            // ➁カレンダーを閉じる
            this.shadowRoot.querySelector('#calendar').classList.remove('show')
        })

        // カレンダーの月部分でキー入力した際の処理
        this.shadowRoot.querySelector('.month-container').addEventListener('keydown',(e) => {  
            switch(e.key) {
                case 'ArrowLeft':
                    this.nextMonth = this.tmpMonth > 1 ? this.tmpMonth - 1 : this.tmpMonth;
                    break;
                case 'ArrowRight':
                    this.nextMonth = this.tmpMonth < 12 ? this.tmpMonth + 1 : this.tmpMonth;
                    break;
            }

            if (this.isSelectableMonth(this.tmpYear, this.nextMonth)) {
                this.tmpMonth = this.nextMonth;
            }

            this.shadowRoot.querySelector(`input[name="select_month"][value="${this.tmpMonth}"]`).checked = true; // 月のラジオボタンを更新
            this.updateCalendar(); // カレンダーを更新
        })

        // カレンダーの月のラジオボタンをクリックした際の処理
        this.setUpMonthListeners();

        // カレンダーの日付部分をクリックした際の処理
        this.setUpDayListeners();


        // カレンダーの日付部分でキー入力をした際の処理
        this.shadowRoot.querySelector('.days-grid').addEventListener('keydown', (e) => {

            const daysInMonth = new Date(this.tmpYear, this.tmpMonth, 0).getDate(); // その月の日数
            switch (e.key) {
                case 'ArrowLeft':
                    this.nextDay = this.tmpDay > 1 ? this.tmpDay - 1 : this.tmpDay;
                    break;
                case 'ArrowRight':
                    this.nextDay = this.tmpDay < daysInMonth ? this.tmpDay + 1 : this.tmpDay;
                    break;
                case 'ArrowUp':
                    this.nextDay = this.tmpDay > 7 ? this.tmpDay - 7 : 1;
                    break;
                case 'ArrowDown':
                    this.nextDay = this.tmpDay <= daysInMonth - 7 ? this.tmpDay + 7 : this.tmpDay;
                    break;
            }

            if (this.isSelectableDate(this.tmpYear, this.tmpMonth, this.nextDay)) {
                this.tmpDay = this.nextDay;
            }            

            this.shadowRoot.querySelector(`input[name="select_day"][value="${this.tmpDay}"]`).checked = true;
        })

        // ------------------------------------ //
        // ➂年を選択する画面
        // ------------------------------------ //

        // 年を選択するラジオボタンを選択した際の処理
        this.shadowRoot.querySelectorAll('input[name="select_year').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.tmpYear = parseInt(e.target.value);
                this.shadowRoot.querySelector('#current-year').textContent = this.tmpYear;
                this.shadowRoot.querySelector('#year-modal').classList.remove('show');
                this.updateCalendar();
            })

            radio.addEventListener('click', () => {
                this.shadowRoot.querySelector('#year-modal').classList.remove('show');
            })
        })

        // 年選択画面で矢印キーを入力したときの処理
        this.shadowRoot.querySelector('#year-modal').addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.tmpYear = this.tmpYear > this.minYear ? this.tmpYear - 1 : this.tmpYear;
                    break;
                case 'ArrowDown':
                    this.tmpYear = this.tmpYear < this.maxYear ? this.tmpYear + 1 : this.tmpYear;
                    break;
                case 'Enter':
                    this.tmpYear = this.tmpYear;
                    this.shadowRoot.querySelector('#current-year').textContent = this.tmpYear;
                    this.shadowRoot.querySelector('#year-modal').classList.remove('show');

                    // 年選択画面を閉じた後にすぐ時間を置かないと再度年選択画面を開くため調整する
                    setTimeout(() => {
                        this.shadowRoot.querySelector('#current-year').focus();
                    }, 100);
                    break;
            }

            this.shadowRoot.querySelector(`input[name="select_year"][value="${this.tmpYear}"]`).checked = true;
            this.updateCalendar();
        })
    }

    // カレンダー全体のHTMLを生成してShadow DOMに描画する
    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="style.css">

            <!-- shadow DOMのルートを取得し定義する -->
            <script>window.shRoot = document.currentScript.getRootNode();</script>

            <!-- アプリの大枠の部分(基準値) -->
            <div id="app-container">
                <!-- ➀日付入力部分 -->
                <div class="date-picker">
                    <input type="number" id="input-year" value="${this.tmpYear}">年
                    <input type="number" id="input-month" value="${this.tmpMonth}">月
                    <input type="number" id="input-day" value="${this.tmpDay}">日
                    <button id="calendarBtn" tabIndex="0"></button>
                </div>

                <!-- ➁カレンダー部分 -->
                <div id="calendar" class="modal">

                    <!-- ヘッダー -->
                    <div class="calendar-header">
                        <button id="closeModal" class="close"></button>
                        <button id="prev-year"></button>
                        <button id="current-year">${this.tmpYear}</button>
                        <button id="next-year"></button>
                        <button id="checkModal" class="check"></button>
                    </div>

                    <!-- 月表示の部分 -->
                    <div class="month-container focusable" tabIndex="0">
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
                    <div class="days-grid focusable" tabIndex="0">
                        ${this.generateDayGrid(this.tmpYear, this.tmpMonth)}
                    </div>

                    <!-- ➂年をスクロールで選択する部分 -->
                    <div id="year-modal" class="modal" tabIndex="0">
                        ${this.generateYearSelect()}
                    </div>

                </div>
            </div>
            `;
    }
}

customElements.define('my-calendar', MyCalendar);