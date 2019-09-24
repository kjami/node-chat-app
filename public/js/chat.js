/* global io, $, Mustache, moment, Qs */
const socket = io();
const $message = $('#send-message');
const $formButton = $('#form-button');
const $button = $('#send-location');
const $messages = $('#messages');
const $messageTemplate = $('#message-template');
const $locationTemplate = $('#location-template');
const $sidebarTemplate = $('#list-of-users-template');
const $sidebar = $('.chat__sidebar');


//Get options from query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const scrollToBottom = () => {
    $messages.scrollTop($messages.prop("scrollHeight"));
}

const newMessage = (message) => {
    const res = { 
        ...message,
        createdAt: moment(message.createdAt).format('h:mm a')
    };
    return res;
};

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', (options) => {
    const html = Mustache.render($sidebarTemplate.html(), options);
    $sidebar.html(html);
});

socket.on('message', (actualMessage) => {
    const message = newMessage(actualMessage);
    const html = Mustache.render($messageTemplate.html(), message);
    $messages.append(html);
    scrollToBottom();
});

socket.on('locationMessage', (actualMessage) => {
    const message = newMessage(actualMessage);
    const html = Mustache.render($locationTemplate.html(), message);
    $messages.append(html);
    scrollToBottom();
});

$("#submit").on('submit', (ev) => {
    ev.preventDefault();
    const val = $message.val();
    if (val) {
        $formButton.attr('disabled', "disabled");
        socket.emit('sendMessage', val, (message) => {
            $formButton.removeAttr('disabled');
            // eslint-disable-next-line no-console
            console.log(message);
        });
        $message.val('').focus();
    } else {
        // eslint-disable-next-line no-alert
        alert('Please enter a message!');
    }
    return false;
});

$button.on("click", () => {
    if (!navigator || !navigator.geolocation) {
        // eslint-disable-next-line no-alert
        alert('Geolocation not supported!!');
    } else {
        $button.attr('disabled', "disabled");
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            socket.emit('sendLocation', {
                latitude,
                longitude
            }, (error) => {
                $button.removeAttr('disabled');
                if (error) {
                    // eslint-disable-next-line no-alert
                    alert('Location cannot be shared!');
                }
            });
        }, (error) => {
            $button.removeAttr('disabled');
            // eslint-disable-next-line no-alert
            alert('Unable to fetch the location!');
        }, { 
            timeout: 5000 
        });
    }
});