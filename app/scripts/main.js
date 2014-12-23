/* jshint devel:true */
'use strict';

(function() {

    // submit handler to add new names to table
    $('#names').submit(function(e) {
        var name = $(this).find('#personName').val();
        var email = $(this).find('#personEmail').val();

        var nameTD =  $('<td>').text(name);
        var emailTD = $('<td>').text(email);

        if (name !== '' && email !== '') {
            var table = $('#participants');
            table.find('thead').after('<tr>');
            table.find('tbody').append('<tr>');

            table.find('tr').last()
                .append(nameTD)
                .append(emailTD);
        }

    });

    // add click handler to table rows to allow participants
    // to be removed
    $('#participants tbody').on('click', 'tr', function() {
        $(this).remove();
    });

    $('#match').click(function() {
        var table = $('#participants tbody');
        var people = [];
        var matches = [];

        if (table.find('tr').length > 0) {
            people = getPeople(table);
        }

        // if people < 2, findMatches will loop forever
        if (people.length >= 2) {
            matches = findMatches(people);

            for (var i = 0; i < matches.length; i++) {
                sendMail(matches[i]);
            }
            
        };
    });

    function getPeople(table) {
        var rows = table.find('tr');
        var people = rows.map(function(i, e) {

            // for some reason it seems that .find returns
            // raw DOM elements, I don't know why that would be.
            var entries = $(e).find('td');
            var name = entries[0].innerHTML;
            var email = entries[1].innerHTML;
            
            return {'name': name, 'email': email};
        });

        return $.makeArray(people);
    }

    // takes a list of person-email pairs and generates
    // a list of pairings between person-email pairs.
    // don't read this documentation, it's not good.
    function findMatches(people) {
        var peopleCopy = people.slice(0); // fun trick for cloning
        var matches = [];
        var matching = true;
        var broken = false;

        // shuffle until there are no indices in the two lists
        // that match
        while (matching === true) {
            peopleCopy = shuffle(peopleCopy);
            broken = false;
            for (var i = 0; i < peopleCopy.length; i++) {
                if (peopleCopy[i].name === people[i].name) {
                    broken = true;
                    break;
                }
            }
            if (broken !== true) {
                matching = false;
            }
        }

        // console.log('copy: ');
        // console.log(peopleCopy);

        // console.log('original: ');
        // console.log(people);

        for (i = 0; i < people.length; i++) {
            matches.push({'atnas': people[i], 'child': peopleCopy[i]});
        }

        return matches;
    }

    function sendMail(pairing) {

        var atnasName = pairing.atnas.name;
        var atnasEmail = pairing.atnas.email;

        var pairingName = pairing.child.name;
        var pairingEmail = pairing.child.email;

        // build a message with the correct names
        var msg = 'HELLO, ' + atnasName + '\n' +
            'you have been selected to participate in the annual ' +
            'Samtsirch gift exchange. This is a great honor. You ' +
            'shall be providing a gift for the majestic ' + pairingName + '.\n' +
            'Please make sure you are not getting a terrible gift' +
            ', because that makes people feel sad.\n\n' +
            'Sincerely,\nVoidwalker';


        // builds an AJAX request to send mail through maildrill
        $.ajax({
            type: "POST",
            url: 'https://mandrillapp.com/api/1.0/messages/send.json',
            data: {
                'key': 'HxUivpNgtB26DWm79bXFVg',
                'message': {
                    'from_email': 'ianmcgaunn@gmail.com',
                    'from_name': 'Voidwalker Kringle',
                    'to': [
                        {
                            'email': pairingEmail,
                            'name': pairingName,
                            'type': 'to'
                        }
                    ],
                    'autotext': 'true',
                    'subject': 'ATNAS HAS FOUND YOU, HERE IS YOUR DESTINY',
                    'text': msg
                }
            },
        }).done(function(res) {
            console.log(res);
        });
               
    }

    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
     }

})();

