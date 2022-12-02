const DEBUG_MODE = false;

const INITIAL_LIVES = 3;
let currentData = null;

const topCardColor = 'has-background-warning-light';
const topCardSize = 'is-5';
const bottomCardSize = 'is-3';
const bottomCardColor = 'has-background-white-ter';
const wrongBottomCardColor = 'has-background-danger-light';

const dragulaObj = dragula([document.getElementById('top-card'), document.getElementById('bottom-cards')], {
    moves: function (el, source, handle, sibling) {
        return source.id === 'top-card';
    },
});

dragulaObj.on('drop', function (el, target, source, sibling) {
    checkDrop(el, target, source, sibling);
});

document.addEventListener("DOMContentLoaded", function (event) {
    restartGame();
});

function restartGame() {
    document.getElementById('game-update').classList.add('is-hidden');
    document.querySelector('#bottom-cards').innerHTML = '';
    currentData = getShuffledData();
    document.getElementById('score').innerText = '0';
    document.getElementById('curr-lives').innerText = INITIAL_LIVES.toString();
    document.getElementById('initial-lives').innerText = INITIAL_LIVES.toString();
    const firstEvent = currentData.shift();
    cardToBottom(firstEvent);
    newTurn();
}

function endGame() {
    document.getElementById('game-update').classList.remove('is-hidden');
    window.scrollTo(0, 0);
}

function newTurn() {
    const newEvent = currentData.shift();
    cardToTop(newEvent);
}

function checkDrop(el, target, source, sibling) {

    revealDate(el);

    const elDate = parseDateStr(el?.querySelector('.event-date')?.innerText);
    const prevDate = parseDateStr(el?.previousElementSibling?.querySelector('.event-date')?.innerText);
    const nextDate = parseDateStr(sibling?.querySelector('.event-date')?.innerText);

    let guessCorrect = true;

    if(prevDate && elDate < prevDate) {
        guessCorrect = false;
    }

    if(nextDate && elDate > nextDate) {
        guessCorrect = false;
    }

    el.querySelector('.card').classList.remove(topCardColor);
    el.classList.remove(topCardSize);
    if (guessCorrect) {
        incScore();
        el.querySelector('.card').classList.add(bottomCardColor);
    } else {
        decLive();
        el.querySelector('.card').classList.add(wrongBottomCardColor);
        moveToCorrectPlace(elDate, el, target);
    }

    const bottomCards = document.querySelectorAll('#bottom-cards>.column').length;
    if(bottomCards < 5) {
        document.querySelectorAll('#bottom-cards>.column').forEach(c => {
            c.classList.add(bottomCardSize);
        });
    } else {
        document.querySelectorAll('#bottom-cards>.column').forEach(c => {
            c.classList.remove(bottomCardSize);
        });
    }

    newTurn();
}

function cardToBottom(event) {
    const c = createCard(event[1], event[0], true);
    document.querySelector('#bottom-cards').innerHTML += c;
    document.querySelectorAll('#bottom-cards>.column').forEach(c => {
        c.classList.add(bottomCardSize);
    });
}

function cardToTop(event) {
    const c = createCard(event[1], event[0], false);
    document.querySelector('#top-card').innerHTML = c;
    document.querySelector('#top-card').querySelector('.column').classList.add(topCardSize);
}

function getShuffledData() {
    let cloned = JSON.parse(JSON.stringify(GAME_DATA));
    shuffleArray(cloned)
    return cloned;
}

function moveToCorrectPlace(elDate, el, target) {

    let inserted = false;
    console.log('..........');
    target.querySelectorAll('.column').forEach(c => {

        console.log('checking');
        console.log(c.querySelector('.event-date')?.innerText);

        const curDate = parseDateStr(c.querySelector('.event-date')?.innerText);
        if(!inserted && curDate && curDate > elDate) {
            inserted = true;
            target.insertBefore(el, c);
        }

    });

    if(!inserted) {
        target.appendChild(el);
    }
}

function createCard(content, date, displayDate) {

    const invClass = DEBUG_MODE ? '' : 'is-invisible';
    const dd = displayDate ? '' : invClass;
    const dateContent = `<div class="mb-2 date-controller ${dd}"><strong>${date}</strong></div>`;
    const color = displayDate ? bottomCardColor : topCardColor;
    return `<div class="column">
                <div class="card ${color}">
                    <div class="card-content pt-1">
                        <div class="content">
                            <span class="event-date">${dateContent}</span>
                            ${marked.parse(content)}
                        </div>
                    </div>
                </div>
            </div>`;

}

function revealDate(el) {
    el.querySelector('.date-controller').classList.remove("is-invisible");
}

function incScore() {
    const score = document.getElementById('score');
    const curr = 1 + parseInt(score.innerText);
    score.innerText = curr.toString();
}

function decLive() {
    const lives = document.getElementById('curr-lives');
    const curr = -1 + parseInt(lives.innerText);

    lives.innerText = curr.toString();

    if(curr < 1) {
        endGame();
    }

}

/**
 * 19th December 1991 -> 1991-12-19
 */
function parseDateStr(dateStr) {

    if(!dateStr) return null;

    const parts = dateStr.split(' ');
    let d = parts[2] + '-';
    d += parts[1].replace('January', '01').replace('February', '02').replace('March', '03').replace('April', '04').replace('May', '05').replace('June', '06').replace('July', '07').replace('August', '08').replace('September', '09').replace('October', '10').replace('November', '11').replace('December', '12');
    d += '-' + parts[0].slice(0, -2).padStart(2, '0');
    return Date.parse(d);
}

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}