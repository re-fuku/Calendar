
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

            html += 
                `<label class="day">
                    <input type="radio" name="select_day" value="${day}" ${checked}>
                    <span class="day-number">${day}</span>
                </label>
            `;

        }

        return html;
    }

    // 年の選択部分を作成する
    generateYearSelect() {
        let html = '';
        const minYear = parseInt(this.min.split('-')[0]); // 作成する年の下限 
        const maxYear = parseInt(this.max.split('-')[0]); // 作成する年の上限

        for(let year = minYear; year <= maxYear; year++) {
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
        const daysGrid = this.shadowRoot.querySelector('.days-grid');
        const daysInMonth = new Date(this.tmpYear, this.tmpMonth, 0).getDate(); // その月の日数

        // 既に選択されている日付が変更後の月の最大日付より大きかった場合
        if (this.tmpDay > daysInMonth) {
            this.tmpDay = daysInMonth;
        }
        
        daysGrid.innerHTML = this.generateDayGrid(); // 日付を作成しなおす
        
        this.setUpDayListeners() // 日付のラジオボタンを再設定しなおす
    }

    // 日付のラジオボタンにイベントを追加
    setUpDayListeners() {
        const dayRadios = this.shadowRoot.querySelectorAll('input[name="select_day"]');

        dayRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.tmpDay = parseInt(e.target.value);
            })
        })
    }

    // 年を増減する関数
    changeYear(value) {
        this.tmpYear += value;
        this.shadowRoot.querySelector('#current-year').textContent = this.tmpYear;
        this.updateCalendar();
    }


    // 要素がDOMに追加されたときに自動実行される初期化処理
    connectedCallback() {
        this.render();
        this.setUpEventListeners();
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
                    this.tmpMonth = this.tmpMonth > 1 ? this.tmpMonth - 1 : this.tmpMonth;
                    break;
                case 'ArrowRight':
                    this.tmpMonth = this.tmpMonth < 12 ? this.tmpMonth + 1 : this.tmpMonth;
                    break;
            }

            this.shadowRoot.querySelector(`input[name="select_month"][value="${this.tmpMonth}"]`).checked = true; // 月のラジオボタンを更新
            this.updateCalendar(); // カレンダーを更新
        })

        // カレンダーの月のラジオボタンの処理
        this.shadowRoot.querySelectorAll('input[name="select_month"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.tmpMonth = parseInt(e.target.value);
                this.updateCalendar();
            })
        })

        // カレンダーの日付のラジオボタンの処理(再利用するため関数で定義)
        this.setUpDayListeners();

        // カレンダーの日付部分でキー入力をした際の処理
        this.shadowRoot.querySelector('.days-grid').addEventListener('keydown', (e) => {

            const daysInMonth = new Date(this.tmpYear, this.tmpMonth, 0).getDate(); // その月の日数
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.tmpDay = this.tmpDay > 1 ? this.tmpDay - 1 : this.tmpDay;
                    break;
                case 'ArrowRight':
                    this.tmpDay = this.tmpDay < daysInMonth ? this.tmpDay + 1 : this.tmpDay;
                    break;
                case 'ArrowUp':
                    this.tmpDay = this.tmpDay > 7 ? this.tmpDay - 7 : 1;
                    break;
                case 'ArrowDown':
                    this.tmpDay = this.tmpDay <= daysInMonth - 7 ? this.tmpDay + 7 : this.tmpDay;
                    break;
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