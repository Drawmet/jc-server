document.getElementById('log_out').onclick = () => {
    fetch('/logout').then(res => res.json()).then(data => {
        if(data)
        {
            redirect: window.location.replace(data.redirect)
        };
    });
};

window.onbeforeunload = () => {
    fetch('/logout').then(res => res.json());
}

document.getElementById("addNewUser").onclick = () => {
    var user = {
        username: document.getElementById('username_input').value,
        name: document.getElementById('name_input').value,
        lastname: document.getElementById('lastname_input').value,
        mail: document.getElementById('mail_input').value,
        phone: document.getElementById('phone_input').value,
        bonus: document.getElementById('bonus_input').value
    };
    fetch('/users/add',{
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(user),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
    }).then(res => {
        location.reload(true);
    });
};

fetch('/users')
    .then(res => res.json())
    .then(data => {
        data.map((user) => {
            addUserRow(user);
            editUser(user);
            removeUser(user);
            removePassword(user);
            document.getElementById('travels_' + user._id).addEventListener("click", (event) => {
                createAddTravelBlock(user);
                document.getElementById('username').innerText = user.username;
                renderTravelTable(user);
            }, false);
        });
    });

renderTravelTable = (user) => {
    
        var table = document.getElementById('travels_body');
        while(table.rows.length > 1){
            table.deleteRow(1);
        }
        user.travelStory.map((travel) => {
            if(travel){
                var row = table.insertRow(1);
                row.insertCell(0);
                row.insertCell(1).innerHTML = travel.nameCasino;
                row.insertCell(2).innerHTML = travel.country;
                row.insertCell(3).innerHTML = travel.dateTravel;
                row.insertCell(4).innerHTML = "<button id='edt_travels_" + travel._id + "' class='btn btn-outline-primary'>Изменить</button>";
                document.getElementById('edt_travels_' + travel._id).addEventListener('click', (event) => {
                    if (travel){
                        document.getElementById('add_casino').value = travel.nameCasino;
                        document.getElementById('add_country').value = travel.country;
                        document.getElementById('datepicker').value = travel.dateTravel;
                        document.getElementById('updateTravel').dataset.travel = travel._id;
                        }
                }, false);
            }
        });
}

addUserRow = (item) => {
    var table = document.getElementById('users_body');
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    cell1.innerHTML = item.username;
    var cell2 = row.insertCell(1);
    cell2.innerHTML = item.name;
    var cell3 = row.insertCell(2);
    cell3.innerHTML = item.lastname;
    var cell4 = row.insertCell(3);
    cell4.innerHTML = item.mail;
    var cell5 = row.insertCell(4);
    cell5.innerHTML = item.phone;
    var cell6 = row.insertCell(5);
    cell6.innerHTML = item.bonus;
    var cell7 = row.insertCell(6);
    cell7.innerHTML = "<button id='edit_" + item._id + "' class='btn btn-outline-secondary edit_btn'>Изменить</button>" +
    "<button id='travels_" + item._id + "' class='btn btn-outline-primary'>Поездки</button><button id='password_" + item._id +
     "' class='btn btn-outline-warning'>Сбросить пароль</button><button id='remove_" + item._id +
     "' class='btn btn-outline-danger'>Удалить</button>";
};

createAddTravelBlock = (user) => {
    var table = document.getElementById('travels_body');
    var addRow = table.insertRow(0);
    addRow.insertCell(0);
    addRow.insertCell(1).innerHTML = "<input type='text' class='form-control' id='add_casino' placeholder='Добавить казино' />";
    addRow.insertCell(2).innerHTML = "<input type='text' class='form-control' id='add_country' placeholder='Добавить страну' />";
    addRow.insertCell(3).innerHTML = "<input id='datepicker' width='276' />";
    addRow.insertCell(4).innerHTML = "<button id='addTravel' data-user=" + user._id + " class='btn btn-outline-secondary'>Добавить</button>" +
    "<button id='updateTravel' class='btn btn-outline-secondary'>Сохранить</button>";
    
    $('#datepicker').datepicker({
        uiLibrary: 'bootstrap4',
        iconsLibrary: 'fontawesome'
    });

    document.getElementById('addTravel').onclick = () => {
        user.travelStory.push({
            nameCasino: document.getElementById('add_casino').value,
            country: document.getElementById('add_country').value,
            dateTravel: document.getElementById('datepicker').value
        });
        fetch('/travels/add',{
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(user),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
        }).then(res => res.json()).then(data => {
                var Row = document.getElementById('travels_body').insertRow(1);
                Row.insertCell(0);
                Row.insertCell(1).innerHTML = document.getElementById('add_casino').value;
                Row.insertCell(2).innerHTML = document.getElementById('add_country').value;
                Row.insertCell(3).innerHTML = document.getElementById('datepicker').value;
                Row.insertCell(4).innerHTML = "<button id='edt_travels_" + data + "' class='btn btn-outline-primary'>Изменить</button>";
        });
    };

    document.getElementById('updateTravel').onclick = () => {
        var travelId = document.getElementById('updateTravel').dataset.travel;
        if(travelId){
            var newTravelStory = user.travelStory.filter((obj) => {
               return obj._id !== travelId;
            });
            newTravelStory.push({
                _id: travelId,
                nameCasino: document.getElementById('add_casino').value,
                country: document.getElementById('add_country').value,
                dateTravel: document.getElementById('datepicker').value
            });
            user.travelStory = newTravelStory;
        }
        fetch('/travels/edit',{
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(user),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
        }).then(res => res.json()).then(data => {
            user = data;
            renderTravelTable(user);
        });
    };
};

removePassword = (user) => {
    document.getElementById('password_' + user._id).addEventListener('click', (event) => {
        fetch('/user/removePassword/',{
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(user),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
        }).then(res => res.json).then(
            data => {
                alert("Пароль сброшен");
        );
    });
};

removeUser = (user) => {
    document.getElementById('remove_' + user._id).addEventListener('click', (event) => {
        document.getElementById('users_body').deleteRow(0);
        fetch('/users/remove/',{
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({_id: user._id}),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
        }).then(res => {
            
        });
    });
};

editUser = (user) => {
    document.getElementById('edit_' + user._id).addEventListener("click", (event) => {
        document.getElementById('username_input').value = user.username;
        document.getElementById('name_input').value = user.name;
        document.getElementById('lastname_input').value = user.lastname;
        document.getElementById('mail_input').value = user.mail;
        document.getElementById('phone_input').value = user.phone;
        document.getElementById('bonus_input').value = user.bonus;
        document.getElementById("editUser").onclick = () => {
            user = {
                _id: user._id,
                username: document.getElementById('username_input').value,
                name: document.getElementById('name_input').value,
                lastname: document.getElementById('lastname_input').value,
                mail: document.getElementById('mail_input').value,
                phone: document.getElementById('phone_input').value,
                bonus: document.getElementById('bonus_input').value,
                travelStory: user.travelStory
            };
            fetch('/users/editUser',{
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify(user),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                  },
            }).then(res => {
                location.reload(true);
            });
        };
    }, false);
    return user;
};