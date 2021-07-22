import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { interval } from 'rxjs';

let mainContainer = document.getElementById('main-container');

function formatDateFromTimestamp(timestamp) {
  const d = new Date(timestamp * 1000);

  const addZero = (x) => ((x < 10) ? `0${x}` : x);

  const DD = addZero(d.getDate());
  const MM = addZero(d.getMonth() + 1);
  const YY = addZero(d.getFullYear() % 100);
  const HH = addZero(d.getHours());
  const mm = addZero(d.getMinutes());
  const ss = addZero(d.getSeconds());

  let dateString =  `${HH}:${mm}&nbsp;${DD}.${MM}.${YY}`;
  let completeDate = dateString.replace('&nbsp;', ' ');
  return completeDate;
}


function build(message) {

  console.log(mainContainer.children[0]);

  let messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  let email = document.createElement('p');
  email.classList.add('email-data');
  email.textContent = message.from;

  let subject = document.createElement('p');
  subject.classList.add('subject-data');
  let subjectStringLength = message.subject.length;
  subjectStringLength > 15 ? subject.textContent = `${message.subject.slice(0,16)}...` : subject.textContent = message.subject;

  let date = document.createElement('p');
  date.classList.add('message-date');
  date.textContent = formatDateFromTimestamp(message.received);


  messageContainer.appendChild(email);
  messageContainer.appendChild(subject);
  messageContainer.appendChild(date);

  let firstChildElement = mainContainer.children[0];
  mainContainer.insertBefore(messageContainer, firstChildElement);
  
}

const source = interval(1000);
let sourceObs$ = source.subscribe(() => {
  const obs$ = ajax.getJSON('https://rxjsserver.herokuapp.com/messages/unread').pipe(
    map((userResponse) => {
      console.log('resp', userResponse);
      let messages = userResponse.messages;
      for (let i=0; i<messages.length; i++) {
        build(messages[i]);
      }
    }),
    catchError(error => {
      console.log('error: ', error);
      return of(error);
    }),
  );
  obs$.subscribe();
});

setTimeout(() => sourceObs$.unsubscribe(), 5000);